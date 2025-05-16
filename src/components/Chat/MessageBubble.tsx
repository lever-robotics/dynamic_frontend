import { useWorkspace } from "@/contexts/WorkspaceContext";
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
	const {
		setCurrentArtifact,
		state: { artifacts },
	} = useWorkspace();

	const handleToolSelect = (tool: ToolExecutionBubble) => {
		// First call the original onToolSelect if it exists
		if (onToolSelect) {
			onToolSelect(tool);
		}

		// Then switch to the appropriate tab based on the tool type
		console.log("[MessageBubble] Tool selected:", tool);
		console.log("[MessageBubble] Artifacts:", artifacts);
		if (tool.artifactId) {
			switch (tool.tool) {
				case "write_bi_report": {
					const artifact = artifacts.documents.find(
						(doc) => doc.id === tool.artifactId,
					);
					if (artifact) {
						setCurrentArtifact(artifact);
					}
					break;
				}
				case "agent_execute_python_code": {
					const artifact = artifacts.images.find(
						(img) => img.id === tool.artifactId,
					);
					if (artifact) {
						setCurrentArtifact(artifact);
					}
					break;
				}
				case "agent_execute_sql_query":
				case "agent_execute_bigquery": {
					const artifact = artifacts.queries.find(
						(query) => query.id === tool.artifactId,
					);
					console.log("[MessageBubble] Found artifact:", artifact);
					if (artifact) {
						setCurrentArtifact(artifact);
					}
					break;
				}
			}
		}
	};

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
						console.log("[MessageBubble] Clicked tool message");
						if (message.chunks[0]?.toolCall) {
							handleToolSelect(message.chunks[0].toolCall);
						}
					}}
					onKeyDown={(e) => {
						if (
							(e.key === "Enter" || e.key === " ") &&
							message.chunks[0]?.toolCall
						) {
							handleToolSelect(message.chunks[0].toolCall);
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
	const bubble = message.chunks.map((chunk) => chunk.content).join("");
	return (
		<div className="flex justify-start">
			<article className="flex overflow-hidden flex-col px-3 py-3 mt-3.5 w-full bg-white rounded-2xl max-w-[324px] border border-gray-200">
				<div className="flex flex-col w-full text-xs leading-4 text-slate-600">
					{bubble && <MarkdownContent content={bubble} />}
				</div>
			</article>
		</div>
	);
}
