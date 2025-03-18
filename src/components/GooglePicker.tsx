import { useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/utils/AuthProvider";

// Add TypeScript declarations for the Google API
declare global {
	interface Window {
		gapi: {
			load: (api: string, callback: () => void) => void;
		};
		google: {
			picker: {
				View: new (viewId: any) => any;
				ViewId: {
					SPREADSHEETS: any;
				};
				PickerBuilder: new () => any;
				Feature: {
					NAV_HIDDEN: any;
				};
				Action: {
					PICKED: string;
				};
			};
		};
	}
}

const API_BASE_URL = import.meta.env.VITE_API_URL;
export const GooglePicker: React.FC<{
	onSelect: (id: string, name: string) => void;
}> = ({ onSelect }) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const { getValidToken } = useAuth();

	// Make checkAuthorization a memoized function that can be called multiple times
	const checkAuthorization = useCallback(async () => {
		console.log("Checking authorization status...");
		const token = await getValidToken();
		try {
			const response = await fetch(
				`${API_BASE_URL}/auth/google/status`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			console.log("Authorization status response:", data);

			// The server returns { authorized: true } not { isAuthorized: true }
			// Explicitly log the state change
			console.log(
				"Setting isAuthorized from",
				isAuthorized,
				"to",
				data.authorized,
			);

			// Update based on the correct property name
			setIsAuthorized(data.authorized);
		} catch (error) {
			console.error("Failed to check authorization:", error);
		}
	}, [getValidToken, isAuthorized]);

	useEffect(() => {
		// Load the Google API client
		const loadGoogleApi = () => {
			const script = document.createElement("script");
			script.src = "https://apis.google.com/js/api.js";
			script.onload = () => {
				window.gapi.load("picker", () => {
					setIsLoaded(true);
				});
			};
			document.body.appendChild(script);
		};

		loadGoogleApi();
		checkAuthorization();
	}, [checkAuthorization]);

	// Keep the flag check effect
	useEffect(() => {
		const shouldCheckAuth = localStorage.getItem("checkGoogleAuth");
		if (shouldCheckAuth === "true") {
			// Clear the flag
			localStorage.removeItem("checkGoogleAuth");
			// Check auth status
			checkAuthorization();
		}
	}, [checkAuthorization]);

	const openPicker = async () => {
		if (!isLoaded) {
			console.error("Google Picker API not loaded");
			return;
		}

		const token = await getValidToken();

		try {
			// Get configuration from your backend
			const response = await fetch(
				`${API_BASE_URL}/auth/google/picker-config`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error("Failed to get picker configuration");
			}

			const { developerKey, appId, oauthToken } = await response.json();
			console.log(developerKey, appId, oauthToken);

			// Create the picker view
			const view = new window.google.picker.View(
				window.google.picker.ViewId.SPREADSHEETS,
			);

			// Create and render the picker
			const picker = new window.google.picker.PickerBuilder()
				.addView(view)
				.enableFeature(window.google.picker.Feature.NAV_HIDDEN)
				.setOAuthToken(oauthToken)
				.setDeveloperKey(developerKey)
				.setCallback(pickerCallback)
				.setAppId(appId)
				.build();

			picker.setVisible(true);
		} catch (error) {
			console.error("Error opening picker:", error);
		}
	};

	// Define a proper type for the picker callback data
	interface PickerCallbackData {
		action: string;
		docs?: Array<{
			id: string;
			name: string;
			[key: string]: any;
		}>;
	}

	const pickerCallback = async (data: PickerCallbackData) => {
		if (data.action === window.google.picker.Action.PICKED && data.docs) {
			const document = data.docs[0];
			const documentId = document.id;
			const documentName = document.name;

			const token = await getValidToken();

			// Send the selection to your backend
			try {
				const response = await fetch(
					`${API_BASE_URL}/auth/google/picker-selection`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							documentId,
							documentName,
						}),
					},
				);

				if (!response.ok) {
					throw new Error("Failed to save selection");
				}

				// Notify the parent component
				onSelect(documentId, documentName);
			} catch (error) {
				console.error("Error saving selection:", error);
			}
		}
	};

	const handleAuthClick = async () => {
		const token = await getValidToken();

		try {
			const response = await fetch(`${API_BASE_URL}/auth/google`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Log the full response for debugging
			console.log("Auth response status:", response.status);

			if (!response.ok) {
				const errorText = await response.text();
				console.error(
					`HTTP error! status: ${response.status}, details:`,
					errorText,
				);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Get the redirect URL from the response
			const data = await response.json();
			console.log("Auth response data:", data);

			// Redirect to Google's OAuth page
			if (data.url) {
				// Store a flag in localStorage to check auth status on return
				localStorage.setItem("checkGoogleAuth", "true");
				window.location.href = data.url;
			} else {
				throw new Error("No redirect URL received");
			}
		} catch (error) {
			console.error("Error initiating Google auth:", error);
			// Display error to user
			alert("Failed to connect to Google. Please try again later.");
		}
	};

	// Add new test handler
	const handleTest = async () => {
		console.log("Starting test request...");
		const token = await getValidToken();

		try {
			const response = await fetch(`${API_BASE_URL}/api/test`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			console.log("Response status:", response.status);
			const data = await response.json();
			console.log("Response data:", data);
		} catch (error) {
			console.error("Error during test request:", error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center gap-4 mb-4">
			{!isAuthorized ? (
				<>
					<Button
						onClick={handleAuthClick}
						className="bg-blue-500 text-white px-4 py-2 rounded-md"
					>
						Connect Google Sheets
					</Button>
				</>
			) : (
				<Button
					onClick={openPicker}
					disabled={!isLoaded}
					className="bg-blue-500 text-white px-4 py-2 rounded-md"
				>
					Select Spreadsheet
				</Button>
			)}
			<button
				type="button"
				onClick={handleTest}
				className="bg-blue-500 text-white px-4 py-2 rounded-md mb-2"
			>
				Test API *
			</button>
			{/* <div className="text-xs text-gray-500">
				Auth Status: {isAuthorized ? "Connected" : "Not Connected"}
			</div> */}
		</div>
	);
};
