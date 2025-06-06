import type { MessageBubble } from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";
import { supabase } from "@/utils/SupabaseClient";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

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

interface WorkspaceState {
	threads: Thread[];
	currentThreadId: string | null;
	messages: MessageBubble[];
	artifacts: Artifacts; // Keeps track of all artifacts in the thread, so they can be selected.
	currentArtifact: Artifact | null; //Keeps track of the current artifact that the whiteboard is displaying and interacting with
}

interface WorkspaceContextType {
	isLoading: boolean;
	error: string | null;
	// Thread management functions
	createThread: (name: string) => Promise<string>;
	switchThread: (threadId: string) => Promise<void>;
	addArtifact: (
		type: "image" | "document" | "query",
		content: string,
		id: string,
		metadata?: {
			data_source?: "bigquery" | "shopify";
			[key: string]: string | number | boolean | null;
		},
	) => Promise<Artifact | null>; // returns the artifact id
	updateArtifact: (artifact: Artifact) => Promise<void>;
	// Whiteboard functions
	setCurrentArtifactById: (artifactId: string) => void;
	setCurrentArtifact: (artifact: Artifact | null) => void;
	currentThreadId: string;
	currentThreadName: string;
	artifacts: Artifacts;
	currentArtifact: Artifact | null;
	messages: MessageBubble[];
	threads: Thread[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
	undefined,
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
	console.log("[WorkspaceContext] Initializing the Workspace Provider");
	const { userId } = useAuth();
	const [artifacts, setArtifacts] = useState<Artifacts>({
		images: [],
		documents: [],
		queries: [],
	});
	const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
	const [threads, setThreads] = useState<Thread[]>([]);
	const [currentThreadId, setCurrentThreadId] = useState<string>("");
	const [currentThreadName, setCurrentThreadName] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [messages, setMessages] = useState<MessageBubble[]>([]);

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);
				console.log("[WorkspaceContext] Fetching threads");
				const { data: threads, error: threadsError } = await supabase
					.from("threads")
					.select("id, name, created_at")
					.eq("user_id", userId)
					.order("created_at", { ascending: false });

				if (threadsError) throw threadsError;

