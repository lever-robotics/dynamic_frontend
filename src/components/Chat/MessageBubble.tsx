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
	if (message.type === "user") {
		return (
			<div className="flex justify-end">
				<p className="overflow-hidden self-end px-3 py-3 max-w-full text-xs leading-4 rounded-2xl bg-cyan-200 bg-opacity-30 min-h-[54px] text-ellipsis text-slate-600 w-[205px]">
					{message.chunks.map((chunk) => chunk.content).join("")}
				</p>
			</div>
		);
	}

	if (message.type === "agent") {
		return <AgentExecution agent={message} onToolSelect={onToolSelect} />;
	}

	// Assistant message
	return (
		<div className="flex justify-start">
			<article className="flex overflow-hidden flex-col px-3 py-3 mt-3.5 w-full bg-white rounded-2xl max-w-[324px]">
				<div className="flex flex-col w-full text-xs leading-4 text-slate-600">
					{message.chunks.map((chunk, index) => (
						<div key={`${message.id}-chunk-${index}`}>
							<MarkdownContent content={chunk.content || ""} />
						</div>
					))}
				</div>
			</article>
		</div>
	);
}
