import { userConfigStore } from "@/stores/UserConfigStore";
import { workspaceStore } from "@/stores/WorkspaceStore";
import type { MessageBubble, ToolExecutionBubble } from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";
import { WebSocketConversation } from "@/utils/WebSocket";
import { observer } from "mobx-react-lite";
import type React from "react";
import { useEffect, useRef } from "react";
import { ChatInput } from "./Chat/ChatInput";
import MessageList from "./Chat/MessageList";
import { Whiteboard } from "./Whiteboard";

// interface MainContentProps {
// }
// Bring ChatDisplay into this component
// Need an addMessage function that will update the messages state and also send the message to the db.
// Maybe instead of an addMessage there is an addTool and addAssitant
export const MainContent: React.FC = () => {
	const { session } = useAuth();
	const ws = useRef<WebSocketConversation | null>(null);

	useEffect(() => {
		const initWebSocket = async () => {
			ws.current = new WebSocketConversation(
				session?.access_token || "",
				session?.user.id || "",
				userConfigStore.threadId,
			);
			ws.current.subscribe("open", () => {});

			ws.current.subscribe("error", (error) => {
				console.log("WebSocket error", error);
			});
			ws.current.subscribe("close", () => {});

			ws.current.connect("query");
		};
		if (ws.current === null) {
			initWebSocket();
		} else if (ws.current.threadId !== userConfigStore.threadId) {
			ws.current.disconnect();
			initWebSocket();
		}
		return () => {
			ws.current?.disconnect();
		};
	}, [session]);

	const handleNewMessage = (content: string) => {
		if (ws.current) {
			ws.current.sendUserMessage(content);
		}
	};

	return (
		<div className="flex h-screen overflow-hidden bg-portage-50">
			{/* Main Content Area */}
			<div className="w-full flex h-full">
				{/* Whiteboard Area - Fixed width */}
				<div className="w-[calc(100%-500px)] h-full bg-white border-r border-gray-200">
					<Whiteboard />
				</div>

				{/* Chat Area - Fixed width */}
				<div className="w-[500px] h-full bg-[#F4F5F7]/[0.43]">
					<div className="flex flex-col h-full bg-[#F4F5F7]">
						{/* Messages */}
						<MessageList />

						{/* Potential Responses */}
						{workspaceStore.potentialResponses.length > 0 && (
							<div className="flex flex-wrap gap-2 p-4">
								{workspaceStore.potentialResponses.map((response) => (
									<button
										key={response}
										type="button"
										onClick={() => handleNewMessage(response)}
										className="px-4 py-2 text-sm text-primary border border-primary/20 rounded-full hover:bg-primary/10 transition-colors"
									>
										{response}
									</button>
								))}
							</div>
						)}

						{/* Chat Input */}
						<ChatInput
							isConnected={ws.current?.isConnected}
							onSubmit={handleNewMessage}
							error={null}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default observer(MainContent);
