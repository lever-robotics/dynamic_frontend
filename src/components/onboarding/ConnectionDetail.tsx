import type { Connection } from "@/types/connectors";
import { useAuth } from "@/utils/AuthProvider";
import type * as React from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUserConfig } from "../../utils/UserConfigProvider";
import { MarkdownContent } from "../Chat/MarkdownContent";
import { BackArrow } from "../common/BackArrow";
import { Modal } from "../common/Modal";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ConnectionDetailProps {
	connection: Connection;
	onBack: () => void;
	onClose: () => void;
}

function InputField({
	label,
	type = "text",
	placeholder,
	value,
	onChange,
}: {
	label: string;
	type?: "text" | "password";
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="w-full">
			<label
				htmlFor={label.toLowerCase()}
				className="self-start text-sm font-medium tracking-wide text-neutral-900 font-heading"
			>
				{label}
			</label>
			<input
				id={label.toLowerCase()}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full px-4 py-3.5 mt-4 font-light text-zinc-600 rounded-xl border border-solid border-black border-opacity-20 bg-stone-300 bg-opacity-0 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] font-body"
			/>
		</div>
	);
}

const getConnectionFields = (connectionName: string) => {
	switch (connectionName.toLowerCase()) {
		case "shopify":
			return {
				fields: [
					{
						name: "shop",
						label: "shop",
						type: "text",
						placeholder: "your-store.myshopify.com",
					},
				],
				markdown: `
# Shopify Connection Setup

## Getting Your Access Token

1. Log in to your Shopify admin panel
2. Go to Apps > App and sales channel settings
3. Click "Develop apps" in the top right
4. Create a new app or select an existing one
5. Under "API credentials", click "Configure Admin API scopes"
6. Select the required scopes for your integration
7. Click "Save"
8. Click "Install app" and confirm
9. Copy the Admin API access token

## Shop Domain

Your shop domain is the URL of your Shopify store without the "https://" prefix. For example:
- If your store URL is "https://my-store.myshopify.com"
- Your shop domain would be "my-store.myshopify.com"
                `,
			};
		case "bigquery":
			return {
				fields: [
					{
						name: "project_id",
						label: "Project ID",
						type: "text",
						placeholder: "Paste your project ID",
					},
					{
						name: "dataset_id",
						label: "Dataset ID",
						type: "text",
						placeholder: "Paste your dataset ID",
					},
				],
				markdown: `
# BigQuery Connection Setup

## Setting Up Service Account

1. Go to the Google Cloud Console
2. Create a new project or select an existing one
3. Enable the BigQuery API
4. Create a service account
5. Generate a new private key (JSON format)
6. Share your BigQuery dataset with the service account email
7. Paste the JSON credentials below
                `,
			};
		default:
			return {
				fields: [],
				markdown:
					"No specific setup instructions available for this connection type.",
			};
	}
};

export const ConnectionDetail: React.FC<ConnectionDetailProps> = ({
	connection,
	onBack,
	onClose,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<Record<string, string>>({});
	const connectionConfig = getConnectionFields(connection.name);
	const [session, setSession] = useState<string | null>(null);
	const { getValidToken } = useAuth();
	const { createConnection } = useUserConfig();

	useEffect(() => {
		const fetchRedirectUrl = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/v0/oauth/session`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${await getValidToken()}`,
					},
				});
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const { session } = await response.json();

				setSession(session);
			} catch (error) {
				console.error("Error initiating Google auth:", error);
			}
		};
		fetchRedirectUrl();
	}, [getValidToken]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const queryParams = new URLSearchParams({
			session: session || "",
		});

		const connector = connection.name.toLowerCase();

		switch (connector) {
			case "shopify":
				queryParams.append("shop", formData.shop.trim() || "");
				break;
			case "bigquery":
				queryParams.append("project_id", formData.project_id.trim() || "");
				queryParams.append("dataset_id", formData.dataset_id.trim() || "");
				break;
		}

		window.addEventListener("message", (event) => {
			if (event.origin !== API_BASE_URL) return;

			if (event.data.status === "success") {
				onClose();
			}
		});

		const tab = window.open(
			`${API_BASE_URL}/v0/connectors/${connector}/authorize?${queryParams.toString()}`,
			"OAuthLogin",
			`width=500,height=600,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no,left=${(window.screen.width - 500) / 2},top=${(window.screen.height - 600) / 2}`,
		);

		if (!tab) {
			throw new Error("Failed to open popup");
		}

		tab.focus();
	};

	const handleFieldChange = (fieldName: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[fieldName]: value,
		}));
	};

	return (
		<Modal isOpen={true} onClose={onClose} size="xl" showCloseButton={false}>
			<div className="flex h-full">
				{/* Left Side - Form */}
				<div className="w-1/2 border-r border-gray-200 flex flex-col">
					<div className="flex items-center p-4 border-b">
						<BackArrow onClick={onBack} />
						<h2 className="text-xl font-semibold ml-4">
							{connection.name} Connection
						</h2>
					</div>

					<div className="flex-1 overflow-y-auto p-6">
						<form onSubmit={handleSubmit} className="space-y-6">
							{connectionConfig.fields.map((field) => (
								<InputField
									key={field.name}
									label={field.label}
									type={field.type as "text" | "password"}
									placeholder={field.placeholder}
									value={formData[field.name] || ""}
									onChange={(value) => handleFieldChange(field.name, value)}
								/>
							))}

							<button
								type="submit"
								disabled={isLoading}
								className="w-full inline-flex justify-center rounded-xl border border-transparent bg-primary-600 py-3.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? "Connecting..." : "Connect"}
							</button>
						</form>
					</div>
				</div>

				{/* Right Side - Markdown Content */}
				<div className="w-1/2 flex flex-col">
					<div className="flex-1 overflow-auto p-6">
						<div className="prose max-w-none">
							<MarkdownContent content={connectionConfig.markdown} />
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};
