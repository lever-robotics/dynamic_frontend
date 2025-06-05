import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { Artifacts } from "@/contexts/WorkspaceContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import type {
	FlagChunk,
	MessageBubble,
	MessageChunk,
	ToolChunk,
	ToolExecutionBubble,
} from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";
import { supabase } from "@/utils/SupabaseClient";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { WebSocketConversation } from "@/utils/WebSocket";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatDisplay } from "./Chat/ChatDisplay";
import { ChatInput } from "./Chat/ChatInput";
import { MessageList } from "./Chat/MessageList";
import { Whiteboard } from "./Whiteboard";

interface MainContentProps {
	threadId: string;
	queryData: boolean;
}
// Bring ChatDisplay into this component
// Need an addMessage function that will update the messages state and also send the message to the db.
// Maybe instead of an addMessage there is an addTool and addAssitant
export const MainContent: React.FC<MainContentProps> = ({
	threadId,
	queryData,
}) => {
	const { ws } = useWorkspace();
	const [isConnected, setIsConnected] = useState(false);
	const [potentialResponses, setPotentialResponses] = useState<string[]>([]);
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
			ws.subscribe("tool", (toolCall: ToolExecutionBubble) => {
				if (toolCall.tool === "agent_user_potential_responses") {
					setPotentialResponses(ws.potentialResponses);
				}
			});
			ws.subscribe("close", () => {
				console.log("WebSocket closed");
				setIsConnected(false);
			});
			console.log("Connecting to WebSocket");
			ws.connect("query", {});
		}
		return () => {
			if (ws) {
				ws.disconnect();
			}
		};
	}, [ws]);

	const handleNewMessage = (content: string) => {
		if (ws) {
			ws.sendUserMessage(content);
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
						<MessageList messages={messages} />

						{/* Potential Responses */}
						{potentialResponses.length > 0 && (
							<div className="flex flex-wrap gap-2 p-4">
								{potentialResponses.map((response) => (
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
							isConnected={isConnected}
							onSubmit={handleNewMessage}
							error={null}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MainContent;
