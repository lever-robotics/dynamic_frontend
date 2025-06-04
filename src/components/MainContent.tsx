import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { FlagChunk } from "@/types/chat";
import { useUserConfig } from "@/utils/UserConfigProvider";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { ChatDisplay } from "./Chat/ChatDisplay";
import { ChatInput } from "./Chat/ChatInput";
import { SidebarComp } from "./Sidebar";
import { Whiteboard } from "./Whiteboard";
import { useToast } from "./ui/Toast/ToastProvider";

// interface MainContentProps {}

export const MainContent: React.FC = () => {
	console.log("[SinglePageApp] Rendering");
	const { artifacts, createThread, messages, currentThreadId } = useWorkspace();
	const { userConfig } = useUserConfig();
	const { showErrorToast, showSuccessToast } = useToast();

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

	// this function is called when on the launchchat component when the user clicks to start a new analysis
	const handleStartAnalysis = async (message: string) => {
		console.log(
			"[SinglePageApp] Create Thread, set currentThread, added to threads turn off launch chat display:",
			message,
		);

		try {
			// Validate message length
			if (message.length < 10) {
				throw new Error(
					"Please provide a more detailed message (at least 10 characters)",
				);
			}

			// Show loading toast
			showSuccessToast("Operation completed successfully");

			// Create a new thread with the message as the title
			const threadId = await createThread(message);
			console.log("[SinglePageApp] Created thread with ID:", threadId);

			// Show success toast
			showSuccessToast("Analysis started successfully");

			console.log("[SinglePageApp] Analysis started successfully");
		} catch (error) {
			console.error("[SinglePageApp] Failed to start analysis:", error);

			// Show error toast with retry option
			showErrorToast(error, {
				title: "Error Starting Analysis",
				retryFn: () => {
					handleStartAnalysis(message);
				},
			});
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
