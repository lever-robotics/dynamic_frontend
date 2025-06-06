import { userConfigStore } from "@/stores/UserConfigStore";
import { workspaceStore } from "@/stores/WorkspaceStore";
import type {
	MessageBubble,
	ToLLMMessage,
	ToolExecutionBubble,
} from "@/types/chat";
import { authStore } from "@/utils/AuthProvider";
import { WebSocketConversation } from "@/utils/WebSocket";
import { observer } from "mobx-react-lite";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./Chat/ChatInput";
import MessageList from "./Chat/MessageList";
import { Whiteboard } from "./Whiteboard";

// interface MainContentProps {
// }
// Bring ChatDisplay into this component
// Need an addMessage function that will update the messages state and also send the message to the db.
// Maybe instead of an addMessage there is an addTool and addAssitant
export const MainContent: React.FC = () => {
	const handleNewMessage = async (content: string) => {
		// const threadId = await userConfigStore.createThread(content);
		// userConfigStore.threadId = threadId;
		// workspaceStore.ws.connect("query");
		// await workspaceStore.loadThreadContent();
		// workspaceStore.ws.subscribe("open", async () => {
		// 	await workspaceStore.ws.sendUserMessage(content);
		// });
	};

	const handleUserMessage = async (content: string) => {
		workspaceStore.ws.sendUserMessage(content);
	};

	console.log("MainContent", workspaceStore.messages);
	return (
		<div className="flex w-full h-screen overflow-hidden bg-portage-50">
			{workspaceStore.messages ? (
				<div className="flex flex-col items-center justify-center h-full w-full bg-background">
					<div className="w-full max-w-2xl p-4">
						<div className="w-full">
							<ChatInput isConnected={false} onSubmit={handleNewMessage} />
						</div>
					</div>
				</div>
			) : (
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
											onClick={() => handleUserMessage(response)}
											className="px-4 py-2 text-sm text-primary border border-primary/20 rounded-full hover:bg-primary/10 transition-colors"
										>
											{response}
										</button>
									))}
								</div>
							)}

							{/* Chat Input */}
							<ChatInput
								isConnected={true}
								onSubmit={handleUserMessage}
								error={null}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default observer(MainContent);
