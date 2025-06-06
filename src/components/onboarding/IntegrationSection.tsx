import type { Connection } from "@/types/connectors";
import { useAuth } from "@/utils/AuthProvider";
import { useState } from "react";
import { ConnectionCard } from "./ConnectionCard";
import { ConnectionDetail } from "./ConnectionDetail";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface IntegrationsSectionProps {
	connections: Connection[];
}

export const IntegrationSection: React.FC<IntegrationsSectionProps> = ({
	connections,
}) => {
	const { session } = useAuth();
	const [selectedIntegration, setSelectedIntegration] =
		useState<Connection | null>(null);

	const handleIntegrationClick = async (integration: Connection) => {
		// setSelectedIntegration(integration);
		try {
			const response = await fetch(
				`${API_BASE_URL}/v0/connectors/${integration.name.toLowerCase()}/authorize`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${session?.access_token}`,
					},
				},
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Get the redirect URL from the response
			const { redirect } = await response.json();

			// Redirect to OAuth page
			if (redirect) {
				window.location.href = redirect;
			} else {
				throw new Error("No redirect URL received");
			}
		} catch (error) {
			console.error("Error initiating Google auth:", error);
		}
	};

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
				<label className="text-sm font-medium text-zinc-800">
					Integrations
				</label>
				<div className="grid grid-cols-2 gap-4">
					{connections.map((connection) => (
						<ConnectionCard
							key={connection.name}
							connection={connection}
							onClick={() => setSelectedIntegration(connection)}
						/>
					))}
				</div>
			</div>
			{selectedIntegration && (
				<ConnectionDetail
					connection={selectedIntegration}
					onClose={() => setSelectedIntegration(null)}
					onBack={() => setSelectedIntegration(null)}
				/>
			)}
		</section>
	);
};
