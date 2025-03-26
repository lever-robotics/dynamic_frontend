import { useState, useCallback } from "react";
import type { Message, WebSocketMessage } from "@/types/chat";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface ChatDisplayProps {
	onClose?: () => void;
}

export function ChatDisplay({ onClose }: ChatDisplayProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

	// Handle incoming WebSocket messages
	const handleMessage = useCallback(
		(wsMessage: WebSocketMessage) => {
			if (!activeMessageId) return;

			const { payload } = wsMessage;
			switch (payload.type) {
				case "chunk": {
					setMessages((prev) => {
						const messageIndex = prev.findIndex(
							(m) => m.id === activeMessageId,
						);
						if (messageIndex === -1) return prev;

						return [
							...prev.slice(0, messageIndex),
							{
								...prev[messageIndex],
								chunks: [...prev[messageIndex].chunks, payload.chunk],
							},
							...prev.slice(messageIndex + 1),
						];
					});
					break;
				}

				case "result": {
					setMessages((prev) => {
						const messageIndex = prev.findIndex(
							(m) => m.id === activeMessageId,
						);
						if (messageIndex === -1) return prev;

						const toolChunkIndex = prev[messageIndex].chunks.findIndex(
							(chunk) =>
								chunk.type === "tool" &&
								chunk.toolExecution?.tool === payload.tool,
						);
						if (toolChunkIndex === -1) return prev;

						const updatedChunks = [...prev[messageIndex].chunks];
						const toolChunk = updatedChunks[toolChunkIndex];
						if (toolChunk.type === "tool" && toolChunk.toolExecution) {
							toolChunk.toolExecution = {
								...toolChunk.toolExecution,
								status: "complete",
								result: payload.result,
							};
						}

						return [
							...prev.slice(0, messageIndex),
							{
								...prev[messageIndex],
								chunks: updatedChunks,
							},
							...prev.slice(messageIndex + 1),
						];
					});
					break;
				}

				case "error": {
					if (payload.message) {
						setMessages((prev) => {
							const messageIndex = prev.findIndex(
								(m) => m.id === activeMessageId,
							);
							if (messageIndex === -1) return prev;

							return [
								...prev.slice(0, messageIndex),
								{
									...prev[messageIndex],
									chunks: [
										...prev[messageIndex].chunks,
										{
											type: "text" as const,
											content: `Error: ${payload.message}`,
										},
									],
								},
								...prev.slice(messageIndex + 1),
							];
						});
					}
					break;
				}
			}
		},
		[activeMessageId],
	);

	// WebSocket connection with message handling
	const { isConnected, error, sendMessage } = useWebSocket({
		onMessage: handleMessage,
	});

	// Handle new user messages
	const handleNewMessage = (content: string) => {
		const userMessageId = crypto.randomUUID();
		const assistantMessageId = crypto.randomUUID();

		const userMessage: Message = {
			id: userMessageId,
			type: "user",
			chunks: [{ type: "text", content }],
		};

		const assistantMessage: Message = {
			id: assistantMessageId,
			type: "assistant",
			chunks: [],
		};

		setMessages((prev) => [...prev, userMessage, assistantMessage]);
		setActiveMessageId(assistantMessageId);
		sendMessage("toLLM", { type: "toLLM", text: content });
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
			<MessageList messages={messages} />

			{/* Chat Input */}
			<ChatInput
				isConnected={isConnected}
				onSubmit={handleNewMessage}
				error={error}
			/>
		</div>
	);
}
