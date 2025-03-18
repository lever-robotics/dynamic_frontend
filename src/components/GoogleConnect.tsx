import { useAuth } from "../utils/AuthProvider";
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const GoogleConnect = () => {
	const { getValidToken } = useAuth();
	const handleGoogleAuth = async () => {
		const token = await getValidToken();

		try {
			const response = await fetch(`${API_BASE_URL}/auth/google`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
            

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Get the redirect URL from the response
			const { url } = await response.json();

			// Redirect to Google's OAuth page
			if (url) {
				window.location.href = url;
			} else {
				throw new Error("No redirect URL received");
			}
		} catch (error) {
			console.error("Error initiating Google auth:", error);
		}

		console.log("Google auth initiated!");
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
		<div className="flex flex-col items-center justify-center gap-4">
			<button type="button" onClick={handleGoogleAuth} className="bg-blue-500 text-white px-4 py-2 rounded-md">
				Connect with Google
			</button>
			<button type="button" onClick={handleTest} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-2">
				Test API
			</button>
		</div>
	);
};