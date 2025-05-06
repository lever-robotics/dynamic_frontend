import { ToolProvider } from "@/contexts/ToolContext";
import type { FlagChunk, ToolExecutionBubble } from "@/types/chat";
import { useCallback, useState } from "react";
import { ChatDisplay } from "../Chat/ChatDisplay";
import { Modal } from "../common/Modal";
import { DocumentView } from "./BusinessOverview";
import { BusinessSetup } from "./BusinessSetup";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { ToolDetail } from "./ToolDetail";

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
