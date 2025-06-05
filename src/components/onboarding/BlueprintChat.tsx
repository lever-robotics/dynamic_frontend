import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { MessageBubble } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatInput } from "../Chat/ChatInput";
import { MessageList } from "../Chat/MessageList";

export const BlueprintChat = () => {
	const { ws } = useWorkspace();
	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<MessageBubble[]>([]);

	useEffect(() => {
		if (ws) {
			ws.subscribe("open", () => {
				console.log("WebSocket connected");
				setIsConnected(true);
			});
			ws.subscribe("message", (message) => {
				setMessages((prevMessages) => [...prevMessages, message]);
			});
			ws.subscribe("error", (error) => {
				console.log("WebSocket error", error);
			});
			ws.subscribe("close", () => {
				console.log("WebSocket closed");
				setIsConnected(false);
			});
			ws.connect("blueprint", {});
		}
	}, [ws]);

	const handleNewMessage = (content: string) => {
		if (ws) {
			ws.sendUserMessage(content);
		}
	};

	return (
		<div className="w-[500px] h-full bg-[#F4F5F7]/[0.43]">
			<div className="flex flex-col h-full bg-[#F4F5F7]">
				{/* Messages */}
				<MessageList messages={messages} />

				{/* Chat Input */}
				<ChatInput
					isConnected={isConnected}
					onSubmit={handleNewMessage}
					error={null}
				/>
			</div>
		</div>
	);
};

export default BlueprintChat;
