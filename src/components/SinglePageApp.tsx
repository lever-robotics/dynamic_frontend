import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { FlagChunk } from "@/types/chat";
import { useUserConfig } from "@/utils/UserConfigProvider";
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
		state: { currentThreadId, messages, artifacts },
	} = useWorkspace();
	const { userConfig } = useUserConfig();

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
		} as FlagChunk;
	}, [userConfig, messages, artifacts]);

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
		state: { threads, currentThreadId, artifacts },
		createThread,
		setCurrentArtifact,
		initializeWorkspace,
		setLaunchChatMessage,
		addArtifact,
		setCurrentArtifactById,
	} = useWorkspace();

	// Initialize workspace on mount
	useEffect(() => {
		console.log("[SinglePageApp] Initializing workspace");
		initializeWorkspace();
	}, [initializeWorkspace]);

	// this function is called when on the launchchat compoent when the user clicks to start a new analysis, this gives it time to incilize the workspace, create the thread
	const handleStartAnalysis = async (message: string) => {
		console.log(
			"[SinglePageApp] Create Thread, set currentThread, added to threads turn off launch chat displaty:",
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

			// Set the current artifact to the first document
			setCurrentArtifact(artifacts.documents[0]);

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
		if (currentThreadId === "") {
			const threadId = await createThread("Query Data");
			// Create a blank query artifact
			const id = await addArtifact("query", "");
			// Set the current artifact to the first query
			setCurrentArtifactById(id);
			// Hide the launch chat
			setShowLaunchChat(false);
		} else {
			// Create a blank query artifact
			const id = await addArtifact("query", "");
			// Set the current artifact to the first query
			setCurrentArtifactById(id);
		}
	};

	return (
		<div className="flex w-screen h-screen overflow-hidden bg-portage-50">
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

			{/* Main Content Area */}
			<div className="flex-1 h-full overflow-hidden">
				{showLaunchChat ? (
					<LaunchChat onStartAnalysis={handleStartAnalysis} />
				) : (
					<div className="flex h-full">
						{/* Whiteboard Area - Fixed width */}
						<div className="w-[calc(100%-500px)] h-full bg-white border-r border-gray-200 overflow-hidden">
							<Whiteboard />
						</div>

						{/* Chat Area - Fixed width */}
						<div className="w-[500px] h-full bg-[#F4F5F7]/[0.43] shrink-0">
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
