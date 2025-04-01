import { useState, useCallback } from "react";
import { Modal } from "../common/Modal";
import { ChatDisplay } from "../Chat/ChatDisplay";
import type { FlagChunk, ToolExecutionBubble } from "@/types/chat";
import { DocumentView } from "./DocumentView";
import { ToolDetail } from "./ToolDetail";
import { BusinessSetup } from "./BusinessSetup";
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
				type: "flag",
				flag: "onboarding",
				context: JSON.stringify(businessInfo),
			} as FlagChunk;
		}
		return null;
	}, [businessInfo]);

	return (
		<ToolProvider>
			{showBusinessInfoSection ? (
				<BusinessSetup
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
