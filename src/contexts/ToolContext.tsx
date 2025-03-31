import type React from 'react';
import { createContext, useContext, useState } from 'react';
import type { ToolExecutionBubble } from '@/types/chat';

interface ToolContextType {
    selectedTool: ToolExecutionBubble | null;
    setSelectedTool: (tool: ToolExecutionBubble | null) => void;
}

const ToolContext = createContext<ToolContextType | null>(null);

export function useToolContext() {
    const context = useContext(ToolContext);
    if (!context) {
        throw new Error('useToolContext must be used within a ToolProvider');
    }
    return context;
}

export function ToolProvider({ children }: { children: React.ReactNode }) {
    const [selectedTool, setSelectedTool] = useState<ToolExecutionBubble | null>(null);
    
    return (
        <ToolContext.Provider value={{ 
            selectedTool, 
            setSelectedTool,
        }}>
            {children}
        </ToolContext.Provider>
    );
} 