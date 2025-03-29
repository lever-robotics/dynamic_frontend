import type React from "react";
import { processText } from "@/utils/messageUtils";
import type { Message } from "@/types/chat";
import { ToolExecution } from "./ToolExecution";

interface MessageBubbleProps {
	message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
	console.log("message", message);
	message.chunks.forEach((chunk) => {
		if (chunk.type === "tool") {
			console.log("tool", chunk.toolExecution);
		}
	});
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
						{chunk.type === "text" ? (
							<div className="prose prose-sm max-w-none">
								{processText(chunk.content)}
							</div>
						) : (
							chunk.toolExecution && (
								<ToolExecution toolExecution={chunk.toolExecution} />
							)
						)}
					</div>
				))}
			</div>
		</div>
	);
}
