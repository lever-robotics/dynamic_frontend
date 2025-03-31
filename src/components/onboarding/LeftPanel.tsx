import { useState } from 'react';
import { useToolContext } from '@/contexts/ToolContext';
import { DocumentView } from './DocumentView';
import { ToolDetail } from './ToolDetail';

export function LeftPanel() {
    const { selectedTool, setSelectedTool } = useToolContext();
    const [documentContent, setDocumentContent] = useState<string>("");

    return (
        <div className="w-[800px] border-r border-gray-200">
            {selectedTool ? (
                <ToolDetail
                    tool={selectedTool}
                    onClose={() => setSelectedTool(null)}
                />
            ) : (
                <DocumentView
                    content={documentContent}
                    onUpdate={setDocumentContent}
                    isEditable={true}
                />
            )}
        </div>
    );
} 