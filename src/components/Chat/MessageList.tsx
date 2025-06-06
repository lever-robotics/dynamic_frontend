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
	loadingMessage?: string | null;
}

export function MessageList({
	messages,
	className = "",
	onToolSelect,
	loadingMessage,
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
			{loadingMessage && (
				<div className="flex justify-start">
					<article className="flex overflow-hidden flex-col px-3 py-3 mt-3.5 w-full bg-white rounded-2xl max-w-[324px] border border-gray-200">
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<div className="flex gap-1">
								<span
									className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
									style={{ animationDelay: "0ms" }}
								/>
								<span
									className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
									style={{ animationDelay: "150ms" }}
								/>
								<span
									className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
									style={{ animationDelay: "300ms" }}
								/>
							</div>
							<span>{loadingMessage}</span>
						</div>
					</article>
				</div>
			)}
			<div ref={messagesEndRef} />
		</div>
	);
}
