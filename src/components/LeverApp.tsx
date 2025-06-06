import { userConfigStore } from "@/stores/UserConfigStore";
import { authStore } from "@/utils/AuthProvider";
import { observer } from "mobx-react-lite";
import type React from "react";
import { useEffect, useState } from "react";
import { ChatInput } from "./Chat/ChatInput";
import { MainContent } from "./MainContent";
import { SettingsDisplay } from "./SettingsDisplay";
import SidebarComp from "./Sidebar";
import { AnalyzingBusiness } from "./onboarding/AnalyzingBusiness";
import { Blueprint } from "./onboarding/Blueprint";
import { BusinessSetup } from "./onboarding/BusinessSetup";

// LeverApp component with new flow implementation
const LeverApp: React.FC = () => {
	const [isFirstTime, setIsFirstTime] = useState(
		userConfigStore.userConfig?.completed_onboarding === false,
	);
	const [showBlueprint, setShowBlueprint] = useState(false);
	const [showSettings, setShowSettings] = useState(false); // should not be able to see settings and blueprint at the same time
	const [businessInfo, setBusinessInfo] = useState<{
		name: string;
		url: string;
	} | null>(null); // info passed in the first time onbaroding between the two components

	useEffect(() => {
		if (authStore.session) {
			userConfigStore.fetchUserConfig(authStore.session.user.id);
			userConfigStore.fetchThreads(authStore.session.user.id);
		}
	}, []);

	// const handleQueryDataClick = async () => {
	// 	if (userConfigStore.threadId === "") {
	// 		const threadId = await userConfigStore.createThread("Query Data");
	// 		userConfigStore.threadId = threadId;
	// 	}
	// 	userConfigStore.ws?.queryData();
	// };

	// const switchThread = (threadId: string) => {
	// 	userConfigStore.threadId = threadId;
	// };
	console.log("Render LeverApp");

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
				/>
			</div>

			{/* Render Whiteboard and Chat */}
			<div className="w-[calc(100%-240px)] flex h-screen overflow-hidden bg-portage-50">
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
							onComplete={async () => {
								setIsFirstTime(false);
								await userConfigStore.upsertUserConfig({
									...userConfigStore.userConfig,
									completed_onboarding: true,
								});
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
