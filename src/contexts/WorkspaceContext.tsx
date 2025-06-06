import type { MessageBubble, ToolExecutionBubble } from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";
import { supabase } from "@/utils/SupabaseClient";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { WebSocketConversation } from "@/utils/WebSocket";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

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

interface WorkspaceContextType {
	ws: WebSocketConversation | null;
	// Whiteboard functions
	setCurrentArtifactById: (artifactId: string) => void;
	setCurrentArtifact: (artifact: Artifact | null) => void;
	artifacts: Artifacts;
	currentArtifact: Artifact | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
	undefined,
);

export function WorkspaceProvider({
	threadId,
	isQueryData,
	children,
}: {
	threadId: string;
	isQueryData: boolean;
	children: React.ReactNode;
}) {
	const { userId, getValidToken } = useAuth();
	const { userConfig, upsertUserConfig, updateConnectionMeta } =
		useUserConfig();
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

	console.log("[WorkspaceProvider] threadId", threadId);
	console.log("[WorkspaceProvider] ws", ws);

	useEffect(() => {
		const initWebSocket = async () => {
			const token = await getValidToken();
			const wsConvo = new WebSocketConversation(
				token,
				userId,
				userConfig,
				threadId,
			);
			wsConvo.subscribe("tool", (toolCall: ToolExecutionBubble) => {
				if (toolCall.tool === "agent_update_business") {
					upsertUserConfig({
						...userConfig,
						business_overview: toolCall.result,
					});
				}
				if (toolCall.tool === "agent_write_meta_file") {
					const connection_id = toolCall.arguments.connection_id;
					const meta_file_json = toolCall.arguments.meta_file_json;
					const meta_data = JSON.parse(meta_file_json);
					// Set the meta file in the specific connector
					const connector = userConfig.data_connectors.find(
						(connector) => connector.id === connection_id,
					);
					if (connector) {
						updateConnectionMeta(connection_id, meta_data);
					}
				}
				if (
					toolCall.tool === "write_bi_report" ||
					toolCall.tool === "agent_execute_python_code" ||
					toolCall.tool === "agent_execute_bigquery"
				) {
					setArtifacts({ ...ws.artifacts });
				}
				if (toolCall.tool === "agent_execute_sql_query") {
					console.log("[WorkspaceProvider] agent_execute_sql_query", toolCall);
					const queryId = toolCall.arguments.query_id;
					setCurrentArtifactById(queryId);
				}
			});
			setWs(wsConvo);
		};
		if (ws === null) {
			console.log("[WorkspaceProvider] initWebSocket");
			initWebSocket();
		} else if (threadId !== ws.threadId) {
			ws.disconnect();
			initWebSocket();
		}

		return () => {
			if (ws?.isConnected) {
				ws.disconnect();
			}
		};
	}, [
		threadId,
		getValidToken,
		userId,
		updateConnectionMeta,
		upsertUserConfig,
		userConfig,
		ws,
	]);

	useEffect(() => {
		if (ws && isQueryData) {
			ws.queryData();
		}
	}, [isQueryData, ws]);

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

	return (
		<WorkspaceContext.Provider
			value={{
				setCurrentArtifactById,
				setCurrentArtifact,
				artifacts,
				currentArtifact,
				ws,
			}}
		>
			{children}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspace() {
	const context = useContext(WorkspaceContext);
	if (!context) {
		throw new Error("useWorkspace must be used within a WorkspaceProvider");
	}
	return context;
}
