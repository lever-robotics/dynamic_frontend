import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import type {
	AgentChunk,
	MessageBubble,
	MessageChunk,
	MessageChunkBubble,
	Payload,
	ToLLMMessage,
	ToolChunk,
	ToolExecutionBubble,
	WebSocketMessage,
} from "@/types/chat";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { memo, useCallback, useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface ChatDisplayProps {
	onClose?: () => void;
	sendOnConnect?: () => Payload;
}

export const ChatDisplay = memo(function ChatDisplay({
	onClose,
	sendOnConnect,
}: ChatDisplayProps) {
	// const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
	// const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	// const [isInitializing, setIsInitializing] = useState(false);
	// const [hasInitialized, setHasInitialized] = useState(false);
	const [potentialResponses, setPotentialResponses] = useState<string[]>([]);
	// const [isInitialized, setIsInitialized] = useState(false);
	const {
		state: { artifacts },
		pushMessages,
		addArtifact,
		setCurrentArtifactById,
		updateArtifact,
		fetchThreadMessages,
		currentThreadName,
		messages,
	} = useWorkspace();
	const { userConfig, upsertUserConfig } = useUserConfig();
	const [localMessages, setLocalMessages] = useState<MessageBubble[]>(messages);

	// Handle incoming WebSocket messages
	const handleMessage = useCallback(
		async (wsMessage: WebSocketMessage) => {
			const { payload, messageId } = wsMessage;

			console.log("[ChatDisplay] Received message:", payload);

			switch (payload.type) {
				case "text": {
					const newChunk: MessageChunkBubble = {
						content: (payload as MessageChunk).content,
					};

					setLocalMessages((prev) => {
						const lastMessage = prev[prev.length - 1];
						if (lastMessage?.type === "assistant") {
							lastMessage.chunks.push(newChunk);
							return [...prev];
						}

						return [
							...prev,
							{
								id: messageId,
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
					console.log(
						"[ChatDisplay] Agent status update:",
						agentChunk.name,
						agentChunk.status,
					);
					if (agentChunk.status === "complete") {
						console.log("[ChatDisplay] Final message received:", payload);

						setLocalMessages((prev) => {
							pushMessages(prev);
							return prev;
						});
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

					const newChunk: MessageChunkBubble = {
						toolCall: {
							tool,
							arguments: toolArgs,
							status: toolChunk.status,
							result,
							error: toolChunk.error,
							artifactId: artifacts.documents[0]?.id,
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
									"[ChatDisplay] Error handling potential responses:",
									error,
								);
							}
							return;
						}
						case "write_bi_report": {
							const report = toolArgs.report;
							if (report) {
								console.log("[ChatDisplay] Updating first document:", report);
								const firstDocument = artifacts.documents[0];
								if (firstDocument) {
									updateArtifact({
										...firstDocument,
										content: report,
									});
									artifacts.documents[0] = {
										...firstDocument,
										content: report,
									};
									newChunk.toolCall.artifactId = firstDocument.id;
								} else {
									// Create new document and get its ID
									const artifactId = await addArtifact("document", report);
									if (artifactId) {
										newChunk.toolCall.artifactId = artifactId;
									}
								}
							}
							break;
						}
						case "agent_execute_python_code": {
							if (image) {
								console.log("[ChatDisplay] Adding image:", image);
								addArtifact?.("image", image);
							}
							break;
						}
						case "agent_execute_sql_query": {
							if (result) {
								console.log("[ChatDisplay] Adding query:", result);
								addArtifact?.("query", result);
							}
							break;
						}
						case "agent_execute_bigquery": {
							if (result) {
								console.log("[ChatDisplay] Adding query:", result);
								addArtifact?.("query", result);
							}
							break;
						}

						case "agent_update_business": {
							const new_business_plan = result; // The function outputs the new business plan
							console.log(
								"[ChatDisplay] New business plan created:",
								new_business_plan,
							);

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
						default: {
							console.log(`Unhandled tool type: ${tool}`);
							break;
						}
					}

					if (toolChunk.status === "complete") {
						setLocalMessages((prev) => {
							const newMessage: MessageBubble = {
								id: messageId,
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
		},
		[
			addArtifact,
			updateArtifact,
			artifacts,
			pushMessages,
			upsertUserConfig,
			userConfig,
		],
	);

	// WebSocket connection with message handling
	const { isConnected, error, sendMessage } = useWebSocket({
		onMessage: handleMessage,
	});

	// Initialize when all conditions are met
	useEffect(() => {
		if (isConnected) {
			console.log("[ChatDisplay] Conditions met, attempting initialization");
			try {
				// Send initial connection message in both modes
				// setIsInitialized(true);
				const msg = sendOnConnect();
				console.log("[ChatDisplay] Sending initial connection message:", msg);
				sendMessage(msg.type, msg);

				if (localMessages.length === 0) {
					handleNewMessage(currentThreadName);
				}

				console.log("[ChatDisplay] Initialization complete");
			} catch (error) {
				console.error("[ChatDisplay] Error during initialization:", error);
			}
		}
	}, [
		isConnected,
		sendMessage,
		sendOnConnect,
		localMessages,
		currentThreadName,
	]); //Execute on is connected

	// Handle new user messages
	const handleNewMessage = async (content: string) => {
		console.log("[ChatDisplay] Handling new message:", content);
		const userMessageId = crypto.randomUUID();

		// Add user message to both local and workspace state
		const userMessage: MessageBubble = {
			id: userMessageId,
			type: "user",
			chunks: [{ content }],
			orderIndex: localMessages.length,
		};

		const updatedMessages = [...localMessages];
		updatedMessages.push(userMessage);
		await pushMessages(updatedMessages);
		setLocalMessages(updatedMessages);
		setPotentialResponses([]);

		console.log("[ChatDisplay] Sending message to LLM");
		sendMessage("toLLM", { type: "toLLM", text: content } as ToLLMMessage);
	};

	console.log("[ChatDisplay] localMessages:", localMessages);

	return (
		<div className="flex flex-col h-full bg-[#F4F5F7]">
			{/* Header */}
			{/* <div className="flex items-center justify-between border-b p-4 bg-white">
				<div className="flex items-center gap-2">
					{!isLaunchMode && (
						<>
							<div
								className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"
									}`}
							/>
							<span className="text-sm text-gray-600">
								{isConnected ? "Connected" : "Connecting..."}
							</span>
						</>
					)}
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						type="button"
					>
						✕
					</button>
				)}
			</div> */}

			{/* Messages */}
			<MessageList
				messages={localMessages}
				onToolSelect={useCallback(
					(tool: ToolExecutionBubble) => {
						if (tool.artifactId) {
							setCurrentArtifactById(tool.artifactId);
						}
					},
					[setCurrentArtifactById],
				)}
			/>

			{/* Potential Responses */}
			{potentialResponses.length > 0 && (
				<div className="flex flex-wrap gap-2 p-4">
					{potentialResponses.map((response) => (
						<button
							key={response}
							type="button"
							onClick={() => {
								handleNewMessage(response);
							}}
							className="px-4 py-2 text-sm text-primary border border-primary/20 rounded-full hover:bg-primary/10 transition-colors"
						>
							{response}
						</button>
					))}
				</div>
			)}

			{/* Chat Input */}
			<ChatInput
				isConnected={isConnected}
				onSubmit={handleNewMessage}
				error={error}
			/>
		</div>
	);
});
