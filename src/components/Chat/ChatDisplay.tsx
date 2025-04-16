import { useState, useCallback, useEffect, memo } from "react";
import type {
	MessageBubble,
	WebSocketMessage,
	ToolExecutionBubble,
	MessageChunk,
	ToLLMMessage,
	AgentChunk,
	ToolChunk,
	MessageChunkBubble,
	Payload,
} from "@/types/chat";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface ChatDisplayProps {
	onClose?: () => void;
	sendOnConnect?: () => Payload;
	onToolSelect?: (tool: ToolExecutionBubble) => void;
	addArtifact?: (type: 'image' | 'document' | 'query', content: string) => Promise<void>;
	isLaunchMode?: boolean;
	onLaunchComplete?: (threadId: string) => void;
}

export const ChatDisplay = memo(function ChatDisplay({
	onClose,
	sendOnConnect,
	onToolSelect,
	addArtifact,
	isLaunchMode = false,
	onLaunchComplete,
}: ChatDisplayProps) {
	const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
	const [localMessages, setLocalMessages] = useState<MessageBubble[]>([]);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [isInitializing, setIsInitializing] = useState(false);
	const { state: { messages, currentThreadId }, addMessage, createThread } = useWorkspace();

	// Load messages when thread changes
	useEffect(() => {
		if (currentThreadId) {
			console.log('Thread changed, loading messages:', messages);
			setIsLoadingMessages(true);
			setLocalMessages(messages);
			setIsLoadingMessages(false);
		} else {
			setLocalMessages([]);
		}
	}, [currentThreadId, messages]);

	// Handle incoming WebSocket messages
	const handleMessage = useCallback(
		(wsMessage: WebSocketMessage) => {
			const { payload, messageId } = wsMessage;
			switch (payload.type) {
				case "text": {
					setLocalMessages((prev) => {
						const messageIndex = prev.length - 1;
						const newChunk: MessageChunkBubble = {
							content: (payload as MessageChunk).content,
						};

						// Append new text chunk to current message
						if (prev[messageIndex]?.type === "assistant") {
							const lastChunkIndex = prev[messageIndex].chunks.length - 1;

							// Merge with the last chunk if it exists
							if (lastChunkIndex >= 0) {
								const updatedChunks = [...prev[messageIndex].chunks];
								updatedChunks[lastChunkIndex] = {
									...updatedChunks[lastChunkIndex],
									content: updatedChunks[lastChunkIndex].content + newChunk.content,
								};

								const updatedMessage = {
									...prev[messageIndex],
									chunks: updatedChunks,
								};
								return [
									...prev.slice(0, messageIndex),
									updatedMessage,
									...prev.slice(messageIndex + 1),
								];
							}

							// If no chunks exist, add the new chunk
							const updatedMessage = {
								...prev[messageIndex],
								chunks: [...prev[messageIndex].chunks, newChunk],
							};
							return [
								...prev.slice(0, messageIndex),
								updatedMessage,
								...prev.slice(messageIndex + 1),
							];
						}

						// Create new message if the last message is an agent
						const newMessage: MessageBubble = {
							id: messageId,
							type: "assistant",
							chunks: [newChunk],
						};
						return [...prev, newMessage];
					});
					break;
				}
				case "agent": {
					setLocalMessages((prev) => {
						const messageIndex = prev.findIndex(
							(m) => m.agentName === (payload as AgentChunk).name,
						);
						// If the referenced agent is not found, create a new agent message
						if (messageIndex === -1) {
							const newMessage: MessageBubble = {
								id: messageId,
								type: "agent",
								agentName: (payload as AgentChunk).name,
								status: (payload as AgentChunk).status,
								chunks: [],
							};
							return [...prev, newMessage];
						}

						const updatedMessage = {
							...prev[messageIndex],
							status: (payload as AgentChunk).status,
						};
						return [
							...prev.slice(0, messageIndex),
							updatedMessage,
							...prev.slice(messageIndex + 1),
						];
					});
					break;
				}
				case "tool": {
					setLocalMessages((prev) => {
						const messageIndex = prev.findIndex(
							(m) => m.agentName === (payload as ToolChunk).agentName,
						);
						if (messageIndex === -1) {
							const newMessage: MessageBubble = {
								id: messageId,
								type: "agent",
								agentName: (payload as ToolChunk).agentName,
								status: (payload as ToolChunk).status,
								chunks: [
									{
										toolCall: {
											tool: (payload as ToolChunk).tool,
											status: (payload as ToolChunk).status,
											agentName: (payload as ToolChunk).agentName,
											arguments: (payload as ToolChunk).arguments,
											result: (payload as ToolChunk).result,
											error: (payload as ToolChunk).error,
										},
									},
								],
							};
							return [...prev, newMessage];
						}

						if ((payload as ToolChunk).status === "running") {
							return [
								...prev.slice(0, messageIndex),
								{
									...prev[messageIndex],
									chunks: [
										...prev[messageIndex].chunks,
										{
											toolCall: {
												tool: (payload as ToolChunk).tool,
												status: (payload as ToolChunk).status,
												agentName: (payload as ToolChunk).agentName,
												arguments: (payload as ToolChunk).arguments,
												result: (payload as ToolChunk).result,
												error: (payload as ToolChunk).error,
											},
										},
									],
								},
								...prev.slice(messageIndex + 1),
							];
						}

						if ((payload as ToolChunk).status === "complete") {
							const updatedChunk = prev[messageIndex].chunks.pop();
							if (!updatedChunk) return [...prev];
							updatedChunk.toolCall.status = (payload as ToolChunk).status;
							updatedChunk.toolCall.result = (payload as ToolChunk).result;
							updatedChunk.toolCall.error = (payload as ToolChunk).error;

							// Handle different types of tool results
							const tool = (payload as ToolChunk).tool;
							const result = (payload as ToolChunk).result;
							const image = (payload as ToolChunk).image;

							switch (tool) {
								case "agent_read_business_json":
									if (result) {
										addArtifact?.('document', result);
									}
									break;
								case "agent_execute_python_code":
									if (image) {
										addArtifact?.('image', image);
									}
									break;
								case "agent_execute_sql_query":
									if (result) {
										addArtifact?.('query', result);
									}
									break;
								default:
									console.log(`Unhandled tool type: ${tool}`);
							}

							// If this is the first message in launch mode, create a thread
							if (isLaunchMode && prev.length === 1) {
								const threadId = createThread(result || "New Analysis");
								onLaunchComplete?.(threadId);
							}

							const updatedMessage = {
								...prev[messageIndex],
								chunks: [...prev[messageIndex].chunks, updatedChunk],
							};
							return [
								...prev.slice(0, messageIndex),
								updatedMessage,
								...prev.slice(messageIndex + 1),
							];
						}

						if ((payload as ToolChunk).status === "error") {
							const updatedChunk = prev[messageIndex].chunks.pop();
							if (!updatedChunk) return [...prev];
							updatedChunk.toolCall.status = (payload as ToolChunk).status;
							updatedChunk.toolCall.error = (payload as ToolChunk).error;
							const updatedMessage = {
								...prev[messageIndex],
								chunks: [...prev[messageIndex].chunks, updatedChunk],
							};
							return [
								...prev.slice(0, messageIndex),
								...prev.slice(messageIndex + 1),
								updatedMessage,
							];
						}

						return prev;
					});
					break;
				}
			}
		},
		[addArtifact, isLaunchMode, createThread, onLaunchComplete]
	);

	// WebSocket connection with message handling
	const { isConnected, error, sendMessage } = useWebSocket({
		onMessage: handleMessage,
	});

	// Handle initial connection in launch mode
	useEffect(() => {
		if (isLaunchMode && isConnected && sendOnConnect) {
			setIsInitializing(true);
			const msg = sendOnConnect();
			if (msg) {
				sendMessage(msg.type, msg);
			}
		}
	}, [isLaunchMode, isConnected, sendOnConnect, sendMessage]);

	// Handle new user messages
	const handleNewMessage = async (content: string) => {
		const userMessageId = crypto.randomUUID();
		const assistantMessageId = crypto.randomUUID();

		const userMessage: MessageBubble = {
			id: userMessageId,
			type: "user",
			chunks: [{ content }],
		};

		const assistantMessage: MessageBubble = {
			id: assistantMessageId,
			type: "assistant",
			chunks: [],
		};

		// Add user message to both local and workspace state
		setLocalMessages(prev => [...prev, userMessage, assistantMessage]);
		addMessage(userMessage);
		setActiveMessageId(assistantMessageId);

		// If in launch mode, wait for connection before sending
		if (isLaunchMode) {
			if (!isConnected) {
				// Wait for connection
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}

		sendMessage("toLLM", { type: "toLLM", text: content } as ToLLMMessage);
	};

	// When a message is complete, add it to the workspace state
	useEffect(() => {
		// Don't add messages to DB if we're loading them
		if (isLoadingMessages) return;

		const lastMessage = localMessages[localMessages.length - 1];
		if (lastMessage && lastMessage.type === "assistant" && lastMessage.chunks.length > 0) {
			const isComplete = lastMessage.chunks.every(chunk => 
				!chunk.toolCall || 
				(chunk.toolCall.status === "complete" || chunk.toolCall.status === "error")
			);
			
			if (isComplete) {
				addMessage(lastMessage);
			}
		}
	}, [localMessages, addMessage, isLoadingMessages]);

	return (
		<div className="flex flex-col h-full bg-[#F4F5F7]">
			{/* Header */}
			<div className="flex items-center justify-between border-b p-4 bg-white">
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
			</div>

			{/* Messages */}
			<MessageList
				messages={localMessages}
				onToolSelect={useCallback(
					(tool) => {
						onToolSelect?.(tool);
					},
					[onToolSelect],
				)}
			/>

			{/* Chat Input */}
			<ChatInput
				isConnected={isConnected}
				onSubmit={handleNewMessage}
				error={error}
				isLaunchMode={isLaunchMode}
			/>
		</div>
	);
});
