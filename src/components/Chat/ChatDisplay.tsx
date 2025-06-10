import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocket } from "@/hooks/useWebSocket";
import type {
	AgentChunk,
	MessageBubble,
	MessageChunk,
	MessageChunkBubble,
	Payload,
	ToLLMMessage,
	ToolChunk,
	ToolExecutionBubble,
	WebSocketMessage,
} from "@/types/chat";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { memo, useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface ChatDisplayProps {
	onClose?: () => void;
	sendOnConnect?: () => Payload;
	isLever?: boolean;
}

export const ChatDisplay = memo(function ChatDisplay({
	onClose,
	sendOnConnect,
	isLever = true,
}: ChatDisplayProps) {
	const { setCurrentArtifactById } = useWorkspace();
	const {
		messages,
		isConnected,
		potentialResponses,
		handleNewMessage,
		loadingMessage,
		setLoadingMessage,
	} = useMessages(sendOnConnect);
	const [isTyping, setIsTyping] = useState(false);

	console.log("[ChatDisplay] messages:", messages);

	const handleInputChange = (value: string) => {
		if (value.trim() && !isTyping) {
			setIsTyping(true);
			setLoadingMessage("Thinking...");
		} else if (!value.trim() && isTyping) {
			setIsTyping(false);
			setLoadingMessage("Thinking...");
		}
	};

	return (
		<div className="flex flex-col h-full bg-[#F4F5F7]">
			{/* Header */}
			{/* <div className="flex items-center justify-between border-b p-4 bg-white">
				<div className="flex items-center gap-2">
					{!isLaunchMode && (
						<>
							<div
								className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"
									}`}
							/>
							<span className="text-sm text-gray-600">
								{isConnected ? "Connected" : "Connecting..."}
							</span>
						</>
					)}
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						type="button"
					>
						✕
					</button>
				)}
			</div> */}

			{/* Messages */}
			{isLever ? (
				<>
					<MessageList
						messages={messages}
						onToolSelect={(tool: ToolExecutionBubble) => {
							console.log("[ChatDisplay] Tool selected:", tool);
							if (tool.artifactId) {
								setCurrentArtifactById(tool.artifactId);
							}
						}}
						loadingMessage={loadingMessage}
					/>

					{/* Potential Responses */}
					{potentialResponses.length > 0 && (
						<div className="flex flex-wrap gap-2 p-4">
							{potentialResponses.map((response) => (
								<button
									key={response}
									type="button"
									onClick={() => {
										handleNewMessage(response);
									}}
									className="px-4 py-2 text-sm text-primary-600 border border-primary-300 bg-white/80 rounded-full hover:bg-primary-50 hover:border-primary-400 transition-colors"
								>
									{response}
								</button>
							))}
						</div>
					)}
				</>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<p className="text-gray-400 text-sm">
						Chat is currently under development
					</p>
				</div>
			)}

			{/* Chat Input */}
			<ChatInput
				isConnected={isConnected}
				onSubmit={handleNewMessage}
				error={null}
				onInputChange={handleInputChange}
			/>
		</div>
	);
});
