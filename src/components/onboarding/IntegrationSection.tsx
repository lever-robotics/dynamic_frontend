import type { Connection } from "@/types/connectors";
import { useAuth } from "@/utils/AuthProvider";
import { useState } from "react";
import { ConnectionCard } from "./ConnectionCard";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface IntegrationsSectionProps {
	connections: Connection[];
	isHovering: string | null;
	setIsHovering: (value: string | null) => void;
}

export const IntegrationSection: React.FC<IntegrationsSectionProps> = ({
	connections,
	isHovering,
	setIsHovering,
}) => {
	const { getValidToken } = useAuth();
	const [selectedIntegration, setSelectedIntegration] =
		useState<Connection | null>(null);

	const handleIntegrationClick = async (integration: Connection) => {
		// setSelectedIntegration(integration);
		try {
			const response = await fetch(
				`${API_BASE_URL}/v0/connectors/${integration.name.toLowerCase()}/login`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${await getValidToken()}`,
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
							isHovering={isHovering}
							setIsHovering={setIsHovering}
							onClick={() => handleIntegrationClick(connection)}
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
