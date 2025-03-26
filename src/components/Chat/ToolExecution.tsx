import type React from "react";
import type { ToolExecution as ToolExecutionType } from "@/types/chat";

interface ToolExecutionProps {
	toolExecution: ToolExecutionType;
}

export function ToolExecution({ toolExecution }: ToolExecutionProps) {
	const statusColors = {
		starting: "bg-blue-50 border-blue-200 text-blue-700",
		running: "bg-yellow-50 border-yellow-200 text-yellow-700",
		complete: "bg-green-50 border-green-200 text-green-700",
		error: "bg-red-50 border-red-200 text-red-700",
	};

	const statusColor = toolExecution.status
		? statusColors[toolExecution.status]
		: statusColors.starting;

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
