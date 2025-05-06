import type { DataConnector } from "@/types/connectors";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useAuth } from "./AuthProvider";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface UserConfig {
	completed_onboarding: boolean;
	business_overview: string;
	data_connectors: DataConnector[];
}

interface UserConfigContextType {
	userConfig: UserConfig | null;
	isLoading: boolean;
	error: string | null;
	fetchUserConfig: () => Promise<void>;
	updateConnectionMeta: (
		connectionId: string,
		meta: DataConnector["meta"],
	) => Promise<void>;
	createConnection: (
		connectionType: string,
		keys: Record<string, string>,
	) => Promise<void>;
	connections: DataConnector[];
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(
	undefined,
);

export const UserConfigProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { userId, getValidToken } = useAuth();

	const fetchUserConfig = useCallback(async () => {
		if (!userId) return;

		setIsLoading(true);
		setError(null);

		const token = await getValidToken();
		if (!token) {
			setError("Failed to get valid token");
			return;
		}

		try {
			const configResp = await fetch(
				`${import.meta.env.VITE_API_URL}/v0/config`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const configBody = await configResp.json();

			if (configBody.error) {
				throw new Error(configBody.error);
			}

			const connectorsResp = await fetch(
				`${import.meta.env.VITE_API_URL}/v0/connectors`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const connectorsBody = await connectorsResp.json();

			if (connectorsBody.error) {
				throw new Error(connectorsBody.error);
			}

			setUserConfig({
				completed_onboarding: configBody.data.completed_onboarding,
				business_overview: configBody.data.business_overview,
				data_connectors: connectorsBody.data,
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch user config",
			);
			console.error("Error fetching user config:", err);
		} finally {
			setIsLoading(false);
		}
	}, [userId, getValidToken]);

	const updateConnectionMeta = useCallback(
		async (connectionId: string, meta: DataConnector["meta"]) => {
			if (!userId) return;

			const token = await getValidToken();
			if (!token) {
				setError("Failed to get valid token");
				return;
			}

			try {
				const updateResp = await fetch(
					`${import.meta.env.VITE_API_URL}/v0/connectors/${connectionId}`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({ meta }),
					},
				);
				const updateBody = await updateResp.json();

				if (updateBody.error) {
					throw new Error(updateBody.error);
				}

				await fetchUserConfig();
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to update connection metadata",
				);
				console.error("Error updating connection metadata:", err);
			} finally {
				setIsLoading(false);
			}
		},
		[userId, fetchUserConfig, getValidToken],
	);

	const createConnection = useCallback(
		async (connectionType: string, keys: Record<string, string>) => {
			if (!userId) return;

			const token = await getValidToken();
			if (!token) {
				setError("Failed to get valid token");
				return;
			}

			try {
				const updateResp = await fetch(
					`${import.meta.env.VITE_API_URL}/v0/connectors`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							user_id: userId,
							connection_type: connectionType,
							meta: {
								version: "1.0",
								entities: [],
							},
							keys: keys,
						}),
					},
				);
				const updateBody = await updateResp.json();

				if (updateBody.error) {
					throw new Error(updateBody.error);
				}

				// Refresh the user config to get the new connection
				await fetchUserConfig();
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to create connection",
				);
				console.error("Error creating connection:", err);
			}
		},
		[userId, fetchUserConfig, getValidToken],
	);

	const connections = useMemo(() => {
		return userConfig?.data_connectors || [];
	}, [userConfig]);

	// Fetch user config when userId changes
	useEffect(() => {
		if (userId) {
			fetchUserConfig();
		}
	}, [userId, fetchUserConfig]);

	return (
		<UserConfigContext.Provider
			value={{
				userConfig,
				isLoading,
				error,
				fetchUserConfig,
				updateConnectionMeta,
				createConnection,
				connections,
			}}
		>
			{children}
		</UserConfigContext.Provider>
	);
};

export const useUserConfig = () => {
	const context = useContext(UserConfigContext);
	if (!context) {
		throw new Error("useUserConfig must be used within a UserConfigProvider");
	}
	return context;
};
