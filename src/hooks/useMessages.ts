import { useWorkspace } from "@/contexts/WorkspaceContext";
import type {
	AgentChunk,
	MessageBubble,
	MessageChunk,
	MessageChunkBubble,
	Payload,
	ToLLMMessage,
	ToolChunk,
	WebSocketMessage,
	WebSocketMessageType,
} from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";
import { supabase } from "@/utils/SupabaseClient";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "./useWebSocket";

// const API_BASE_URL = import.meta.env.VITE_API_URL;
// const WS_URL =
// 	API_BASE_URL?.replace("https", "wss").replace("http", "ws") ||
// 	"ws://localhost:8000";

export function useMessages(sendOnConnect?: () => Payload) {
	const { getValidToken, userId } = useAuth();
	const {
		currentThreadId,
		currentThreadName,
		artifacts,
		updateArtifact,
		addArtifact,
	} = useWorkspace();
	const { userConfig, upsertUserConfig, updateConnectionMeta } =
		useUserConfig();
	const [messages, setMessages] = useState<MessageBubble[]>([]);
	const [potentialResponses, setPotentialResponses] = useState<string[]>([]);

	const pushMessages = async (updatedMessages: MessageBubble[]) => {
		try {
			const lastUserMessageIndex = [...updatedMessages]
				.reverse()
				.findIndex((message) => message.type === "user");
			const messagesToSave = updatedMessages.slice(lastUserMessageIndex);
			const { error } = await supabase
				.from("thread_messages")
				.upsert(
					messagesToSave.map((message) => ({
						id: message.id,
						thread_id: currentThreadId,
						message_type: message.type,
						content: message,
						order_index: message.orderIndex,
					})),
				)
				.select();

			if (error) {
				console.error("[useMessages] Error adding messages:", error);
			}
		} catch (err) {
			console.error("[useMessages] Error adding messages:", err);
		}
	};

	// Handle incoming WebSocket messages
	const handleMessage = async (wsMessage: WebSocketMessage) => {
		const { payload, messageId } = wsMessage;

		switch (payload.type) {
			case "text": {
				const newChunk: MessageChunkBubble = {
					content: (payload as MessageChunk).content,
				};

				setMessages((prev) => {
					const lastMessage = prev[prev.length - 1];
					if (lastMessage?.type === "assistant") {
						lastMessage.chunks.push(newChunk);
						return [...prev];
					}

					return [
						...prev,
						{
							id: crypto.randomUUID(),
							type: "assistant",
							chunks: [newChunk],
							orderIndex: prev.length,
						},
					];
				});

				return;
			}
			case "agent": {
				// Keep agent logic for tracking purposes but don't display
				const agentChunk = payload as AgentChunk;
				if (agentChunk.status === "complete") {
					pushMessages(messages);
				}
				break;
			}
			case "tool": {
				const toolChunk = payload as ToolChunk;
				const tool = toolChunk.tool;
				const result = toolChunk.result;
				const image = toolChunk.image;
				const toolArgs =
					typeof toolChunk.arguments === "string"
						? JSON.parse(toolChunk.arguments)
						: toolChunk.arguments;

				const id = crypto.randomUUID();

				const newChunk: MessageChunkBubble = {
					toolCall: {
						tool,
						arguments: toolArgs,
						status: toolChunk.status,
						result,
						error: toolChunk.error,
					},
				};

				switch (tool) {
					case "agent_user_potential_responses": {
						try {
							if (
								toolArgs &&
								typeof toolArgs === "object" &&
								"potential_responses" in toolArgs
							) {
								setPotentialResponses(toolArgs.potential_responses);
							}
						} catch (error) {
							console.error(
								"[useMessages] Error handling potential responses:",
								error,
							);
						}
						return;
					}
					case "write_bi_report": {
						const report = toolArgs.report;
						if (report) {
							const firstDocument = artifacts.documents[0];
							if (firstDocument) {
								updateArtifact({
									...firstDocument,
									content: report,
								});
								newChunk.toolCall.artifactId = firstDocument.id;
							} else {
								// Create new document and get its ID
								const artifact = await addArtifact("document", report, id);
							}
						}
						break;
					}
					case "agent_execute_python_code": {
						if (image) {
							addArtifact("image", image, id);
						}
						break;
					}
					case "agent_execute_sql_query": {
						if (result) {
							addArtifact("query", result, id);
						}
						break;
					}
					case "agent_execute_bigquery": {
						if (result) {
							addArtifact("query", result, id);
						}
						break;
					}

					case "agent_update_business": {
						const new_business_plan = result; // The function outputs the new business plan

						// Update the business plan in user config
						if (userConfig) {
							upsertUserConfig({
								...userConfig,
								business_overview: new_business_plan,
							}).catch((error) => {
								console.error(
									"[ChatDisplay] Failed to update business plan:",
									error,
								);
							});
						}
						break;
					}

					case "agent_write_meta_file": {
						const meta_file_json = toolArgs.meta_file_json;
						const connection_id = toolArgs.connection_id;
						const meta_data = JSON.parse(meta_file_json);
						// Set the meta file in the specific connector
						const connector = userConfig.data_connectors.find(
							(connector) => connector.id === connection_id,
						);
						if (connector) {
							await updateConnectionMeta(connection_id, meta_data);
						}
						break;
					}
					default: {
						break;
					}
				}

				if (toolChunk.status === "complete") {
					setMessages((prev) => {
						const newMessage: MessageBubble = {
							id: id,
							type: "tool",
							chunks: [newChunk],
							orderIndex: prev.length,
						};
						return [...prev, newMessage];
					});
				}
				break;
			}
		}
	};

	const { isConnected, sendMessage } = useWebSocket({
		onMessage: handleMessage,
		onConnect: () => {
			const msg = sendOnConnect();
			sendMessage(msg.type, msg);
		},
		onDisconnect: () => {},
		onError: (error) => console.error("WebSocket error:", error),
	});

	useEffect(() => {
		(async () => {
			try {
				const { data: messages, error } = await supabase
					.from("thread_messages")
					.select("content")
					.eq("thread_id", currentThreadId)
					.order("created_at", { ascending: true });

				if (error) throw error;

				setMessages(messages.map((m) => m.content));

				if (messages.length === 0) {
					handleNewMessage(currentThreadName);
				}
			} catch (err) {
				console.error("[useMessages] Error fetching messages:", err);
				throw err;
			}
		})();
	}, [currentThreadId, currentThreadName]);

	const handleNewMessage = async (content: string) => {
		// Add user message to both local and workspace state
		const userMessage: MessageBubble = {
			id: crypto.randomUUID(),
			type: "user",
			chunks: [{ content }],
			orderIndex: messages.length,
		};

		const updatedMessages = [...messages];
		updatedMessages.push(userMessage);
		await pushMessages(updatedMessages);
		setMessages(updatedMessages);
		setPotentialResponses([]);

		sendMessage("toLLM", { type: "toLLM", text: content } as ToLLMMessage);
	};

	return {
		isConnected,
		messages,
		potentialResponses,
		handleNewMessage,
	};
}
