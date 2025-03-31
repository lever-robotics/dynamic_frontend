import type React from "react";
import { useRef } from "react";
import type { MessageBubble as MessageBubbleType, ToolExecutionBubble } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { AgentExecution } from "./AgentExecution";

interface MessageListProps {
	messages: MessageBubbleType[];
	className?: string;
	onToolSelect?: (tool: ToolExecutionBubble) => void;
}

export function MessageList({
	messages,
	className = "",
	onToolSelect,
}: MessageListProps) {
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
				message.type === "agent" ? (
					<AgentExecution
						key={message.id}
						agent={message}
						onToolSelect={onToolSelect}
					/>
				) : (
					<MessageBubble
						key={message.id}
						message={message}
						onToolSelect={onToolSelect}
					/>
				)
			))}
			<div ref={messagesEndRef} />
		</div>
	);
}
