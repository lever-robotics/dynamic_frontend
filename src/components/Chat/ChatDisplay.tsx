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

interface ChatDisplayProps {
	onClose?: () => void;
	sendOnConnect?: () => Payload;
	onToolSelect?: (tool: ToolExecutionBubble) => void;
	setDocument?: (document: string | null) => void;
}

export const ChatDisplay = memo(function ChatDisplay({
	onClose,
	sendOnConnect,
	onToolSelect,
	setDocument,
}: ChatDisplayProps) {
	const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
	const [messages, setMessages] = useState<MessageBubble[]>([]);

	// Handle incoming WebSocket messages
	const handleMessage = useCallback(
		(wsMessage: WebSocketMessage) => {
			console.log("Current Mesages --", messages, "Message: ", wsMessage);
			// if (!activeMessageId) return;
			const { payload, messageId } = wsMessage;
			switch (payload.type) {
				// Create or Update Text
				case "text": {
					console.log("Text --", payload);
					setMessages((prev) => {
						const messageIndex = prev.length - 1;
						const newChunk: MessageChunkBubble = {
							content: (payload as MessageChunk).content,
						};
						// Append new text chunk to current message
						if(prev[messageIndex].type === "assistant") {
							return [
								...prev.slice(0, messageIndex),
								{
									...prev[messageIndex],
									chunks: [...prev[messageIndex].chunks, newChunk],
								},
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
				// Create or Update Agent
				case "agent": {
					setMessages((prev) => {
						const messageIndex = prev.findIndex(
							(m) => m.agentName === (payload as AgentChunk).name,
						);
						console.log(messageIndex, wsMessage);
						// If the referenced agent is not found, create a new agent message
						if (messageIndex === -1) {
							const newMessage: MessageBubble = {
								id: messageId,
								type: "agent",
								agentName: (payload as AgentChunk).name,
								status: (payload as AgentChunk).status,
								chunks: [],
							};
							console.log("Prev --", prev);
							return [...prev, newMessage];
						}

						return [
							...prev.slice(0, messageIndex),
							{
								...prev[messageIndex],
								status: (payload as AgentChunk).status,
							},
							...prev.slice(messageIndex + 1),
						];
					});
					break;
				}
				// Create or Update Tool
				case "tool": {
					setMessages((prev) => {
						console.log("Tool Call --", (payload as ToolChunk).status);
						const messageIndex = prev.findIndex(
							(m) => m.agentName === (payload as ToolChunk).agentName,
						);
						console.log("Message Index --", messageIndex);
						console.log("Tool Info:", payload as ToolChunk);
						// If there is not a agent that this tool references, do nothing
						// if (messageIndex === -1) return [...prev];
						if (messageIndex === -1) {

							const newMessage: MessageBubble = {
								id: messageId,
								type: "agent",
								agentName: (payload as AgentChunk).name,
								status: (payload as AgentChunk).status,
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
							setDocument?.((payload as ToolChunk).result?.data);
							return [...prev, newMessage];
						}
						// console.log("Tool Call --", (payload as ToolChunk).status);
						// If the tool is running, add a new chunk to the message
						if ((payload as ToolChunk).status === "running") {
							const updated = [
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
							console.log(updated);
							return updated;
							
						}
						// If the tool is complete, add the result to the message. The running tool is always the last chunk.
						if ((payload as ToolChunk).status === "complete") {
							const updatedChunk = prev[messageIndex].chunks.pop();
							updatedChunk.toolCall.status = (payload as ToolChunk).status;
							updatedChunk.toolCall.result = (payload as ToolChunk).result;
							updatedChunk.toolCall.error = (payload as ToolChunk).error;
							return [
								...prev.slice(0, messageIndex),
								{
									...prev[messageIndex],
									chunks: [...prev[messageIndex].chunks, updatedChunk],
								},
								...prev.slice(messageIndex + 1),
							];
						}
						if ((payload as ToolChunk).status === "error") {
							const updatedChunk = prev[messageIndex].chunks.pop();
							updatedChunk.toolCall.status = (payload as ToolChunk).status;
							updatedChunk.toolCall.error = (payload as ToolChunk).error;
							return [
								...prev.slice(0, messageIndex),
								{
									...prev[messageIndex],
									chunks: [...prev[messageIndex].chunks, updatedChunk],
								},
							];
						}
					});
					break;
				}
			}
		},
		[messages, setDocument],
	);

	// WebSocket connection with message handling
	const { isConnected, error, sendMessage } = useWebSocket({
		onMessage: handleMessage,
	});

	useEffect(() => {
		if (isConnected && sendOnConnect) {
			const msg = sendOnConnect();
			if (msg) {
				// Create initial message before sending
				// const initialMessageId = crypto.randomUUID();
				// const initialMessage: MessageBubble = {
				// 	id: initialMessageId,
				// 	type: "assistant",
				// 	chunks: [],
				// };
				// setMessages([initialMessage]);
				// setActiveMessageId(initialMessageId);

				sendMessage(msg.type, msg);
			}
		}
	}, [isConnected, sendOnConnect, sendMessage]);

	// Handle new user messages
	const handleNewMessage = (content: string) => {
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

		setMessages((prev) => [...prev, userMessage, assistantMessage]);
		setActiveMessageId(assistantMessageId);
		sendMessage("toLLM", { type: "toLLM", text: content } as ToLLMMessage);
	};

	return (
		<div className="flex flex-col h-full bg-white">
			{/* Header */}
			<div className="flex items-center justify-between border-b p-4">
				<div className="flex items-center gap-2">
					<div
						className={`h-2 w-2 rounded-full ${
							isConnected ? "bg-green-500" : "bg-yellow-500"
						}`}
					/>
					<span className="text-sm text-gray-600">
						{isConnected ? "Connected" : "Connecting..."}
					</span>
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
				messages={messages}
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
			/>
		</div>
	);
});
