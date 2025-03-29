import { useState } from "react";
import { Modal } from "../common/Modal";
import { ChatDisplay } from "../Chat/ChatDisplay";
import type { ToolExecution, WebSocketMessage } from "@/types/chat";
import { DocumentView } from "./DocumentView";
import { ToolDetail } from "./ToolDetail";
import { BusinessInfoSection } from "./BusinessInfoSection";

interface OnboardingProps {
	onClose: () => void;
}

export interface BusinessInfo {
    name: string;
    url: string;
}

export function Onboarding({ onClose }: OnboardingProps) {
	const [selectedTool, setSelectedTool] = useState<ToolExecution | null>(null);
	const [documentContent, setDocumentContent] = useState<string>("");
    const [showBusinessInfoSection, setShowBusinessInfoSection] = useState(true);
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);


    const sendOnConnect = () => {
        if (businessInfo) {
            return {
                type: "context",
                payload: { type: "context", context: JSON.stringify(businessInfo) }
            } as WebSocketMessage;
        }
        return null;
    }

	return (
        <>
            {showBusinessInfoSection && (
                <BusinessInfoSection
                onClose={() => setShowBusinessInfoSection(false)}
                setBusinessInfo={setBusinessInfo}
            />
        )}
		{!showBusinessInfoSection && (
            <Modal isOpen={true} onClose={onClose}>
                <div className="flex h-[90vh]">
                    {/* Left Panel */}
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

				{/* Right Panel */}
				<div className="w-[600px] border-l border-gray-200">
					<ChatDisplay
						// onToolSelect={(tool) => setSelectedTool(tool)}
						// onDocumentUpdate={(content) => setDocumentContent(content)}
                        sendOnConnect={sendOnConnect}
					/>
				</div>
			</div>
		</Modal>)}
        </>
	);
}
