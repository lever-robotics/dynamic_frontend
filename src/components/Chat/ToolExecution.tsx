import type React from "react";
import type { ToolExecutionBubble as ToolExecutionType } from "@/types/chat";
import { LoadingSpinner } from "../LoadingSpinner";

interface ToolExecutionProps {
	toolExecution: ToolExecutionType;
	compact?: boolean;
}

export function ToolExecution({
	toolExecution,
	compact = false,
}: ToolExecutionProps) {
	const statusColors = {
		starting: "bg-yellow-50 border-yellow-200 text-yellow-700",
		running: "bg-blue-50 border-blue-200 text-blue-700",
		complete: "bg-green-50 border-green-200 text-green-700",
		error: "bg-red-50 border-red-200 text-red-700",
	} as const;

	const statusColor = toolExecution.status
		? statusColors[toolExecution.status]
		: statusColors.running;

	if (toolExecution.status === "complete") {
		console.log(toolExecution.result);
		console.log(toolExecution.error);
	}

	if (compact) {
		return (
			<div className="flex items-center justify-between p-2 border rounded">
				<div className="flex items-center gap-2">
					<span className="font-medium">{toolExecution.tool}</span>
					<span className={`text-xs px-1.5 py-0.5 rounded ${statusColor}`}>
						{toolExecution.status === "running" ? (
							<LoadingSpinner size="sm" />
						) : (
							toolExecution.status || "starting"
						)}
					</span>
				</div>
				{toolExecution.error && (
					<span className="text-xs text-red-600">Failed</span>
				)}
			</div>
		);
	}

	return (
		<div className="my-2 rounded-lg border shadow-sm">
			{/* Tool Header */}
			<div
				className={`flex items-center justify-between p-2 ${statusColor} rounded-t-lg`}
			>
				<span className="font-medium">{toolExecution.tool}</span>
				<span className="text-sm capitalize">
					{toolExecution.status || "starting"}
				</span>
			</div>

			{/* Tool Arguments */}
			<div className="p-2 bg-gray-50 border-t border-b">
				<pre className="text-xs overflow-x-auto">
					{JSON.stringify(toolExecution.arguments, null, 2)}
				</pre>
			</div>

			{/* Tool Result/Error */}
			<div className="p-2 bg-white rounded-b-lg">
				{toolExecution.error ? (
					<div className="text-red-600 text-sm">{toolExecution.error}</div>
				) : toolExecution.result ? (
					<pre className="text-sm overflow-x-auto whitespace-pre-wrap">
						{JSON.stringify(toolExecution.result, null, 2)}
					</pre>
				) : (
					<div className="flex items-center gap-2 text-gray-500 text-sm">
						<div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
						Processing...
					</div>
				)}
			</div>
		</div>
	);
}