				console.log("[WorkspaceContext] Found threads:", threads?.length);
				setThreads(threads || []);
			} catch (err) {
				console.error("[WorkspaceContext] Initialization error:", err);
				setError(
					err instanceof Error ? err.message : "Failed to initialize workspace",
				);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [userId]);

	const getMessages = async (threadId: string) => {
		try {
			const { data: messages, error: messagesError } = await supabase
				.from("thread_messages")
				.select("*")
				.eq("thread_id", threadId)
				.order("created_at", { ascending: false });

			if (messagesError) throw messagesError;

			console.log("[WorkspaceContext] Loaded messages:", messages?.length);
			setMessages(messages || []);
		} catch (err) {
			console.error("[WorkspaceContext] Error loading messages:", err);
			setError(err instanceof Error ? err.message : "Failed to load messages");
		}
	};

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

			setArtifacts(processedArtifacts);
			return processedArtifacts;
		} catch (err) {
			console.error("[WorkspaceContext] Error loading thread content:", err);
			setError(
				err instanceof Error ? err.message : "Failed to load thread content",
			);
		}
	};

	const loadThreadContent = async (threadId: string) => {
		if (threadId === "") return;
		try {
			const artifacts = await getArtifacts(threadId);
			await getMessages(threadId);
			console.log("[WorkspaceContext] Loaded artifacts:", artifacts);
			console.log(
				"[WorkspaceContext] Setting current artifact:",
				artifacts.documents[0]?.id,
			);
			const allArtifacts = [
				...artifacts.documents,
				...artifacts.images,
				...artifacts.queries,
			];
			const foundArtifact = allArtifacts.find(
				(a) => a.id === artifacts.documents[0]?.id,
			);
			if (foundArtifact) {
				setCurrentArtifact(foundArtifact);
			}
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

			// Create initial document artifact
			const sampleDocument = `# Data Analysis Report

## Monthly Sales Overview

Here's a line chart showing our monthly sales performance:

\`\`\`chart
{
  "type": "line",
  "data": {
    "labels": ["January", "February", "March", "April", "May", "June"],
    "datasets": [
      {
        "label": "Sales",
        "data": [65, 59, 80, 81, 56, 55],
        "borderColor": "rgb(75, 192, 192)",
        "tension": 0.1
      }
    ]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "title": {
        "display": true,
        "text": "Monthly Sales Data"
      }
    }
  }
}
\`\`\`

## Product Distribution

Here's a pie chart showing our product distribution:

\`\`\`chart
{
  "type": "pie",
  "data": {
    "labels": ["Product A", "Product B", "Product C"],
    "datasets": [
      {
        "label": "Sales Distribution",
        "data": [300, 50, 100],
        "backgroundColor": [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)"
        ]
      }
    ]
  }
}
\`\`\`

## Regional Performance

Here's a bar chart showing our regional performance:

\`\`\`chart
{
  "type": "bar",
  "data": {
    "labels": ["North", "South", "East", "West", "Central"],
    "datasets": [
      {
        "label": "Revenue",
        "data": [12, 19, 3, 5, 2],
        "backgroundColor": [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)"
        ],
        "borderColor": [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)"
        ],
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "scales": {
      "y": {
        "beginAtZero": true
      }
    }
  }
}
\`\`\``;

			const BlankDocument = "";

			// Create the initial document artifact
			const { error: artifactError } = await supabase
				.from("thread_artifacts")
				.insert([
					{
						thread_id: data.id,
						artifact_type: "document",
						content: BlankDocument,
						created_at: new Date().toISOString(),
					},
				]);

			if (artifactError) throw artifactError;

			// Update state with new thread and initial document
			setCurrentThreadId(data.id);
			setCurrentThreadName(name);
			await loadThreadContent(data.id);

			return data.id;
		} catch (err) {
			console.error("[WorkspaceContext] Error creating thread:", err);
			setError(err instanceof Error ? err.message : "Failed to create thread");
			throw err;
		}
	};

	const switchThread = async (threadId: string) => {
		await loadThreadContent(threadId);
		setCurrentThreadId(threadId);
		setCurrentThreadName(threads.find((t) => t.id === threadId)?.name || "");
	};

	const updateArtifact = async (artifact: Artifact) => {
		if (!currentThreadId) return;

		try {
			const { error } = await supabase
				.from("thread_artifacts")
				.update({
					content: artifact.content,
				})
				.eq("id", artifact.id)
				.eq("thread_id", currentThreadId);

			if (error) throw error;

			await getArtifacts(currentThreadId);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update artifact",
			);
		}
	};

	const addArtifact = async (
		type: "image" | "document" | "query",
		content: string,
		id: string,
		metadata?: {
			data_source?: "bigquery" | "shopify";
			[key: string]: string | number | boolean | null;
		},
	): Promise<Artifact | null> => {
		if (!currentThreadId) return null;

		try {
			const { data: newArtifact, error } = await supabase
				.from("thread_artifacts")
				.insert([
					{
						thread_id: currentThreadId,
						id,
						artifact_type: type,
						content,
						created_at: new Date().toISOString(),
						metadata: metadata || {},
					},
				])
				.select()
				.single();
			console.log("[WorkspaceContext] Added artifact:", newArtifact);

			if (error) throw error;

			const newArtifactState = {
				id,
				artifact_type: type,
				content,
				created_at: newArtifact.created_at,
				metadata: metadata || {},
			};

			// Update local state
			setArtifacts((prev) => {
				const typeMap = {
					image: "images",
					document: "documents",
					query: "queries",
				};

				return {
					...prev,
					[typeMap[type]]: [newArtifactState, ...prev[typeMap[type]]],
				};
			});
			return newArtifactState;
		} catch (err) {
			console.error("[WorkspaceContext] Error adding artifact:", err);
			setError(err instanceof Error ? err.message : "Failed to add artifact");
			return null;
		}
	};

	const setCurrentArtifactById = (artifactId: string) => {
		console.log("[WorkspaceContext] Setting current artifact:", artifactId);
		console.log("[WorkspaceContext] Artifacts:", artifacts);
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
				isLoading,
				error,
				createThread,
				switchThread,
				addArtifact,
				updateArtifact,
				setCurrentArtifactById,
				setCurrentArtifact,
				currentThreadId,
				currentThreadName,
				artifacts,
				currentArtifact,
				messages,
				threads,
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
