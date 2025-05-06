import { MarkdownContent } from "@/components/Chat/MarkdownContent"; // Import the MarkdownContent component
import type { ToolExecutionBubble } from "@/types/chat";
import { useState } from "react";
import { format as formatSQL } from "sql-formatter"; // Import sql-formatter

interface ToolDetailProps {
	tool: ToolExecutionBubble;
	onClose?: () => void;
}

export function ToolDetail({ tool, onClose }: ToolDetailProps) {
	const [copied, setCopied] = useState(false);

	const statusColors = {
		starting: "bg-blue-50 text-blue-700",
		running: "bg-yellow-50 text-yellow-700",
		complete: "bg-green-50 text-green-700",
		error: "bg-red-50 text-red-700",
	};

	const formatResult = (result: any) => {
		try {
			const parsed = typeof result === "string" ? JSON.parse(result) : result;
			return JSON.stringify(parsed, null, 2);
		} catch (e) {
			return result;
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	const renderArguments = () => {
		try {
			const parsedArguments =
				typeof tool.arguments === "string"
					? JSON.parse(tool.arguments)
					: tool.arguments;

			if (parsedArguments.query) {
				// Render SQL code
				console.log("Parsed Arguments:", parsedArguments.query);
				const formattedSQL = formatSQL(parsedArguments.query);
				return (
					<MarkdownContent
						content={`~~~sql\n${formattedSQL}\n~~~`}
						className="text-sm"
					/>
				);
			}
			if (parsedArguments.code) {
				// Render Python code
				return (
					<MarkdownContent
						content={`~~~python\n${parsedArguments.code}\n~~~`}
						className="text-sm"
					/>
				);
			}
			// Render as JSON
			return (
				<pre className="text-sm overflow-auto whitespace-pre-wrap">
					{JSON.stringify(parsedArguments, null, 2)}
				</pre>
			);
		} catch (e) {
			console.error("Failed to parse arguments:", e);
			return (
				<pre className="text-sm overflow-auto whitespace-pre-wrap">
					{JSON.stringify(tool.arguments, null, 2)}
				</pre>
			);
		}
	};

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="flex justify-between items-center p-4 border-b">
				<div className="flex items-center gap-3">
					<h2 className="text-lg font-semibold">{tool.tool}</h2>
					<span
						className={`px-2 py-0.5 rounded-full text-sm ${statusColors[tool.status || "starting"]}`}
					>
						{tool.status || "starting"}
					</span>
				</div>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						←
					</button>
				)}
			</div>

			{/* Content */}
			<div className="flex-1 overflow-auto p-4 space-y-6">
				{/* Overview Section */}
				<div>
					<h3 className="text-sm font-medium text-gray-500">Description</h3>
					<p className="mt-1">{tool.tool} execution details</p>
					{tool.error && (
						<div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
							<h3 className="text-sm font-medium text-red-800">Error</h3>
							<p className="mt-1 text-sm text-red-700">{tool.error}</p>
						</div>
					)}
				</div>

				{/* Arguments Section */}
				<div className="bg-gray-50 rounded-lg p-4">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-sm font-medium text-gray-700">Arguments</h3>
						<button
							onClick={() =>
								copyToClipboard(JSON.stringify(tool.arguments, null, 2))
							}
							type="button"
							className="text-sm text-blue-600 hover:text-blue-800"
						>
							{copied ? "Copied!" : "Copy"}
						</button>
					</div>
					<div className="text-sm overflow-auto whitespace-pre-wrap">
						{renderArguments()}
					</div>
				</div>

				{/* Result Section */}
				{tool.result && (
					<div className="bg-gray-50 rounded-lg p-4">
						<div className="flex justify-between items-center mb-2">
							<h3 className="text-sm font-medium text-gray-700">Result</h3>
							<button
								onClick={() => copyToClipboard(formatResult(tool.result))}
								type="button"
								className="text-sm text-blue-600 hover:text-blue-800"
							>
								{copied ? "Copied!" : "Copy"}
							</button>
						</div>
						<pre className="text-sm overflow-auto whitespace-pre-wrap">
							{formatResult(tool.result)}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
}
