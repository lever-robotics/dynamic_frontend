import { useToolContext } from '@/contexts/ToolContext';
import { ChatDisplay } from '../Chat/ChatDisplay';
import type { Payload } from '@/types/chat';

interface RightPanelProps {
    sendOnConnect: () => Payload | null;
}

export function RightPanel({ sendOnConnect }: RightPanelProps) {
    // This Chat display will no actually set image or document or select a tool.
    const { setSelectedTool, setDocument, setImage } = useToolContext();

    return (
        <div className="w-[600px] border-l border-gray-200">
            <ChatDisplay
                setDocument={setDocument}
                sendOnConnect={sendOnConnect}
                onToolSelect={setSelectedTool}
                setImage={setImage}
            />
        </div>
    );
} 