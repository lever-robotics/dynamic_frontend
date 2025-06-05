import { useToolContext } from "@/contexts/ToolContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ChatDisplay } from "../Chat/ChatDisplay";

export function RightPanel() {
	// This Chat display will no actually set image or document or select a tool.
	const { setSelectedTool } = useToolContext();

	return (
		<div className="w-[600px] border-l border-gray-200">
			<WorkspaceProvider threadId="" isQueryData={false}>
				<ChatDisplay />
			</WorkspaceProvider>
		</div>
	);
}
