import React from "react";
import { useCallback } from "react";
import { SidebarComp } from "./Sidebar";
import { ChatDisplay } from "./Chat/ChatDisplay";
import { Whiteboard } from "./Whiteboard";
import type { FlagChunk } from "@/types/chat";
import { useWorkspace } from "@/contexts/WorkspaceContext";

// ChatWrapper component to handle workspace context
function ChatWrapper({ sendOnConnect }: { sendOnConnect: () => FlagChunk }) {
	const { setSelectedTool, setDocument, setImage, state } = useWorkspace();

	// Log message bubbles when they change
	React.useEffect(() => {
		console.log('Message bubbles updated:', state.messages);
	}, [state.messages]);

	return (
		<ChatDisplay
			sendOnConnect={sendOnConnect}
			onToolSelect={setSelectedTool}
			setDocument={setDocument}
			setImage={setImage}
		/>
	);
}

export const SinglePageApp: React.FC = () => {
	const sendOnConnect = useCallback(() => {
		return {
			type: "flag",
			flag: "query",
			context: JSON.stringify({}),
		} as FlagChunk;
	}, []);
    const { state: { threads, currentThreadId, messages, artifacts, currentView, selectedTool, document, image } } = useWorkspace();
	console.log('Current View:', currentView);
	console.log('Selected Tool:', selectedTool);
	console.log('Document:', document);
	console.log('Image:', image);
	console.log('Threads:', threads);
	console.log('Current Thread ID:', currentThreadId);
	console.log('Messages:', messages);
	console.log('Artifacts:', artifacts);

	return (
		<div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
			{/* Sidebar */}
			<div className="h-full bg-[#F4F5F7] border-r border-gray-200">
				<SidebarComp setShowSettings={() => {}} />
			</div>

			{/* Middle Content Area */}
			<div className="flex-1 h-full bg-white border-r border-gray-200">
				<Whiteboard />
			</div>

			{/* Chat Display */}
			<div className="w-1/3 h-full bg-[#F4F5F7]/[0.43]">
				<ChatWrapper sendOnConnect={sendOnConnect} />
			</div>
		</div>
	);
};

export default SinglePageApp; 