import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { useUserConfig } from "@/utils/UserConfigProvider";
import type React from "react";
import { useState } from "react";
import { ChatInput } from "./Chat/ChatInput";
import { MainContent } from "./MainContent";
import { SettingsDisplay } from "./SettingsDisplay";
import SidebarComp from "./Sidebar";
import { AnalyzingBusiness } from "./onboarding/AnalyzingBusiness";
import { Blueprint } from "./onboarding/Blueprint";
import { BusinessSetup } from "./onboarding/BusinessSetup";

// LeverApp component with new flow implementation
export const LeverApp: React.FC = () => {
	const { userConfig, upsertUserConfig, createThread } = useUserConfig(); // universal configurations for the user
	const [isFirstTime, setIsFirstTime] = useState(
		!userConfig?.completed_onboarding,
	);
	const [showBlueprint, setShowBlueprint] = useState(false);
	const [showSettings, setShowSettings] = useState(false); // should not be able to see settings and blueprint at the same time
	const [businessInfo, setBusinessInfo] = useState<{
		name: string;
		url: string;
	} | null>(null); // info passed in the first time onbaroding between the two components
	const [currentThreadId, setCurrentThreadId] = useState<string>("");
	const [isQueryData, setIsQueryData] = useState(false);

	const handleQueryDataClick = async () => {
		if (currentThreadId === "") {
			const threadId = await createThread("Query Data");
			setCurrentThreadId(threadId);
		}
		setIsQueryData(true);
		setTimeout(() => {
			setIsQueryData(false);
		}, 1000);
	};

	const handleStartThread = async (message: string) => {
		try {
			// Create a new thread with the message as the title
			const threadId = await createThread(message);
			setCurrentThreadId(threadId);
		} catch (error) {
			console.error("[LeverApp] Failed to start thread:", error);
			// Handle error appropriately
		}
	};

	const switchThread = (threadId: string) => {
		setCurrentThreadId(threadId);
	};

	const resetOnboarding = () => {
		setIsFirstTime(true);
		setBusinessInfo(null);
		setShowSettings(false);
	};

	return (
		<div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
			{/* Sidebar - Fixed width */}
			<div className="w-[240px] h-full bg-[#F4F5F7] border-r border-gray-200 shrink-0">
				<SidebarComp
					setShowSettings={setShowSettings}
					setShowBlueprint={setShowBlueprint}
					handleQueryDataClick={handleQueryDataClick}
					switchThread={switchThread}
					currentThreadId={currentThreadId}
				/>
			</div>

			{/* Render Whiteboard and Chat */}
			<div className="w-[calc(100%-240px)] flex h-screen overflow-hidden bg-portage-50">
				{currentThreadId === "" ? (
					<div className="flex flex-col items-center justify-center h-full w-full bg-background">
						<div className="w-full max-w-2xl p-4">
							<div className="w-full">
								<ChatInput isConnected={false} onSubmit={handleStartThread} />
							</div>
						</div>
					</div>
				) : (
					<WorkspaceProvider
						threadId={currentThreadId}
						isQueryData={isQueryData}
					>
						<MainContent threadId={currentThreadId} queryData={isQueryData} />
					</WorkspaceProvider>
				)}
			</div>

			{/* Settings Display */}
			{showSettings && (
				<SettingsDisplay
					onClose={() => setShowSettings(false)}
					showBlueprint={() => setShowBlueprint(true)}
					resetOnboarding={resetOnboarding}
				/>
			)}

			{/* Blueprint Modal */}
			{showBlueprint && (
				<WorkspaceProvider threadId={null} isQueryData={false}>
					<Blueprint onClose={() => setShowBlueprint(false)} />
				</WorkspaceProvider>
			)}

			{/* First-time user flow */}
			{isFirstTime && (
				<>
					<BusinessSetup
						onClose={() => {
							//pass
						}}
						setBusinessInfo={setBusinessInfo}
					/>
					{businessInfo && (
						<WorkspaceProvider threadId={null} isQueryData={false}>
							<AnalyzingBusiness
								onComplete={() => {
									setIsFirstTime(false);
									userConfig.completed_onboarding = true;
									upsertUserConfig(userConfig);
									setShowBlueprint(true);
								}}
								businessInfo={businessInfo || undefined}
							/>
						</WorkspaceProvider>
					)}
				</>
			)}
		</div>
	);
};

export default LeverApp;
