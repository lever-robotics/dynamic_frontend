import type React from "react";
import { useState } from "react";
import { useAuth } from "@/utils/AuthProvider";
import { Modal } from "./common/Modal";
const API_BASE_URL = import.meta.env.VITE_API_URL;
// import { GoogleConnect } from "./GoogleConnect";
// import { GooglePicker } from "./GooglePicker";
// import type { Blueprint } from "@/types/blueprint";

// interface DisplayDataProps {
// 	blueprint: Blueprint;
// 	searchQuery: SearchQuery | null;
// 	updateSearchQuery: (query: SearchQuery) => void;
// }

interface Setting {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
}

interface SettingsDisplayProps {
	onClose: () => void;
	showBlueprint: () => void;
}

export const SettingsDisplay: React.FC<SettingsDisplayProps> = ({
	onClose,
	showBlueprint,
}) => {
	const { signOut, getValidToken } = useAuth();
	const [settings, setSettings] = useState<Setting[]>([
		{
			id: "notifications",
			name: "Email Notifications",
			description: "Receive email notifications about system updates",
			enabled: true,
		},
		{
			id: "autoSave",
			name: "Auto Save",
			description: "Automatically save changes",
			enabled: true,
		},
		{
			id: "analytics",
			name: "Usage Analytics",
			description: "Share anonymous usage data to help improve the system",
			enabled: true,
		},
	]);

	const testFunction = async () => {
		const token = await getValidToken();
		await fetch(`${API_BASE_URL}/v0/connectors/bigquery/query`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
			  sql: 'SELECT * FROM `bigquery-public-data.thelook_ecommerce.orders` LIMIT 10'
			})
		  });
	};

	const handleToggle = (settingId: string) => {
		setSettings(
			settings.map((setting) =>
				setting.id === settingId
					? { ...setting, enabled: !setting.enabled }
					: setting,
			),
		);
	};

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<Modal isOpen={true} onClose={onClose} size="lg">
			<div className="flex flex-col gap-6">
				<h2 className="text-2xl font-semibold text-neutral-900">Settings</h2>
				<div className="flex flex-col gap-4">
					{settings.map((setting) => (
						<div
							key={setting.id}
							className="flex items-center justify-between p-4 border rounded-lg"
						>
							<div>
								<h3 className="font-medium text-neutral-900">
									{setting.name}
								</h3>
								<p className="text-sm text-neutral-600">
									{setting.description}
								</p>
							</div>
							<button
								type="button"
								onClick={() => handleToggle(setting.id)}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									setting.enabled
										? "bg-primary-500"
										: "bg-gray-200"
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										setting.enabled
											? "translate-x-6"
											: "translate-x-1"
									}`}
								/>
							</button>
						</div>
					))}
				</div>

				<div className="mt-auto pt-6 border-t border-gray-200 flex flex-col gap-4">
					{/* <GoogleConnect /> */}
					{/* <GooglePicker onSelect={() => { }} /> */}
					<button
						type="button"
						onClick={testFunction}
						className="w-2/4 mx-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Test Function
					</button>
					<button
						type="button"
						onClick={handleSignOut}
						className="w-2/4 mx-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Sign Out
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default SettingsDisplay;
