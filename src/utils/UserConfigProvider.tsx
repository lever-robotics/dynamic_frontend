import type { ToolExecutionBubble } from "@/types/chat";
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
import type { WebSocketConversation } from "./WebSocket";
const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface UserConfig {
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
	threadId: string;
	setThreadId: (threadId: string) => void;
	artifacts: Artifacts;
	currentArtifact: Artifact | null;
	setCurrentArtifact: (artifact: Artifact | null) => void;
	setCurrentArtifactById: (artifactId: string) => void;
	ws: WebSocketConversation | null;
}

export interface Artifact {
	artifact_type: "image" | "document" | "query";
	content: string;
	created_at: string;
	id: string;
	metadata?: {
		data_source?: "bigquery" | "shopify";
		[key: string]: string | number | boolean | null;
	};
}

export interface Artifacts {
	images: Artifact[];
	documents: Artifact[];
	queries: Artifact[];
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(
	undefined,
);

export const UserConfigProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
	const { session } = useAuth();
	const [threads, setThreads] = useState<Thread[]>([]);
	const [threadId, setThreadId] = useState<string>("");

	const [artifacts, setArtifacts] = useState<Artifacts>({
		images: [],
		documents: [
			{
				artifact_type: "document",
				content: "",
				created_at: new Date().toISOString(),
				id: crypto.randomUUID(),
				metadata: {},
			},
		],
		queries: [],
	});
	const [currentArtifact, setCurrentArtifact] = useState<Artifact>(
		artifacts.documents[0],
	);
	const [ws, setWs] = useState<WebSocketConversation | null>(null);

	console.log("Render UserConfigProvider");

	const fetchUserConfig = useCallback(async () => {
		const token = session?.access_token;
		if (!token) {
			console.error("Failed to get valid token");
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
			console.log("Setting UserConfig", {
				completed_onboarding: configBody.data.completed_onboarding,
				business_overview: configBody.data.business_overview,
				data_connectors: connectors,
			});
			setUserConfig({
				completed_onboarding: configBody.data.completed_onboarding,
				business_overview: configBody.data.business_overview,
				data_connectors: connectors,
			});
		} catch (err) {
			console.error("Error fetching user config:", err);
		}
	}, [session]);

	const fetchThreads = useCallback(async () => {
		const token = session?.access_token;
		if (!token) {
			console.error("Failed to get valid token");
			return;
		}

		try {
			const { data: threads, error: threadsError } = await supabase
				.from("threads")
				.select("id, name, created_at")
				.eq("user_id", session?.user.id)
				.order("created_at", { ascending: false });

			if (threadsError) throw threadsError;
			console.log("Setting Threads", threads);
			setThreads(threads || []);
		} catch (err) {
			console.error("Error fetching threads:", err);
		}
	}, [session]);

	// useEffect(() => {
	// 	if (!userId) return;
	// 	fetchUserConfig();
	// 	fetchThreads();
	// }, [userId, fetchUserConfig, fetchThreads]);

	const createThread = async (name: string): Promise<string> => {
		try {
			const { data, error } = await supabase
				.from("threads")
				.insert([{ user_id: session?.user.id, name }])
				.select()
				.single();

			if (error) {
				console.error("Error creating thread:", error);
				return "";
			}

			// Update state with new thread and initial document
			setThreads((prevThreads) => [...prevThreads, data]);

			return data.id;
		} catch (err) {
			console.error("[UserConfigProvider] Error creating thread:", err);
			return "";
		}
	};

	const upsertUserConfig = useCallback(
		async (userConfig: UserConfig) => {
			const token = session?.access_token;
			if (!token) {
				console.error("Failed to get valid token");
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
			} catch (err) {
				console.error("Error updating user config", err);
			}
		},
		[session],
	);

	const updateConnectionMeta = useCallback(
		async (connectionId: string, meta: DataConnector["meta"]) => {
			const token = session?.access_token;
			if (!token) {
				console.error("Failed to get valid token");
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
				console.error("Error updating connection metadata:", err);
			}
		},
		[fetchUserConfig, session],
	);

