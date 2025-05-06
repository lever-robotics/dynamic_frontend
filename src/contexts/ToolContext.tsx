import type { ToolExecutionBubble } from "@/types/chat";
import type React from "react";
import { createContext, useContext, useState } from "react";

interface ToolContextType {
	selectedTool: ToolExecutionBubble | null;
	setSelectedTool: (tool: ToolExecutionBubble | null) => void;
	document: string | null;
	setDocument: (document: string | null) => void;
	image: string | null;
	setImage: (image: string | null) => void;
}

const ToolContext = createContext<ToolContextType | null>(null);

export function useToolContext() {
	const context = useContext(ToolContext);
	if (!context) {
		throw new Error("useToolContext must be used within a ToolProvider");
	}
	return context;
}

export function ToolProvider({ children }: { children: React.ReactNode }) {
	const [selectedTool, setSelectedTool] = useState<ToolExecutionBubble | null>(
		null,
	);
	const [document, setDocument] = useState<string | null>(null);
	const [image, setImage] = useState<string | null>(null);

	return (
		<ToolContext.Provider
			value={{
				selectedTool,
				setSelectedTool,
				document,
				setDocument,
				image,
				setImage,
			}}
		>
			{children}
		</ToolContext.Provider>
	);
}
