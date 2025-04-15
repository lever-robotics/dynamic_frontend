import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { SidebarComp } from "../components/Sidebar";
import { ChatDisplay } from "./Chat/ChatDisplay";
import { SettingsDisplay } from "./SettingsDisplay";
import { BusinessSetup } from "./onboarding/BusinessSetup";
import { AnalyzingBusiness } from "./onboarding/AnalyzingBusiness";
import { Blueprint } from "./onboarding/Blueprint";
import { Whiteboard } from "./Whiteboard";
import { ToolProvider } from "@/contexts/ToolContext";
import type { FlagChunk } from "@/types/chat";
import { useToolContext } from "@/contexts/ToolContext";
import { useAuth } from "@/utils/AuthProvider";

// ChatWrapper component to handle tool context
function ChatWrapper({ sendOnConnect }: { sendOnConnect: () => FlagChunk }) {
	const { setSelectedTool, setDocument, setImage } = useToolContext();

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
	const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
	const [isFirstTime, setIsFirstTime] = useState(true);
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
			{/* Sidebar */}
			<SidebarComp setShowSettings={setShowSettings} />

			<ToolProvider>
				{/* Middle Content Area */}
				<Whiteboard />

				{/* Chat Display */}
				<div className="w-1/3 h-full border-l border-gray-200 bg-white">
					<ChatWrapper sendOnConnect={sendOnConnect} />
				</div>
			</ToolProvider>

			{/* Settings Display */}
			{showSettings && (
				<SettingsDisplay 
					onClose={() => setShowSettings(false)} 
					showBlueprint={() => setShowBlueprint(true)}
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
						/>
					)}
				</>
			)}

			{/* Blueprint Modal */}
			{showBlueprint && (
				<Blueprint
					onClose={() => setShowBlueprint(false)}
					businessInfo={businessInfo || undefined}
				/>
			)}
		</div>
	);
};

export default LeverApp;
