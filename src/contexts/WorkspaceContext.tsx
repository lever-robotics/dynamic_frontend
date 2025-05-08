import type { MessageBubble, ToolExecutionBubble } from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";
import { supabase } from "@/utils/SupabaseClient";
import { createContext, useCallback, useContext, useState } from "react";

type WhiteboardView = "DataExecutor" | "DocViewer" | "GraphViewer";

interface Thread {
	id: string;
	name: string;
	created_at: string;
}

export interface Artifact {
	artifact_type: "image" | "document" | "query";
	content: string;
	created_at: string;
	id: string;
}

export interface Artifacts {
	images: Artifact[];
	documents: Artifact[];
	queries: Artifact[];
}

interface WorkspaceState {
	threads: Thread[];
	currentThreadId: string | null;
	messages: MessageBubble[];
	artifacts: Artifacts;
	currentView: WhiteboardView;
	selectedTool: ToolExecutionBubble | null;
	document: Artifact | null;
	image: Artifact | null;
	query: Artifact | null;
	launchChatMessage: string | null;
}

interface WorkspaceContextType {
	state: WorkspaceState;
	isLoading: boolean;
	error: string | null;
	// Thread management functions
	createThread: (name: string) => Promise<string>;
	switchThread: (threadId: string) => Promise<void>;
	addMessage: (message: MessageBubble) => Promise<void>;
	addArtifact: (
		type: "image" | "document" | "query",
		content: string,
	) => Promise<void>;
	updateArtifact: (artifact: Artifact) => Promise<void>;
	// Whiteboard functions
	setView: (view: WhiteboardView) => void;
	setSelectedTool: (tool: ToolExecutionBubble | null) => void;
	setDocument: (document: Artifact | null) => void;
	setImage: (image: Artifact | null) => void;
	setQuery: (query: Artifact | null) => void;
	setLaunchChatMessage: (message: string) => void;
	initializeWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
	undefined,
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
	console.log("[WorkspaceContext] Initializing the Workspace Provider");
	const { userId } = useAuth();
	const [state, setState] = useState<WorkspaceState>({
		threads: [],
		currentThreadId: "",
		messages: [],
		artifacts: {
			images: [],
			documents: [],
			queries: [],
		},
		currentView: "DocViewer",
		selectedTool: null,
		document: null,
		image: null,
		query: null,
		launchChatMessage: null,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const initializeWorkspace = useCallback(async () => {
		console.log("[WorkspaceContext] Changed ThreadId, or re-rendered");
		if (!userId) {
			console.log("[WorkspaceContext] No user ID, skipping initialization");
			return;
		}

		setIsLoading(true);
		try {
			console.log("[WorkspaceContext] Fetching threads");
			const { data: threads, error: threadsError } = await supabase
				.from("threads")
				.select("id, name, created_at")
				.eq("user_id", userId)
				.order("created_at", { ascending: false });

			if (threadsError) throw threadsError;

			console.log("[WorkspaceContext] Found threads:", threads?.length);
			setState((prev) => ({
				...prev,
				threads: threads || [],
			}));

			if (state.currentThreadId) {
				console.log(
					"[WorkspaceContext] Loading content for thread:",
					state.currentThreadId,
				);
				await loadThreadContent(state.currentThreadId);
			}
		} catch (err) {
			console.error("[WorkspaceContext] Initialization error:", err);
			setError(
				err instanceof Error ? err.message : "Failed to initialize workspace",
			);
		} finally {
			setIsLoading(false);
		}
	}, [userId, state.currentThreadId]);

	const getArtifacts = async (threadId: string) => {
		try {
			const { data: artifacts, error: artifactsError } = await supabase
				.from("thread_artifacts")
				.select("artifact_type, content, created_at, id")
				.eq("thread_id", threadId);

			if (artifactsError) throw artifactsError;

			console.log("[WorkspaceContext] Loaded artifacts:", artifacts?.length);

			// Process artifacts
			const processedArtifacts: Artifacts = {
				images: artifacts
					.filter((a) => a.artifact_type === "image")
					.sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					),
				documents: artifacts
					.filter((a) => a.artifact_type === "document")
					.sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					),
				queries: artifacts
					.filter((a) => a.artifact_type === "query")
					.sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					),
			};

			// Get latest of each type
			const latestDocument = processedArtifacts.documents[0] || null;
			const latestImage = processedArtifacts.images[0] || null;
			const latestQuery: Artifact | null =
				processedArtifacts.queries[0] || null;

			setState((prev) => ({
				...prev,
				artifacts: processedArtifacts,
				document: latestDocument,
				image: latestImage,
				query: latestQuery,
			}));
		} catch (err) {
			console.error("[WorkspaceContext] Error loading thread content:", err);
			setError(
				err instanceof Error ? err.message : "Failed to load thread content",
			);
		}
	};

	const loadThreadContent = async (threadId: string) => {
		try {
			const { data: messages, error: messagesError } = await supabase
				.from("thread_messages")
				.select("content")
				.eq("thread_id", threadId)
				.order("created_at", { ascending: true });

			if (messagesError) throw messagesError;

			const { data: artifacts, error: artifactsError } = await supabase
				.from("thread_artifacts")
				.select("artifact_type, content, created_at, id")
				.eq("thread_id", threadId);

			if (artifactsError) throw artifactsError;

			console.log("[WorkspaceContext] Loaded messages:", messages?.length);
			console.log("[WorkspaceContext] Loaded artifacts:", artifacts?.length);

			// Process artifacts
			const processedArtifacts: Artifacts = {
				images: artifacts
					.filter((a) => a.artifact_type === "image")
					.sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					),
				documents: artifacts
					.filter((a) => a.artifact_type === "document")
					.sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					),
				queries: artifacts
					.filter((a) => a.artifact_type === "query")
					.sort(
						(a, b) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					),
			};

			// Get latest of each type
			const latestDocument = processedArtifacts.documents[0] || null;
			const latestImage = processedArtifacts.images[0] || null;
			const latestQuery: Artifact | null =
				processedArtifacts.queries[0] || null;

			setState((prev) => ({
				...prev,
				messages: messages.map((m) => m.content),
				artifacts: processedArtifacts,
				document: latestDocument,
				image: latestImage,
				query: latestQuery,
			}));
		} catch (err) {
			console.error("[WorkspaceContext] Error loading thread content:", err);
			setError(
				err instanceof Error ? err.message : "Failed to load thread content",
			);
		}
	};

	const createThread = async (name: string): Promise<string> => {
		console.log("[WorkspaceContext] Creating new thread:", name);
		if (!userId) {
			console.error("[WorkspaceContext] No user ID for thread creation");
			throw new Error("User not authenticated");
		}

		try {
			const { data, error } = await supabase
				.from("threads")
				.insert([{ user_id: userId, name }])
				.select()
				.single();

			if (error) throw error;

			console.log("[WorkspaceContext] Thread created successfully:", data.id);
			setState((prev) => ({
				...prev,
				threads: [data, ...prev.threads],
				currentThreadId: data.id,
			}));

			return data.id;
		} catch (err) {
			console.error("[WorkspaceContext] Error creating thread:", err);
			setError(err instanceof Error ? err.message : "Failed to create thread");
			throw err;
		}
	};

	const switchThread = async (threadId: string) => {
		setState((prev) => ({
			...prev,
			currentThreadId: threadId,
		}));
		await loadThreadContent(threadId);
	};

	const addMessage = async (message: MessageBubble) => {
		if (!state.currentThreadId) return;

		try {
			const { error } = await supabase.from("thread_messages").insert([
				{
					thread_id: state.currentThreadId,
					message_type: message.type,
					content: message,
				},
			]);

			if (error) throw error;

			setState((prev) => ({
				...prev,
				messages: [...prev.messages, message],
			}));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add message");
		}
	};

	const updateArtifact = async (artifact: Artifact) => {
		if (!state.currentThreadId) return;

		try {
			const { error } = await supabase.from("thread_artifacts").update([
				{
					thread_id: state.currentThreadId,
					artifact_type: artifact.artifact_type,
					content: artifact.content,
					id: artifact.id,
				},
			]);

			if (error) throw error;

			const newState = { ...state };
			switch (artifact.artifact_type) {
				case "image": {
					const old = newState.artifacts.images.findIndex(
						(a) => a.id === artifact.id,
					);
					if (old) {
						newState.artifacts.images[old] = artifact;
					}
					break;
				}
				case "document": {
					const old = newState.artifacts.documents.findIndex(
						(a) => a.id === artifact.id,
					);
					if (old) {
						newState.artifacts.documents[old] = artifact;
					}
					break;
				}
				case "query": {
					const old = newState.artifacts.queries.findIndex(
						(a) => a.id === artifact.id,
					);
					if (old) {
						newState.artifacts.queries[old] = artifact;
					}
					break;
				}
			}

			setState(newState);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update artifact",
			);
		}
	};

	const addArtifact = async (
		type: "image" | "document" | "query",
		content: string,
	) => {
		if (!state.currentThreadId) return;

		try {
			const { error } = await supabase.from("thread_artifacts").insert([
				{
					thread_id: state.currentThreadId,
					artifact_type: type,
					content,
					created_at: new Date().toISOString(),
				},
			]);

			if (error) throw error;

			await getArtifacts(state.currentThreadId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add artifact");
		}
	};

	const setView = (view: WhiteboardView) => {
		setState((prev) => ({
			...prev,
			currentView: view,
		}));
	};

	const setSelectedTool = (tool: ToolExecutionBubble | null) => {
		setState((prev) => ({
			...prev,
			selectedTool: tool,
		}));
	};

	const setDocument = (document: Artifact | null) => {
		setState((prev) => ({
			...prev,
			document,
		}));
	};

	const setImage = (image: Artifact | null) => {
		setState((prev) => ({
			...prev,
			image,
		}));
	};

	const setQuery = (query: Artifact | null) => {
		setState((prev) => ({
			...prev,
			query,
		}));
	};

	const setLaunchChatMessage = (message: string) => {
		setState((prev) => ({
			...prev,
			launchChatMessage: message,
		}));
	};

	return (
		<WorkspaceContext.Provider
			value={{
				state,
				isLoading,
				error,
				createThread,
				switchThread,
				addMessage,
				addArtifact,
				updateArtifact,
				setView,
				setSelectedTool,
				setDocument,
				setImage,
				setQuery,
				setLaunchChatMessage,
				initializeWorkspace,
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
