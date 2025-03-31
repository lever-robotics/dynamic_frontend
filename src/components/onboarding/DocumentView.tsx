import { useState, useEffect } from "react";
import { processText } from "@/utils/messageUtils";
import { JsonView } from "./JsonViewer";

interface DocumentViewProps {
    content: string;
    onUpdate?: (content: string) => void;
    isEditable?: boolean;
}

export function DocumentView({ 
    content, 
    onUpdate,
    isEditable = false 
}: DocumentViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableContent, setEditableContent] = useState(content);

    useEffect(() => {
        setEditableContent(content);
    }, [content]);

    const handleSave = () => {
        setIsEditing(false);
        onUpdate?.(editableContent);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Document</h2>
                {isEditable && (
                    <button
                        type="button"
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="px-3 py-1 rounded-md text-sm font-medium
                            bg-blue-50 text-blue-600 hover:bg-blue-100
                            transition-colors duration-200"
                    >
                        {isEditing ? "Save" : "Edit"}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {isEditing ? (
                    <textarea
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        className="w-full h-full min-h-[300px] p-2 border rounded-md
                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter document content..."
                    />
                ) : (
                    <div className="prose max-w-none">
                        {/* {processText(content)} */}
                        <JsonView data={JSON.parse(content)} />
                    </div>
                )}
            </div>
        </div>
    );
} 