import { useAuth } from "../utils/AuthProvider";

export const GoogleConnect = () => {
	const { getValidToken } = useAuth();

	const handleGoogleAuth = async () => {
		const token = await getValidToken();

		try {
			const response = await fetch("http://localhost:4000/api/auth/google", {
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
	};

	return (
		<button type="button" onClick={handleGoogleAuth}>
			Connect with Google
		</button>
	);
};
