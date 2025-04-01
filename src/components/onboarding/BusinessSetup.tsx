"use client";
import type * as React from "react";
import { useState } from "react";
// import { BusinessInfoSection } from "./BusinessInfoSection";
import { X } from "lucide-react";
import gsIcon from "@/assets/gs.png";
import odooIcon from "@/assets/odoo.png";
import shopifyIcon from "@/assets/shopify.png";
import quickBooksIcon from "@/assets/quick_books.png";
import defaultLogo from "@/assets/default_business_logo.png";
import bigqueryIcon from "@/assets/bigquery.png";
import { Modal } from "../common/Modal";
// import { IntegrationModal } from "./IntegrationModal";
import type { BusinessInfo } from "./Onboarding";

export interface Integration {
	name: string;
	icon: string;
	description: string;
	isAvailable: boolean;
	isConnected?: boolean;
}

interface BusinessSetupProps {
	onClose: () => void;
	setBusinessInfo: (info: BusinessInfo) => void;
}

interface IntegrationsSectionProps {
	integrations: Integration[];
	isHovering: string | null;
	setIsHovering: (value: string | null) => void;
	onConnect: (integration: Integration) => void;
}

interface IntegrationCardProps {
	integration: Integration;
	isHovering: string | null;
	setIsHovering: (value: string | null) => void;
	onClick: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
	integration,
	isHovering,
	setIsHovering,
	onClick,
}) => {
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<article
			className={`flex gap-4 items-center p-4 rounded-xl border cursor-pointer transition-all ${!integration.isAvailable ? "opacity-50 cursor-not-allowed" : ""
				} ${integration.isConnected ? "border-primary-500 bg-primary-50" : ""}`}
			onMouseEnter={() =>
				integration.isAvailable && setIsHovering(integration.name)
			}
			onMouseLeave={() => setIsHovering(null)}
			onClick={() => integration.isAvailable && onClick()}
			style={{
				background:
					isHovering === integration.name
						? "rgb(var(--primary-200))"
						: integration.isConnected
							? "rgb(var(--primary-300))"
							: "white",
			}}
		>
			<img
				className={`w-10 h-10 ${!integration.isAvailable ? "grayscale" : ""}`}
				src={integration.icon}
				alt={`${integration.name} icon`}
			/>
			<div className="flex flex-col">
				<h3 className="text-base font-medium text-neutral-900">
					{integration.name}
				</h3>
				<p className="text-sm text-stone-500">{integration.description}</p>
				{integration.isConnected && (
					<p className="text-xs text-primary-600 mt-1">Connected</p>
				)}
			</div>
		</article>
	);
};

const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({
	integrations,
	isHovering,
	setIsHovering,
	onConnect,
}) => {
	const [selectedIntegration, setSelectedIntegration] =
		useState<Integration | null>(null);

	const handleIntegrationClick = (integration: Integration) => {
		setSelectedIntegration(integration);
	};

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
				<label className="text-sm font-medium text-zinc-800">
					Integrations
				</label>
				<div className="grid grid-cols-2 gap-4">
					{integrations.map((integration) => (
						<IntegrationCard
							key={integration.name}
							integration={integration}
							isHovering={isHovering}
							setIsHovering={setIsHovering}
							onClick={() => handleIntegrationClick(integration)}
						/>
					))}
				</div>
			</div>
			{/* {selectedIntegration && (
        <IntegrationModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onConnect={onConnect}
        />
      )} */}
		</section>
	);
};

export function BusinessSetup({ onClose, setBusinessInfo }: BusinessSetupProps) {
	const [businessName, setBusinessName] = useState("");
	const [businessUrl, setBusinessUrl] = useState("");
	const [logoUrl, setLogoUrl] = useState(defaultLogo);
	const [isHovering, setIsHovering] = useState<string | null>(null);
	const [integrations, setIntegrations] = useState<Integration[]>([
		{
			name: "Google Sheets",
			icon: gsIcon,
			description: "Connect your spreadsheets",
			isAvailable: true,
		},
		{
			name: "BigQuery",
			icon: bigqueryIcon,
			description: "Google BigQuery",
			isAvailable: true,
		},
		{
			name: "Odoo",
			icon: odooIcon,
			description: "ERP integration",
			isAvailable: true,
		},
		{
			name: "Shopify",
			icon: shopifyIcon,
			description: "E-commerce platform",
			isAvailable: true,
		},
		{
			name: "QuickBooks",
			icon: quickBooksIcon,
			description: "Accounting software",
			isAvailable: false,
		},
	]);

	const handleConnect = (integration: Integration) => {
		setIntegrations((prev) =>
			prev.map((integ) =>
				integ.name === integration.name
					? { ...integ, isConnected: true }
					: integ,
			),
		);
	};

	const handleContinue = () => {
		if (businessName && businessUrl) {
			setBusinessInfo({ name: businessName, url: businessUrl });
			onClose();
		}
	};

	return (
		<Modal isOpen={true} onClose={onClose} size="lg">
			<div className="flex flex-col gap-6">
				<h1 className="text-2xl font-semibold text-neutral-900">
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
				<IntegrationsSection
					integrations={integrations}
					isHovering={isHovering}
					setIsHovering={setIsHovering}
					onConnect={handleConnect}
				/>
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

export default BusinessSetup;