	// useEffect(() => {
	// 	console.log("[UserConfigProvider] ws", ws);
	// 	const initWebSocket = async () => {
	// 		const token = await getValidToken();
	// 		const wsConvo = new WebSocketConversation(
	// 			token,
	// 			userId,
	// 			userConfig,
	// 			threadId,
	// 		);
	// 		wsConvo.subscribe("tool", (toolCall: ToolExecutionBubble) => {
	// 			if (toolCall.tool === "agent_update_business") {
	// 				upsertUserConfig({
	// 					...userConfig,
	// 					business_overview: toolCall.result,
	// 				});
	// 				setUserConfig({
	// 					...userConfig,
	// 					business_overview: toolCall.result,
	// 				});
	// 			}
	// 			if (toolCall.tool === "agent_write_meta_file") {
	// 				const connection_id = toolCall.arguments.connection_id;
	// 				const meta_file_json = toolCall.arguments.meta_file_json;
	// 				const meta_data = JSON.parse(meta_file_json);
	// 				// Set the meta file in the specific connector
	// 				const connector = userConfig.data_connectors.find(
	// 					(connector) => connector.id === connection_id,
	// 				);
	// 				if (connector) {
	// 					updateConnectionMeta(connection_id, meta_data);
	// 				}
	// 			}
	// 			if (
	// 				toolCall.tool === "write_bi_report" ||
	// 				toolCall.tool === "agent_execute_python_code" ||
	// 				toolCall.tool === "agent_execute_bigquery"
	// 			) {
	// 				setArtifacts({ ...ws.artifacts });
	// 			}
	// 			if (toolCall.tool === "agent_execute_sql_query") {
	// 				console.log("[UserConfigProvider] agent_execute_sql_query", toolCall);
	// 				const queryId = toolCall.arguments.query_id;
	// 				setCurrentArtifactById(queryId);
	// 			}
	// 		});
	// 		setWs(wsConvo);
	// 	};
	// 	if (ws === null) {
	// 		console.log("[UserConfigProvider] initWebSocket");
	// 		initWebSocket();
	// 	} else if (threadId !== ws.threadId) {
	// 		ws.disconnect();
	// 		initWebSocket();
	// 	}

	// 	return () => {
	// 		console.log("[UserConfigProvider] cleanup");
	// 		if (ws?.isConnected) {
	// 			console.log("[UserConfigProvider] disconnecting");
	// 			ws.disconnect();
	// 		}
	// 	};
	// }, [
	// 	threadId,
	// 	getValidToken,
	// 	userId,
	// 	updateConnectionMeta,
	// 	upsertUserConfig,
	// 	userConfig,
	// 	ws,
	// ]);

	const setCurrentArtifactById = (artifactId: string) => {
		const allArtifacts = [
			...artifacts.documents,
			...artifacts.images,
			...artifacts.queries,
		];
		const foundArtifact = allArtifacts.find((a) => a.id === artifactId);
		if (foundArtifact) {
			setCurrentArtifact(foundArtifact);
		}
	};

	const createConnection = useCallback(
		async (connectionType: string, keys: Record<string, string>) => {
			const token = session?.access_token;
			if (!token) {
				console.error("Failed to get valid token");
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
							user_id: session?.user.id,
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
				console.error("Error creating connection:", err);
			}
		},
		[fetchUserConfig, session],
	);

	const connections = useMemo(() => {
		return userConfig?.data_connectors || [];
	}, [userConfig]);

	return (
		<UserConfigContext.Provider
			value={{
				userConfig,
				fetchUserConfig,
				upsertUserConfig,
				updateConnectionMeta,
				createConnection,
				connections,
				fetchThreads,
				threads,
				createThread,
				threadId,
				setThreadId,
				artifacts,
				currentArtifact,
				setCurrentArtifact,
				setCurrentArtifactById,
				ws,
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
