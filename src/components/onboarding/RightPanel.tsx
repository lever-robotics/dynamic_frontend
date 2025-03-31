import { useToolContext } from '@/contexts/ToolContext';
import { ChatDisplay } from '../Chat/ChatDisplay';
import type { Payload } from '@/types/chat';

interface RightPanelProps {
    sendOnConnect: () => Payload | null;
}

export function RightPanel({ sendOnConnect }: RightPanelProps) {
    const { setSelectedTool, setDocument } = useToolContext();

    return (
        <div className="w-[600px] border-l border-gray-200">
            <ChatDisplay
                setDocument={setDocument}
                sendOnConnect={sendOnConnect}
                onToolSelect={setSelectedTool}
            />
        </div>
    );
} 