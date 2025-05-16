import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { useUserConfig } from "@/utils/UserConfigProvider";
import type React from "react";
import { useState } from "react";
import { SettingsDisplay } from "./SettingsDisplay";
import { SinglePageApp } from "./SinglePageApp";
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

	const resetOnboarding = () => {
		setIsFirstTime(true);
		setBusinessInfo(null);
		setShowSettings(false);
	};

	return (
		<div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
			<WorkspaceProvider>
				{/* Render Sidebar, Whiteboard, Chat */}
				<SinglePageApp
					setShowSettings={setShowSettings}
					setShowBlueprint={setShowBlueprint}
				/>

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
			</WorkspaceProvider>
		</div>
	);
};

export default LeverApp;
