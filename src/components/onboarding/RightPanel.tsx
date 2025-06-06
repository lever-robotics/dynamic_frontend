import { useToolContext } from "@/contexts/ToolContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import BlueprintChat from "./BlueprintChat";

export function RightPanel() {
	// This Chat display will no actually set image or document or select a tool.

	return (
		<div className="w-[600px] border-l border-gray-200">
			<WorkspaceProvider threadId="" isQueryData={false}>
				<BlueprintChat />
			</WorkspaceProvider>
		</div>
	);
}
