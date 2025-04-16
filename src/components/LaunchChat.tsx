import { useState } from 'react';
import { ChatInput } from './Chat/ChatInput';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface LaunchChatProps {
    onStartAnalysis: (message: string) => void;
}

export function LaunchChat({ onStartAnalysis }: LaunchChatProps) {
    const [isConnected] = useState(true); // Always connected in this context

    const handleSubmit = (message: string) => {
        onStartAnalysis(message);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-background">
            <div className="w-full max-w-2xl p-4">
                <div className="w-full">
                    <ChatInput
                        isConnected={isConnected}
                        onSubmit={handleSubmit}
                        isLaunchMode={true}
                    />
                </div>
            </div>
        </div>
    );
} 