import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { MessageBubble } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatInput } from "../Chat/ChatInput";
import { MessageList } from "../Chat/MessageList";

export const BlueprintChat = () => {
	const { ws } = useWorkspace();
	const [messages, setMessages] = useState<MessageBubble[]>([]);

	useEffect(() => {
		if (ws) {
			ws.subscribe("message", () => {
				setMessages([...ws.messages]);
			});
			ws.subscribe("error", (error) => {
				console.log("WebSocket error", error);
			});
			ws.subscribe("close", () => {});
			ws.connect("blueprint", {});
		}
	}, [ws]);

	const handleNewMessage = (content: string) => {
		if (ws?.isConnected) {
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
					isConnected={ws?.isConnected}
					onSubmit={handleNewMessage}
					error={null}
				/>
			</div>
		</div>
	);
};

export default BlueprintChat;
