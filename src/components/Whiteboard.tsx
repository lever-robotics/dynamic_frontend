import { useWorkspace } from "@/contexts/WorkspaceContext";
import { DocumentEditor } from "./DocumentEditor";
import { DataExecutor } from "./DataExecutor";

export function Whiteboard() {
    const { state: { currentView } } = useWorkspace();

    return (
        <div className="flex-1 flex flex-col items-center h-full overflow-auto">
            {currentView === 'DocViewer' ? (
                <DocumentEditor />
            ) : (
                <DataExecutor />
            )}
        </div>
    );
}