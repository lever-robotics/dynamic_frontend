import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { FlagChunk } from "@/types/chat";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { ChatDisplay } from "./Chat/ChatDisplay";
import { LaunchChat } from "./LaunchChat";
import { SidebarComp } from "./Sidebar";
import { Whiteboard } from "./Whiteboard";

interface SinglePageAppProps {
	setShowSettings: (show: boolean) => void;
	setShowBlueprint: (show: boolean) => void;
}

// ChatWrapper component to handle workspace context
function ChatWrapper({ isLaunchMode = false }: { isLaunchMode?: boolean }) {
	const {
		state: { currentThreadId },
	} = useWorkspace();

	const sendOnConnect = useCallback(() => {
		console.log("[ChatWrapper] Creating initial connection message");
		return {
			type: "flag",
			flag: "query",
			context: JSON.stringify({}),
		} as FlagChunk;
	}, []);

	return (
		<ChatDisplay
			key={currentThreadId}
			sendOnConnect={sendOnConnect}
			isLaunchMode={isLaunchMode}
		/>
	);
}

export const SinglePageApp: React.FC<SinglePageAppProps> = ({
	setShowSettings,
	setShowBlueprint,
}) => {
	console.log("[SinglePageApp] Rendering");
	const [showLaunchChat, setShowLaunchChat] = useState(true);
	const [isLaunchMode, setIsLaunchMode] = useState(false);
	const [isInitializing, setIsInitializing] = useState(false); //starting up the workspace
	const {
		state: { threads, currentThreadId },
		createThread,
		setView,
		initializeWorkspace,
		setLaunchChatMessage,
	} = useWorkspace();

	// Initialize workspace on mount
	useEffect(() => {
		console.log("[SinglePageApp] Initializing workspace");
		initializeWorkspace();
	}, [initializeWorkspace]);

	// this function is called when on the launchchat compoent when the user clicks to start a new analysis, this gives it time to incilize the workspace, create the thread
	const handleStartAnalysis = async (message: string) => {
		console.log(
			"[SinglePageApp] Create THread, set currentThread, added to threads turn off launch chat displaty:",
			message,
		);
		if (isInitializing) {
			console.log("[SinglePageApp] Already initializing, skipping");
			return;
		}

		try {
			setIsLaunchMode(true);
			setIsInitializing(true);
			// Create a new thread with the message as the title
			const threadId = await createThread(message);
			setLaunchChatMessage(message);
			console.log("[SinglePageApp] Created thread with ID:", threadId);

			// Set the view to DocViewer
			setView("DocViewer");

			// Hide the launch chat
			setShowLaunchChat(false);
			console.log("[SinglePageApp] Analysis started successfully");
		} catch (error) {
			console.error("[SinglePageApp] Failed to start analysis:", error);
			// Handle error appropriately
		} finally {
			setIsInitializing(false);
		}
	};

	const handleQueryDataClick = async () => {
		setShowLaunchChat(false);
		setIsLaunchMode(true);
		setView("DataExecutor");

		if (isInitializing) {
			console.log("[SinglePageApp] Already initializing, skipping");
			return;
		}

		try {
			setIsLaunchMode(true);
			setIsInitializing(true);
			// Create a new thread with the message as the title
			const threadId = await createThread("Query Data");
			setLaunchChatMessage("Query Data");
			console.log("[SinglePageApp] Created thread with ID:", threadId);

			// Set the view to DocExecutor
			setView("DataExecutor");

			// Hide the launch chat
			setShowLaunchChat(false);
			console.log("[SinglePageApp] Analysis started successfully");
		} catch (error) {
			console.error("[SinglePageApp] Failed to start analysis:", error);
			// Handle error appropriately
		} finally {
			setIsInitializing(false);
		}
	};

	return (
		<div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
			{/* Sidebar - Fixed width */}
			<div className="w-[240px] h-full bg-[#F4F5F7] border-r border-gray-200 shrink-0">
				<SidebarComp
					setShowSettings={setShowSettings}
					setIsLaunchMode={setIsLaunchMode}
					setShowBlueprint={setShowBlueprint}
					setShowLaunchChat={setShowLaunchChat}
					handleQueryDataClick={handleQueryDataClick}
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
						{/* Chat Display or Placeholder */}
						<div className="w-[500px] h-full bg-[#F4F5F7]/[0.43]">
							{!isInitializing && currentThreadId ? (
								<ChatWrapper isLaunchMode={isLaunchMode} />
							) : (
								<div className="w-full h-full bg-[#F4F5F7]/[0.43] flex items-center justify-center">
									<div className="text-gray-400" />
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SinglePageApp;
