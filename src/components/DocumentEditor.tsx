import { useWorkspace } from "@/contexts/WorkspaceContext";
import { BusinessOverview } from "./onboarding/BusinessOverview";

export function DocumentEditor() {
    const { state: { document, image } } = useWorkspace();

    return (
        <div className="w-full h-full">
            {document ? (
                <BusinessOverview />
            ) : image ? (
                <div className="flex justify-center items-center h-full w-full">
                    <img
                        src={`data:image/png;base64,${image}`}
                        alt="Document Content"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            ) : (
                <div className="flex justify-center items-center h-full w-full">
                    <p className="text-gray-500">No document to display</p>
                </div>
            )}
        </div>
    );
} 