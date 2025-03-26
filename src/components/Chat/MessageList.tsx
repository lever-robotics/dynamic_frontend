import type React from "react";
import { useRef } from "react";
import type { Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
	messages: Message[];
	className?: string;
}

export function MessageList({ messages, className = "" }: MessageListProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Check scroll position on every render
	const shouldScroll =
		containerRef.current &&
		containerRef.current.scrollHeight -
			containerRef.current.scrollTop -
			containerRef.current.clientHeight <
			100;

	if (shouldScroll) {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}

	return (
		<div
			ref={containerRef}
			className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}
		>
			{messages.map((message) => (
				<MessageBubble key={message.id} message={message} />
			))}
			<div ref={messagesEndRef} />
		</div>
	);
}
