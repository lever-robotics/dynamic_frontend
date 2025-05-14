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
import { memo, useCallback, useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface ChatDisplayProps {
	onClose?: () => void;
	sendOnConnect?: () => Payload;
	launchMessage?: string;
	setLaunchMessage?: (message: string) => void;
}

export const ChatDisplay = memo(function ChatDisplay({
	onClose,
	sendOnConnect,
	launchMessage,
	setLaunchMessage,
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
		setSelectedTool,
		updateArtifact,
		messages,
	} = useWorkspace();
	const [localMessages, setLocalMessages] = useState<MessageBubble[]>(messages);

	// Handle incoming WebSocket messages
	const handleMessage = useCallback(
		(wsMessage: WebSocketMessage) => {
			const { payload, messageId } = wsMessage;

			console.log("[ChatDisplay] Received message:", payload);

			switch (payload.type) {
				case "text": {
					const newChunk: MessageChunkBubble = {
						content: (payload as MessageChunk).content,
					};

					const updatedMessages = [...localMessages];
					const messageIndex = updatedMessages.length - 1;

					if (updatedMessages[messageIndex]?.type === "assistant") {
						updatedMessages[messageIndex].chunks.push(newChunk);
					} else {
						updatedMessages.push({
							id: messageId,
							type: "assistant",
							chunks: [newChunk],
							orderIndex: updatedMessages.length,
						});
					}

					setLocalMessages(updatedMessages);

					break;
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

						pushMessages(localMessages);
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
								} else {
									addArtifact("document", report);
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
						default: {
							console.log(`Unhandled tool type: ${tool}`);
							break;
						}
					}

					if (toolChunk.status === "complete") {
						const newMessage: MessageBubble = {
							id: messageId,
							type: "tool",
							chunks: [newChunk],
							orderIndex: localMessages.length,
						};
						setLocalMessages((prev) => [...prev, newMessage]);
					}
					break;
				}
			}
		},
		[addArtifact, updateArtifact, pushMessages, artifacts, localMessages],
	);

	// WebSocket connection with message handling
	const { isConnected, error, sendMessage } = useWebSocket({
		onMessage: handleMessage,
	});

	console.log("[ChatDisplay] launchMessage: ", launchMessage);
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

				if (launchMessage !== "") {
					// In launch mode, start fresh with just this message
					handleNewMessage(launchMessage);
					setLaunchMessage?.("");
				}

				console.log("[ChatDisplay] Initialization complete");
			} catch (error) {
				console.error("[ChatDisplay] Error during initialization:", error);
			}
		}
	}, [
		isConnected,
		launchMessage,
		// isInitialized,
		sendMessage,
		sendOnConnect,
		setLaunchMessage,
	]); //Execute on is connected

	// Handle new user messages
	const handleNewMessage = async (content: string) => {
		console.log("[ChatDisplay] Handling new message:", content);
		const userMessageId = crypto.randomUUID();

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
					(tool) => {
						setSelectedTool?.(tool);
					},
					[setSelectedTool],
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
								setPotentialResponses([]);
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
