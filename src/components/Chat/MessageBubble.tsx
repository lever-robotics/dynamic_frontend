import type {
	MessageBubble as MessageBubbleType,
	ToolExecutionBubble,
} from "@/types/chat";
import { processText } from "@/utils/messageUtils";
import type React from "react";
import { MarkdownContent } from "./MarkdownContent";
import { ToolExecution } from "./ToolExecution";

interface MessageBubbleProps {
	message: MessageBubbleType;
	onToolSelect?: (tool: ToolExecutionBubble) => void;
	toolNameMapping: Record<string, string>;
}

export function MessageBubble({
	message,
	onToolSelect,
	toolNameMapping,
}: MessageBubbleProps) {
	if (message.type === "user") {
		return (
			<div className="flex justify-end">
				<p className="overflow-hidden self-end px-3 py-3 max-w-full text-xs leading-4 rounded-2xl bg-primary-300 bg-opacity-30 min-h-[54px] text-ellipsis text-slate-600 w-[205px] border border-gray-200">
					{message.chunks.map((chunk) => chunk.content).join("")}
				</p>
			</div>
		);
	}

	if (message.type === "tool") {
		return (
			<div className="flex justify-start">
				<article
					className={`flex overflow-hidden flex-col px-3 py-3 mt-3.5 w-full bg-secondary-300 bg-opacity-30 rounded-2xl max-w-[324px] border border-gray-200 transition-colors duration-200 ${
						onToolSelect
							? "hover:bg-secondary-300 hover:bg-opacity-50 cursor-pointer"
							: ""
					}`}
					onClick={() => {
						if (onToolSelect && message.chunks[0]?.toolCall) {
							onToolSelect(message.chunks[0].toolCall);
						}
					}}
					onKeyDown={(e) => {
						if (
							(e.key === "Enter" || e.key === " ") &&
							onToolSelect &&
							message.chunks[0]?.toolCall
						) {
							onToolSelect(message.chunks[0].toolCall);
						}
					}}
					tabIndex={onToolSelect ? 0 : -1}
					role={onToolSelect ? "button" : undefined}
				>
					<div className="flex flex-col w-full text-xs leading-4 text-slate-600">
						{message.chunks.map((chunk, index) => (
							<div key={`${message.id}-chunk-${index}`}>
								{chunk.toolCall && (
									<ToolExecution
										toolExecution={{
											...chunk.toolCall,
											tool:
												toolNameMapping[chunk.toolCall.tool] ||
												chunk.toolCall.tool,
										}}
										compact={true}
									/>
								)}
							</div>
						))}
					</div>
				</article>
			</div>
		);
	}

	// Assistant message
	return (
		<div className="flex justify-start">
			<article className="flex overflow-hidden flex-col px-3 py-3 mt-3.5 w-full bg-white rounded-2xl max-w-[324px] border border-gray-200">
				<div className="flex flex-col w-full text-xs leading-4 text-slate-600">
					{message.chunks.map((chunk, index) => (
						<div key={`${message.id}-chunk-${index}`}>
							{chunk.content && <MarkdownContent content={chunk.content} />}
						</div>
					))}
				</div>
			</article>
		</div>
	);
}
