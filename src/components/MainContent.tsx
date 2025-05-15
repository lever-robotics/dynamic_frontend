import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { FlagChunk } from "@/types/chat";
import { useUserConfig } from "@/utils/UserConfigProvider";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { ChatDisplay } from "./Chat/ChatDisplay";
import { ChatInput } from "./Chat/ChatInput";
import { LaunchChat } from "./LaunchChat";
import { SidebarComp } from "./Sidebar";
import { Whiteboard } from "./Whiteboard";

// interface MainContentProps {}

export const MainContent: React.FC = () => {
	console.log("[SinglePageApp] Rendering");
	const {
		state: { artifacts, messages },
		createThread,
		setView,
		setDocument,
		// initializeWorkspace,
		currentThreadId,
		switchThread,
	} = useWorkspace();
	const { userConfig } = useUserConfig();

	// Initialize workspace on mount
	// useEffect(() => {
	// 	console.log("[SinglePageApp] Initializing workspace");
	// 	initializeWorkspace();
	// }, [initializeWorkspace]);

	const sendOnConnect = useCallback(() => {
		console.log("[ChatWrapper] Creating initial connection message");
		return {
			type: "flag",
			flag: "query",
			context: {
				business_overview: userConfig.business_overview || "",
				data_connectors: userConfig.data_connectors || [],
				messages: messages || [],
				artifacts: {
					images: artifacts.images || [],
					documents: artifacts.documents || [],
					queries: artifacts.queries || [],
				},
			},
		} as unknown as FlagChunk;
	}, [userConfig, messages, artifacts]);

	// this function is called when on the launchchat compoent when the user clicks to start a new analysis, this gives it time to incilize the workspace, create the thread
	const handleStartAnalysis = async (message: string) => {
		console.log(
			"[SinglePageApp] Create Thread, set currentThread, added to threads turn off launch chat displaty:",
			message,
		);

		try {
			// Create a new thread with the message as the title
			const threadId = await createThread(message);
			console.log("[SinglePageApp] Created thread with ID:", threadId);

			// Set the view to DocViewer
			setView("DocViewer");
			setDocument(artifacts.documents[0]);

			console.log("[SinglePageApp] Analysis started successfully");
		} catch (error) {
			console.error("[SinglePageApp] Failed to start analysis:", error);
			// Handle error appropriately
		}
	};

	console.log("[MainContent] currentThreadId:", currentThreadId);

	return (
		<div className="flex h-screen overflow-hidden bg-portage-50">
			{/* Main Content Area */}
			{/* If no thread is selected, show the launch chat */}
			{currentThreadId === "" && (
				<div className="flex flex-col items-center justify-center h-full w-full bg-background">
					<div className="w-full max-w-2xl p-4">
						<div className="w-full">
							<ChatInput onSubmit={handleStartAnalysis} isLaunchMode={true} />
						</div>
					</div>
				</div>
			)}

			{/* If a thread is selected, show the whiteboard and chat */}
			{currentThreadId !== "" && (
				<div className="w-full flex h-full">
					{/* Whiteboard Area - Fixed width */}
					<div className="w-[calc(100%-500px)] h-full bg-white border-r border-gray-200">
						<Whiteboard />
					</div>

					{/* Chat Area - Fixed width */}
					<div className="w-[500px] h-full bg-[#F4F5F7]/[0.43]">
						<ChatDisplay key={currentThreadId} sendOnConnect={sendOnConnect} />
					</div>
				</div>
			)}
		</div>
	);
};

export default MainContent;
