import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { SidebarComp } from "../components/Sidebar";
import { ChatDisplay } from "./Chat/ChatDisplay";
import { SettingsDisplay } from "./SettingsDisplay";
import { BusinessSetup } from "./onboarding/BusinessSetup";
import { AnalyzingBusiness } from "./onboarding/AnalyzingBusiness";
import { Blueprint } from "./onboarding/Blueprint";
import { Whiteboard } from "./Whiteboard";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import type { FlagChunk } from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { SinglePageApp } from "./SinglePageApp";

// ChatWrapper component to handle workspace context
function ChatWrapper({ sendOnConnect }: { sendOnConnect: () => FlagChunk }) {
	const { setSelectedTool, setDocument, setImage } = useWorkspace();

	return (
		<ChatDisplay
			sendOnConnect={sendOnConnect}
			onToolSelect={setSelectedTool}
			setDocument={setDocument}
			setImage={setImage}
		/>
	);
}

// LeverApp component with new flow implementation
export const LeverApp: React.FC = () => {
	const { userConfig } = useUserConfig();
	const [isFirstTime, setIsFirstTime] = useState(!userConfig?.completed_onboarding);
	const [showBlueprint, setShowBlueprint] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [businessInfo, setBusinessInfo] = useState<{ name: string; url: string } | null>(null);
	const { userId } = useAuth();

	const sendOnConnect = useCallback(() => {
		return {
			type: "flag",
			flag: "query",
			context: JSON.stringify({}),
		} as FlagChunk;
	}, []);

	return (
		<div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
			<WorkspaceProvider>
				<SinglePageApp />

				{/* Settings Display */}
				{showSettings && (
					<SettingsDisplay 
						onClose={() => setShowSettings(false)} 
						showBlueprint={() => setShowBlueprint(true)}
					/>
				)}

				{/* Blueprint Modal */}
				{showBlueprint && (
					<Blueprint
						onClose={() => setShowBlueprint(false)}
					/>
				)}

				{/* First-time user flow */}
				{isFirstTime && (
					<>
						<BusinessSetup
							onClose={() => setIsFirstTime(true)}
							setBusinessInfo={setBusinessInfo}
						/>
						{businessInfo && (
							<AnalyzingBusiness
								onComplete={() => {
									setIsFirstTime(false);
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
