import { useState } from "react";
import type {
	MessageBubble as AgentExecutionBubble,
	ToolExecutionBubble,
} from "@/types/chat";
import { ToolExecution } from "./ToolExecution";

interface AgentExecutionProps {
	agent: AgentExecutionBubble;
	onToolSelect?: (tool: ToolExecutionBubble) => void;
}

export function AgentExecution({ agent, onToolSelect }: AgentExecutionProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	const statusColors = {
		starting: "bg-blue-50 text-blue-700",
		running: "bg-yellow-50 text-yellow-700",
		complete: "bg-green-50 text-green-700",
		error: "bg-red-50 text-red-700",
	} as const;

	return (
		<div className="border rounded-lg my-2">
			{/* Agent Header */}
			<div className="flex items-center justify-between p-3 border-b bg-gray-50">
				<div className="flex items-center gap-3">
					<h3 className="font-medium">{agent.agentName}</h3>
					<span
						className={`px-2 py-0.5 rounded-full text-xs ${
							statusColors[agent.status]
						}`}
					>
						{agent.status}
					</span>
				</div>
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className="text-gray-500 hover:text-gray-700"
				>
					{isExpanded ? "−" : "+"}
				</button>
			</div>

			{/* Tool Calls */}
			{isExpanded && (
				<div className="p-3 space-y-3">
					{agent.error ? (
						<div className="bg-red-50 border border-red-200 rounded p-3">
							<p className="text-sm text-red-700">{agent.error}</p>
						</div>
					) : agent.chunks.length === 0 ? (
						<p className="text-sm text-gray-500 italic">No tools called yet</p>
					) : (
						<div className="space-y-2">
							{agent.chunks.map((chunk, index) => (
								<div
									key={`${agent.agentName}-tool-${index}`}
									className="cursor-pointer hover:bg-gray-50 rounded transition-colors"
									onClick={() => onToolSelect?.(chunk.toolCall)}
								>
									<ToolExecution toolExecution={chunk.toolCall} compact={true} />
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
