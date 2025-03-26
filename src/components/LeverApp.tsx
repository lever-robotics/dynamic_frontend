import type React from "react";
import { useEffect, useState } from "react";
import { SidebarComp } from "../components/Sidebar";
import { ChatDisplay } from "./Chat/ChatDisplay";

// LeverApp component with search query management
export const LeverApp: React.FC = () => {
	// Add state for AI chat visibility
	const [showAIChat, setShowAIChat] = useState(true);

	return (
		<div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
			{/* Sidebar */}
			<SidebarComp />

			{/* Middle Content Area */}
			<div className="flex-1 flex flex-col items-center bg-white max-h-[calc(100%-20px)] min-h-[calc(100%-20px)] rounded-xl overflow-auto pb-16 shadow-lg transition-all duration-300 m-2.5" />

			{/* Chat Display */}
			<div className="w-1/3 h-full border-l border-gray-200 bg-white">
				<ChatDisplay />
			</div>
		</div>
	);
};

export default LeverApp;
