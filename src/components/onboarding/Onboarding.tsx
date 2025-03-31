import { useState, useCallback } from "react";
import { Modal } from "../common/Modal";
import { ChatDisplay } from "../Chat/ChatDisplay";
import type { ContextChunk, ToolExecutionBubble } from "@/types/chat";
import { DocumentView } from "./DocumentView";
import { ToolDetail } from "./ToolDetail";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { ToolProvider } from "@/contexts/ToolContext";

interface OnboardingProps {
	onClose: () => void;
}

export interface BusinessInfo {
	name: string;
	url: string;
}

export function Onboarding({ onClose }: OnboardingProps) {
	const [showBusinessInfoSection, setShowBusinessInfoSection] = useState(true);
	const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);

	const sendOnConnect = useCallback(() => {
		if (businessInfo) {
			return {
				type: "context",
				context: JSON.stringify(businessInfo),
			} as ContextChunk;
		}
		return null;
	}, [businessInfo]);

	return (
		<ToolProvider>
			{showBusinessInfoSection ? (
				<BusinessInfoSection
					onClose={() => setShowBusinessInfoSection(false)}
					setBusinessInfo={setBusinessInfo}
				/>
			) : (
				<Modal isOpen={true} onClose={onClose}>
					<div className="flex h-[90vh]">
						<LeftPanel />
						<RightPanel sendOnConnect={sendOnConnect} />
					</div>
				</Modal>
			)}
		</ToolProvider>
	);
}
