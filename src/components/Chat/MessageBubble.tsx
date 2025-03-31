import type React from "react";
import { processText } from "@/utils/messageUtils";
import type {
	MessageBubble as MessageBubbleType,
	ToolExecutionBubble,
} from "@/types/chat";
import { AgentExecution } from "./AgentExecution";
import { MarkdownContent } from "./MarkdownContent";

interface MessageBubbleProps {
	message: MessageBubbleType;
	onToolSelect?: (tool: ToolExecutionBubble) => void;
}

export function MessageBubble({ message, onToolSelect }: MessageBubbleProps) {
	return (
		<div
			className={`mb-4 flex ${
				message.type === "user" ? "justify-end" : "justify-start"
			}`}
		>
			<div
				className={`rounded-lg p-3 max-w-[80%] ${
					message.type === "user"
						? "bg-blue-100 text-blue-900"
						: "bg-gray-100 text-gray-900"
				}`}
			>
				{message.chunks.map((chunk, index) => (
					<div key={`${message.id}-chunk-${index}`}>
						<MarkdownContent content={chunk.content} />
					</div>
				))}
			</div>
		</div>
	);
}
