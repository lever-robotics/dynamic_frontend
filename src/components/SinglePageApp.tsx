import React, { useCallback, useState } from "react";
import { SidebarComp } from "./Sidebar";
import { ChatDisplay } from "./Chat/ChatDisplay";
import { Whiteboard } from "./Whiteboard";
import { LaunchChat } from "./LaunchChat";
import type { FlagChunk } from "@/types/chat";
import { useWorkspace } from "@/contexts/WorkspaceContext";

// ChatWrapper component to handle workspace context
function ChatWrapper({ sendOnConnect }: { sendOnConnect: () => FlagChunk }) {
	const { setSelectedTool, addArtifact } = useWorkspace();

	return (
		<ChatDisplay
			sendOnConnect={sendOnConnect}
			onToolSelect={setSelectedTool}
			addArtifact={addArtifact}
		/>
	);
}

export const SinglePageApp: React.FC = () => {
	const [showLaunchChat, setShowLaunchChat] = useState(false);
	const sendOnConnect = useCallback(() => {
		return {
			type: "flag",
			flag: "query",
			context: JSON.stringify({}),
		} as FlagChunk;
	}, []);

	const { state: { threads, currentThreadId, messages, artifacts, currentView, selectedTool, document, image }, createThread, setView } = useWorkspace();

	const handleStartAnalysis = async (message: string) => {
		// Create a new thread with the message as the title
		const threadId = await createThread(message);
		// Set the view to DocViewer
		setView('DocViewer');
		// Hide the launch chat
		setShowLaunchChat(false);
	};

	return (
		<div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
			{/* Sidebar - Fixed width */}
			<div className="w-[240px] h-full bg-[#F4F5F7] border-r border-gray-200 shrink-0">
				<SidebarComp 
					setShowSettings={() => {}} 
					setShowLaunchChat={setShowLaunchChat}
				/>
			</div>

			{/* Main Content Area - Combined view */}
			<div className="flex-1 h-full">
				{showLaunchChat ? (
					<LaunchChat onStartAnalysis={handleStartAnalysis} />
				) : (
					<div className="flex h-full">
						{/* Whiteboard Area */}
						<div className="w-[calc(100%-500px)] h-full bg-white border-r border-gray-200">
							<Whiteboard />
						</div>
						{/* Chat Display */}
						<div className="w-[500px] h-full bg-[#F4F5F7]/[0.43]">
							<ChatWrapper sendOnConnect={sendOnConnect} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SinglePageApp; 