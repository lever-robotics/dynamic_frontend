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
import { supabase } from "./SupabaseClient";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface UserConfig {
	completed_onboarding: boolean;
	business_overview: string;
	data_connectors: DataConnector[];
}

interface Thread {
	id: string;
	name: string;
	created_at: string;
}

interface UserConfigContextType {
	userConfig: UserConfig | null;
	isLoading: boolean;
	error: string | null;
	fetchUserConfig: () => Promise<void>;
	upsertUserConfig: (userConfig: UserConfig) => Promise<void>;
	updateConnectionMeta: (
		connectionId: string,
		meta: DataConnector["meta"],
	) => Promise<void>;
	createConnection: (
		connectionType: string,
		keys: Record<string, string>,
	) => Promise<void>;
	connections: DataConnector[];
	createThread: (name: string) => Promise<string>;
	fetchThreads: () => Promise<void>;
	threads: Thread[];
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
	const [threads, setThreads] = useState<Thread[]>([]);

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

			const connectors = Object.values(connectorsBody.data) as DataConnector[];

			setUserConfig({
				completed_onboarding: configBody.data.completed_onboarding,
				business_overview: configBody.data.business_overview,
				data_connectors: connectors,
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

	const fetchThreads = useCallback(async () => {
		if (!userId) return;

		setIsLoading(true);
		setError(null);

		const token = await getValidToken();
		if (!token) {
			setError("Failed to get valid token");
			return;
		}

		try {
			const { data: threads, error: threadsError } = await supabase
				.from("threads")
				.select("id, name, created_at")
				.eq("user_id", userId)
				.order("created_at", { ascending: false });

			if (threadsError) throw threadsError;

			setThreads(threads || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch threads");
			console.error("Error fetching threads:", err);
		} finally {
			setIsLoading(false);
		}
	}, [userId, getValidToken]);

	useEffect(() => {
		if (!userId) return;
		fetchUserConfig();
		fetchThreads();
	}, [userId, fetchUserConfig, fetchThreads]);

	const createThread = async (name: string): Promise<string> => {
		try {
			const { data, error } = await supabase
				.from("threads")
				.insert([{ user_id: userId, name }])
				.select()
				.single();

			if (error) {
				setError(error.message);
				return "";
			}

			// Update state with new thread and initial document
			setThreads((prevThreads) => [...prevThreads, data]);

			return data.id;
		} catch (err) {
			console.error("[UserConfigProvider] Error creating thread:", err);
			setError(err instanceof Error ? err.message : "Failed to create thread");
			return "";
		}
	};

	const upsertUserConfig = useCallback(
		async (userConfig: UserConfig) => {
			if (!userId) return;

			const token = await getValidToken();
			if (!token) {
				setError("Failed to get valid token");
				return;
			}
			try {
				const updateResp = await fetch(
					`${import.meta.env.VITE_API_URL}/v0/config`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(userConfig),
					},
				);
				const updateBody = await updateResp.json();

				if (updateBody.error) {
					throw new Error(updateBody.error);
				}

				await fetchUserConfig();
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to update user config",
				);
				console.error("Error updating user config", err);
			} finally {
				setIsLoading(false);
			}
		},
		[userId, fetchUserConfig, getValidToken],
	);

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

	return (
		<UserConfigContext.Provider
			value={{
				userConfig,
				isLoading,
				error,
				fetchUserConfig,
				upsertUserConfig,
				updateConnectionMeta,
				createConnection,
				connections,
				fetchThreads,
				threads,
				createThread,
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
