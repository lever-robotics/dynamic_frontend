import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ToolDetail } from "./onboarding/ToolDetail";

export function DataExecutor() {
    const { state: { selectedTool } } = useWorkspace();

    return (
        <div className="w-full h-full">
            {selectedTool ? (
                <div className="w-full p-4">
                    <ToolDetail
                        tool={selectedTool}
                        onClose={() => {}}
                    />
                </div>
            ) : (
                <div className="flex justify-center items-center h-full w-full">
                    <p className="text-gray-500">Select a tool to execute</p>
                </div>
            )}
        </div>
    );
}

export default DataExecutor;