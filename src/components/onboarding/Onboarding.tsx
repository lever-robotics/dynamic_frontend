import { ToolProvider } from "@/contexts/ToolContext";
import type { FlagChunk } from "@/types/chat";
import { useCallback, useState } from "react";
import { Modal } from "../common/Modal";
import { BusinessSetup } from "./BusinessSetup";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";

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
