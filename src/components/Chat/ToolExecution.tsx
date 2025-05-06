import type {
	ToolExecutionBubble as ToolExecutionType,
	ToolStatus,
} from "@/types/chat";
import type React from "react";
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
		starting: "bg-yellow-50 text-yellow-700",
		running: "bg-blue-50 text-blue-700",
		complete: "bg-black text-white",
		error: "bg-red-50 text-red-700",
	} as const;

	const statusColor = toolExecution.status
		? statusColors[toolExecution.status]
		: statusColors.running;

	if (compact) {
		return (
			<div className="flex items-center justify-between p-2">
				<div className="flex items-center gap-2">
					<span className="font-medium">{toolExecution.tool}</span>
					<span className={`text-xs px-1.5 py-0.5 rounded ${statusColor}`}>
						{toolExecution.status === "running" ? (
							<LoadingSpinner size="sm" />
						) : toolExecution.status === "complete" ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-label="Completed"
							>
								<title>Completed</title>
								<path
									fillRule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clipRule="evenodd"
								/>
							</svg>
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
		<div className="my-2">
			{/* Tool Header */}
			<div className={`flex items-center justify-between p-2 ${statusColor}`}>
				<span className="font-medium">{toolExecution.tool}</span>
				{toolExecution.status === "complete" && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-label="Completed"
					>
						<title>Completed</title>
						<path
							fillRule="evenodd"
							d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
							clipRule="evenodd"
						/>
					</svg>
				)}
				{toolExecution.status === "running" && <LoadingSpinner size="sm" />}
				{!toolExecution.status && (
					<span className="text-sm capitalize">starting</span>
				)}
			</div>

			{/* Tool Arguments */}
			<div className="p-2 bg-gray-50">
				<pre className="text-xs overflow-x-auto">
					{JSON.stringify(toolExecution.arguments, null, 2)}
				</pre>
			</div>

			{/* Tool Result/Error */}
			<div className="p-2 bg-white">
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
