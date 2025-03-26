import { useState, useRef, useEffect, useCallback } from "react";
import type { WebSocketMessage } from "@/types/chat";
import { useWebSocket } from "@/hooks/useWebSocket";
import { processText } from "@/utils/messageUtils";
import { ChatInput } from "./ChatInput";

interface Message {
	id: string;
	type: "user" | "assistant";
	content: string;
	timestamp: string;
}

interface ChatDisplayProps {
	onClose?: () => void;
}

export function ChatDisplay({ onClose }: ChatDisplayProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Memoize the onMessage callback
	const handleMessage = useCallback((message: WebSocketMessage) => {
		if (message.type === "streamChunk") {
			setMessages((prev) => {
				const lastMessage = prev[prev.length - 1];
				if (lastMessage?.type === "assistant") {
					const updatedMessages = [...prev.slice(0, -1)];
					updatedMessages.push({
						...lastMessage,
						content: lastMessage.content + message.payload.text,
					});
					return updatedMessages;
				}
				return prev;
			});
		}
	}, []); 

	// WebSocket connection with memoized callback
	const { isConnected, error, sendMessage } = useWebSocket({
		onMessage: handleMessage,
	});

	// Auto-scroll to bottom when messages change
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleNewMessage = (message: string) => {
		const newMessage: Message = {
			id: crypto.randomUUID(),
			type: "user",
			content: message,
			timestamp: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, newMessage]);
		sendMessage("toLLM", { text: message });
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
			<div ref={containerRef} className="flex-1 overflow-y-auto p-4">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`mb-4 flex ${
							message.type === "user" ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`rounded-lg p-3 ${
								message.type === "user"
									? "bg-blue-100 text-blue-900"
									: "bg-gray-100 text-gray-900"
							}`}
						>
							{processText(message.content)}
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Chat Input */}
			<ChatInput
				isConnected={isConnected}
				onSubmit={handleNewMessage}
				error={error}
			/>
		</div>
	);
}
