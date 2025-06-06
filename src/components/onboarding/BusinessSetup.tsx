"use client";
import defaultLogo from "@/assets/default_business_logo.png";
import { userConfigStore } from "@/stores/UserConfigStore";
import type { Connection } from "@/types/connectors";
import { Connections } from "@/types/connectors";
import { authStore } from "@/utils/AuthProvider";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal } from "../common/Modal";
import { IntegrationSection } from "./IntegrationSection";
import type { BusinessInfo } from "./Onboarding";

interface BusinessSetupProps {
	onClose: () => void;
	setBusinessInfo: (info: BusinessInfo) => void;
}

export function BusinessSetup({
	onClose,
	setBusinessInfo,
}: BusinessSetupProps) {
	const session = authStore.session;
	const [businessName, setBusinessName] = useState("HydroJug");
	const [businessUrl, setBusinessUrl] = useState(
		"https://www.thehydrojug.com/",
	);
	const [logoUrl, setLogoUrl] = useState(defaultLogo);
	const applicableConnections = userConfigStore.userConfig?.connections?.map(
		(connection: Connection) => ({
			...connection,
			isConnected: userConfigStore.userConfig?.connections.some(
				(conn) => conn.type === connection.type,
			),
		}),
	);

	const handleContinue = () => {
		if (businessName && businessUrl) {
			userConfigStore.upsertUserConfig({
				...userConfigStore.userConfig,
				business_name: businessName,
				business_url: businessUrl,
			});
			onClose();
		}
	};

	return (
		<Modal
			isOpen={true}
			onClose={() => {}}
			size="lg"
			showCloseButton={false}
			preventBackgroundClick={true}
		>
			<div className="flex flex-col gap-6 drop-shadow-sm">
				<h1 className="text-2xl font-semibold text-neutral-900 font-semibold font-heading mt-2">
					Set up your business
				</h1>
				<section className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<label
							htmlFor="businessName"
							className="text-sm font-medium text-zinc-800"
						>
							Business Name
						</label>
						<input
							type="text"
							id="businessName"
							placeholder="Enter your business name"
							className="px-4 py-3 w-full text-base rounded-lg border"
							value={businessName}
							onChange={(event) => setBusinessName(event.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label
							htmlFor="businessUrl"
							className="text-sm font-medium text-zinc-800"
						>
							Business URL
						</label>
						<input
							type="text"
							id="businessUrl"
							placeholder="Enter your business URL"
							className="px-4 py-3 w-full text-base rounded-lg border"
							value={businessUrl}
							onChange={(event) => setBusinessUrl(event.target.value)}
						/>
					</div>
				</section>
				<IntegrationSection connections={applicableConnections} />
				<div className="mt-4">
					<button
						type="button"
						className="px-6 py-4 w-full text-base rounded-lg bg-accent-100 text-accent-700 hover:bg-accent-200 transition-colors font-medium shadow-sm"
						onClick={handleContinue}
						disabled={!businessName || !businessUrl}
					>
						Continue
					</button>
				</div>
			</div>
		</Modal>
	);
}

export default observer(BusinessSetup);
