import type {
	MessageBubble as MessageBubbleType,
	ToolExecutionBubble,
} from "@/types/chat";
import type React from "react";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

const toolNameMapping: Record<string, string> = {
	agent_write_analysis_report: "Analysis Report",
	agent_execute_python_code: "Python Code Execution",
	agent_execute_sql_query: "SQL Query",
	agent_read_business_json: "Business Data Analysis",
	// Add more mappings as needed
};

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

	// Log messages whenever they change
	useEffect(() => {
		console.log("Messages list:", messages);
	}, [messages]);

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
				<MessageBubble
					key={message.id}
					message={message}
					onToolSelect={onToolSelect}
					toolNameMapping={toolNameMapping}
				/>
			))}
			<div ref={messagesEndRef} />
		</div>
	);
}
