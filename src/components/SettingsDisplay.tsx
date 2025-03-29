import type React from "react";
import { useState } from "react";
import { useAuth } from "@/utils/AuthProvider";
import { Modal } from "./common/Modal";
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
	showBusinessSetup: (show: boolean) => void;
	showOnboarding: (show: boolean) => void;
}

export const SettingsDisplay: React.FC<SettingsDisplayProps> = ({
	onClose,
	showBusinessSetup,
	showOnboarding,
}) => {
	const { signOut } = useAuth();
	const [settings, setSettings] = useState<Setting[]>([
		{
			id: "notifications",
			name: "Email Notifications",
			description: "Receive email notifications about system updates",
			enabled: true,
		},
		{
			id: "darkMode",
			name: "Dark Mode",
			description: "Enable dark mode theme",
			enabled: false,
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
		<Modal isOpen={true} onClose={onClose}>
			<div className="w-full px-4 py-5 sm:p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>

				<div className="space-y-6">
					{settings.map((setting) => (
						<div key={setting.id} className="flex items-center justify-between">
							<div className="flex-1">
								<h3 className="text-sm font-medium text-gray-900">
									{setting.name}
								</h3>
								<p className="text-sm text-gray-500">{setting.description}</p>
							</div>
							<button
								type="button"
								className={`${
									setting.enabled ? "bg-primary" : "bg-gray-200"
								} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
								role="switch"
								aria-checked={setting.enabled}
								onClick={() => handleToggle(setting.id)}
							>
								<span
									aria-hidden="true"
									className={`${
										setting.enabled ? "translate-x-5" : "translate-x-0"
									} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
								/>
							</button>
						</div>
					))}
				</div>

				<div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-4">
					{/* <GoogleConnect /> */}
					{/* <GooglePicker onSelect={() => { }} /> */}
					<button
						type="button"
						onClick={() => {showBusinessSetup(true); onClose()}}
						className="w-3/4 mx-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-anakiwa-500 hover:bg-anakiwa-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-anakiwa-500"
					>
						Business Setup
					</button>
					<button
						type="button"
						onClick={() => {showOnboarding(true); onClose()}}
						className="w-3/4 mx-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-anakiwa-500 hover:bg-anakiwa-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-anakiwa-500"
					>
						Onboarding
					</button>
					<button
						type="button"
						onClick={handleSignOut}
						className="w-3/4 mx-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Sign Out
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default SettingsDisplay;
