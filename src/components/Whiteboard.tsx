import { useToolContext } from "@/contexts/ToolContext";
import { ToolDetail } from "./onboarding/ToolDetail";

export function Whiteboard() {
    const { selectedTool, setSelectedTool } = useToolContext();

    return (
        <div className="flex-1 flex flex-col items-center bg-white max-h-[calc(100%-20px)] min-h-[calc(100%-20px)] rounded-xl overflow-auto pb-16 shadow-lg transition-all duration-300 m-2.5">
            {selectedTool && (
                <div className="w-full p-4">
                    <ToolDetail
                        tool={selectedTool}
                        onClose={() => setSelectedTool(null)}
                    />
                </div>
            )}
        </div>
    );
} 