import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { SidebarComp } from "../components/Sidebar";
import { ChatDisplay } from "./Chat/ChatDisplay";
import { SettingsDisplay } from "./SettingsDisplay";
import { Onboarding } from "./onboarding/Onboarding";
import { Whiteboard } from "./Whiteboard";
import { ToolProvider } from "@/contexts/ToolContext";
import type { FlagChunk } from "@/types/chat";
import { useToolContext } from "@/contexts/ToolContext";

// ChatWrapper component to handle tool context
function ChatWrapper({ sendOnConnect }: { sendOnConnect: () => FlagChunk }) {
	const { setSelectedTool, setDocument } = useToolContext();

	return (
		<ChatDisplay
			sendOnConnect={sendOnConnect}
			onToolSelect={setSelectedTool}
			setDocument={setDocument}
		/>
	);
}

// LeverApp component with search query management
export const LeverApp: React.FC = () => {
	// Add state for AI chat visibility
	const [showAIChat, setShowAIChat] = useState(true);
	const [showBusinessSetup, setShowBusinessSetup] = useState(false);
	const [showOnboarding, setShowOnboarding] = useState(true);
	const [showSettings, setShowSettings] = useState(false);

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
					{!showOnboarding && <ChatWrapper sendOnConnect={sendOnConnect} />}
				</div>
			</ToolProvider>

			{/* Settings Display */}
			{showSettings && (
				<SettingsDisplay onClose={() => setShowSettings(false)} showBusinessSetup={setShowBusinessSetup} showOnboarding={setShowOnboarding} />
			)}

			{/* Onboarding Modal */}
			{showOnboarding && (
				<Onboarding onClose={() => setShowOnboarding(false)} />
			)}
		</div>
	);
};

export default LeverApp;
