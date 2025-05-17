import { WorkspaceProvider, useWorkspace } from "@/contexts/WorkspaceContext";
import { useUserConfig } from "@/utils/UserConfigProvider";
import type React from "react";
import { useState } from "react";
import { MainContent } from "./MainContent";
import { SettingsDisplay } from "./SettingsDisplay";
import SidebarComp from "./Sidebar";
import { AnalyzingBusiness } from "./onboarding/AnalyzingBusiness";
import { Blueprint } from "./onboarding/Blueprint";
import { BusinessSetup } from "./onboarding/BusinessSetup";

// LeverApp component with new flow implementation
export const LeverApp: React.FC = () => {
	const { userConfig, upsertUserConfig } = useUserConfig(); // universal configurations for the user
	const [isFirstTime, setIsFirstTime] = useState(
		!userConfig?.completed_onboarding,
	);
	const [showBlueprint, setShowBlueprint] = useState(false);
	const [showSettings, setShowSettings] = useState(false); // should not be able to see settings and blueprint at the same time
	const [businessInfo, setBusinessInfo] = useState<{
		name: string;
		url: string;
	} | null>(null); // info passed in the first time onbaroding between the two components
	const {
		switchThread,
		createThread,
		setCurrentArtifactById,
		setCurrentArtifact,
		addArtifact,
		currentThreadId,
	} = useWorkspace();

	const handleQueryDataClick = async () => {
		if (currentThreadId === "") {
			const threadId = await createThread("Query Data");
			// Create a blank query artifact
			const artifact = await addArtifact("query", "", crypto.randomUUID());
			// Set the current artifact to the first query
			setCurrentArtifact(artifact);
		} else {
			// Create a blank query artifact
			const artifact = await addArtifact("query", "", crypto.randomUUID());
			// Set the current artifact to the first query
			setCurrentArtifact(artifact);
		}
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
					setShowLaunchChat={() => switchThread("")}
					handleQueryDataClick={handleQueryDataClick}
				/>
			</div>

			{/* Render Whiteboard and Chat */}
			<div className="w-[calc(100%-240px)]">
				<MainContent />
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
			{showBlueprint && <Blueprint onClose={() => setShowBlueprint(false)} />}

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
						<AnalyzingBusiness
							onComplete={() => {
								setIsFirstTime(false);
								userConfig.completed_onboarding = true;
								upsertUserConfig(userConfig);
								setShowBlueprint(true);
							}}
							businessInfo={businessInfo || undefined}
						/>
					)}
				</>
			)}
		</div>
	);
};

export default LeverApp;
