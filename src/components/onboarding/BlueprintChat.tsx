import { userConfigStore } from "@/stores/UserConfigStore";
import type { MessageBubble } from "@/types/chat";
import { WebSocketConversation } from "@/utils/WebSocket";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { ChatInput } from "../Chat/ChatInput";
import MessageList from "../Chat/MessageList";

export const BlueprintChat = () => {
	const ws = useRef<WebSocketConversation | null>(null);

	useEffect(() => {
		const initWebSocket = async () => {
			ws.current = new WebSocketConversation();
			ws.current.subscribe("open", () => {});

			ws.current.subscribe("error", (error) => {
				console.log("WebSocket error", error);
			});
			ws.current.subscribe("close", () => {});

			ws.current.connect("query");
		};
		if (ws.current === null) {
			initWebSocket();
		}
		return () => {
			ws.current?.disconnect();
		};
	}, []);

	const handleNewMessage = (content: string) => {
		if (ws.current) {
			ws.current.sendUserMessage(content);
		}
	};

	return (
		<div className="w-[500px] h-full bg-[#F4F5F7]/[0.43]">
			<div className="flex flex-col h-full bg-[#F4F5F7]">
				{/* Messages */}
				<MessageList />

				{/* Chat Input */}
				<ChatInput
					isConnected={ws.current?.isConnected}
					onSubmit={handleNewMessage}
					error={null}
				/>
			</div>
		</div>
	);
};

export default BlueprintChat;
