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
	state: WorkspaceState;
	isLoading: boolean;
	error: string | null;
	// Thread management functions
	createThread: (name: string) => Promise<string>;
	switchThread: (threadId: string) => Promise<void>;
	pushMessages: (messages: MessageBubble[]) => Promise<void>;
	addArtifact: (
		type: "image" | "document" | "query",
		content: string,
		metadata?: {
			data_source?: "bigquery" | "shopify";
			[key: string]: string | number | boolean | null;
		},
	) => Promise<string | null>; // returns the artifact id
	updateArtifact: (artifact: Artifact) => Promise<void>;
	// Whiteboard functions
	setCurrentArtifactById: (artifactId: string) => void;
	setCurrentArtifact: (artifact: Artifact | null) => void;
	currentThreadId: string;
	currentThreadName: string;
	messages: MessageBubble[];
	// initializeWorkspace: () => Promise<void>;
	fetchThreadMessages: (threadId: string) => Promise<MessageBubble[]>;
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
		currentArtifact: null,
	});
	const [messages, setMessages] = useState<MessageBubble[]>([]);
	const [currentThreadId, setCurrentThreadId] = useState<string>("");
	const [currentThreadName, setCurrentThreadName] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	console.log("[WorkspaceContext] messages:", messages);

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
				setState((prev) => ({
					...prev,
					threads: threads || [],
				}));
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

	// const initializeWorkspace = useCallback(async () => {
	// 	console.log("[WorkspaceContext] Changed ThreadId, or re-rendered");
	// 	if (!userId) {
	// 		console.log("[WorkspaceContext] No user ID, skipping initialization");
	// 		return;
	// 	}

	// 	setIsLoading(true);
	// 	try {
	// 		console.log("[WorkspaceContext] Fetching threads");
	// 		const { data: threads, error: threadsError } = await supabase
	// 			.from("threads")
	// 			.select("id, name, created_at")
	// 			.eq("user_id", userId)
	// 			.order("created_at", { ascending: false });

	// 		if (threadsError) throw threadsError;

	// 		console.log("[WorkspaceContext] Found threads:", threads?.length);
	// 		setState((prev) => ({
	// 			...prev,
	// 			threads: threads || [],
	// 		}));

	// 		if (state.currentThreadId) {
	// 			console.log(
	// 				"[WorkspaceContext] Loading content for thread:",
	// 				state.currentThreadId,
	// 			);
	// 			await loadThreadContent(state.currentThreadId);
	// 		}
	// 	} catch (err) {
	// 		console.error("[WorkspaceContext] Initialization error:", err);
	// 		setError(
	// 			err instanceof Error ? err.message : "Failed to initialize workspace",
	// 		);
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// }, [userId, state.currentThreadId]);

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
				currentArtifact: latestDocument || latestImage || latestQuery,
			}));
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
			const { data: messages, error: messagesError } = await supabase
				.from("thread_messages")
				.select("content")
				.eq("thread_id", threadId)
				.order("order_index", { ascending: true });

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

			setMessages(messages.map((m) => m.content));

			setState((prev) => ({
				...prev,
				messages: messages.map((m) => m.content),
				artifacts: processedArtifacts,
				currentArtifact: latestDocument || latestImage || latestQuery,
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

			// Create the initial document artifact
			const { error: artifactError } = await supabase
				.from("thread_artifacts")
				.insert([
					{
						thread_id: data.id,
						artifact_type: "document",
						content: sampleDocument,
						created_at: new Date().toISOString(),
					},
				]);

			if (artifactError) throw artifactError;

			// Update state with new thread and initial document
			setCurrentThreadId(data.id);
			setCurrentThreadName(name);
			setMessages([]);
			setState((prev) => ({
				...prev,
				threads: [data, ...prev.threads],
				artifacts: {
					...prev.artifacts,
					documents: [
						{
							id: data.id,
							artifact_type: "document",
							content: sampleDocument,
							created_at: new Date().toISOString(),
						},
					],
				},
				currentArtifact: {
					id: data.id,
					artifact_type: "document",
					content: sampleDocument,
					created_at: new Date().toISOString(),
				},
			}));

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
		setCurrentThreadName(
			state.threads.find((t) => t.id === threadId)?.name || "",
		);
	};

	const pushMessages = async (newMessages: MessageBubble[]) => {
		if (!currentThreadId) return;

		const currentIndex = messages.length;

		const toUpdate = newMessages.slice(currentIndex);
		console.log("[WorkspaceContext] Pushing messages:", toUpdate);

		setMessages((prev) => [...prev, ...toUpdate]);
		try {
			const { error } = await supabase.from("thread_messages").insert(
				toUpdate.map((message) => ({
					thread_id: currentThreadId,
					message_type: message.type,
					content: message,
					order_index: message.orderIndex,
				})),
			);

			if (error) throw error;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add messages");
		}
	};

	// const addMessage = async (message: MessageBubble) => {
	// 	if (!currentThreadId) return;
	// 	console.log("[WorkspaceContext] Adding message:", message)

	// 	message.orderIndex = messages.length;

	// 	setMessages((prev) => [...prev, message]);
	// 	try {
	// 		const { error } = await supabase.from("thread_messages").insert([
	// 			{
	// 				thread_id: currentThreadId,
	// 				message_type: message.type,
	// 				content: message,
	// 				order_index: message.orderIndex,
	// 			},
	// 		]);

	// 		if (error) throw error;

	// 	} catch (err) {
	// 		setError(err instanceof Error ? err.message : "Failed to add message");
	// 	}
	// };

	// const addMessages = async (messages: MessageBubble[]) => {
	// 	if (!currentThreadId) return;

	// 	let tempIndex = messages.length;
	// 	for (const message of messages) {
	// 		message.orderIndex = tempIndex;
	// 		tempIndex++;
	// 	}
	// 	setMessages((prev) => [...prev, ...messages]);
	// 	try {
	// 		const { error } = await supabase.from("thread_messages").insert(
	// 			messages.map((message) => ({
	// 				thread_id: currentThreadId,
	// 				message_type: message.type,
	// 				content: message,
	// 				order_index: message.orderIndex,
	// 			})),
	// 		);

	// 		if (error) throw error;
	// 	} catch (err) {
	// 		setError(err instanceof Error ? err.message : "Failed to add messages");
	// 	}
	// };

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

			setState((prev) => {
				const newState = { ...prev };
				switch (artifact.artifact_type) {
					case "image": {
						const index = newState.artifacts.images.findIndex(
							(a) => a.id === artifact.id,
						);
						if (index !== -1) {
							newState.artifacts.images[index] = artifact;
						}
						break;
					}
					case "document": {
						const index = newState.artifacts.documents.findIndex(
							(a) => a.id === artifact.id,
						);
						if (index !== -1) {
							newState.artifacts.documents[index] = artifact;
							// Also update the current artifact if it's the same one
							if (prev.currentArtifact?.id === artifact.id) {
								newState.currentArtifact = artifact;
							}
						}
						break;
					}
					case "query": {
						const index = newState.artifacts.queries.findIndex(
							(a) => a.id === artifact.id,
						);
						if (index !== -1) {
							newState.artifacts.queries[index] = artifact;
						}
						break;
					}
				}
				return newState;
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update artifact",
			);
		}
	};

	const addArtifact = async (
		type: "image" | "document" | "query",
		content: string,
		metadata?: {
			data_source?: "bigquery" | "shopify";
			[key: string]: string | number | boolean | null;
		},
	): Promise<string | null> => {
		if (!state.currentThreadId) return null;

		try {
			const { data: newArtifact, error } = await supabase
				.from("thread_artifacts")
				.insert([
					{
						thread_id: state.currentThreadId,
						artifact_type: type,
						content,
						created_at: new Date().toISOString(),
						metadata: metadata || {},
					},
				])
				.select()
				.single();

			if (error) throw error;

			// Update local state
			setState((prev) => {
				const newArtifactState = {
					id: newArtifact.id,
					artifact_type: type,
					content,
					created_at: newArtifact.created_at,
					metadata: metadata || {},
				};

				const typeMap = {
					image: "images",
					document: "documents",
					query: "queries",
				};

				return {
					...prev,
					artifacts: {
						...prev.artifacts,
						[typeMap[type]]: [
							newArtifactState,
							...prev.artifacts[typeMap[type]],
						],
					},
				};
			});

			return newArtifact.id;
		} catch (err) {
			console.error("[WorkspaceContext] Error adding artifact:", err);
			setError(err instanceof Error ? err.message : "Failed to add artifact");
			return null;
		}
	};

	const setCurrentArtifactById = (artifactId: string) => {
		setState((prev) => {
			// Search through all artifact types
			const allArtifacts = [
				...prev.artifacts.documents,
				...prev.artifacts.images,
				...prev.artifacts.queries,
			];

			const foundArtifact = allArtifacts.find((a) => a.id === artifactId);

			if (foundArtifact) {
				return {
					...prev,
					currentArtifact: foundArtifact,
				};
			}

			// If artifact not found, set to first document if available
			const firstDocument = prev.artifacts.documents[0] || null;
			return {
				...prev,
				currentArtifact: firstDocument,
			};
		});
	};

	const setCurrentArtifact = (artifact: Artifact | null) => {
		setState((prev) => ({
			...prev,
			currentArtifact: artifact,
		}));
	};

	const setLaunchChatMessage = (message: string) => {
		setState((prev) => ({
			...prev,
			launchChatMessage: message,
		}));
	};

	const fetchThreadMessages = async (
		threadId: string,
	): Promise<MessageBubble[]> => {
		try {
			const { data: messages, error } = await supabase
				.from("thread_messages")
				.select("content")
				.eq("thread_id", threadId)
				.order("created_at", { ascending: true });

			if (error) throw error;

			console.log("[WorkspaceContext] Fetched messages:", messages?.length);
			return messages.map((m) => m.content);
		} catch (err) {
			console.error("[WorkspaceContext] Error fetching messages:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch messages");
			throw err;
		}
	};

	return (
		<WorkspaceContext.Provider
			value={{
				state,
				isLoading,
				error,
				createThread,
				switchThread,
				pushMessages,
				addArtifact,
				updateArtifact,
				setCurrentArtifactById,
				setCurrentArtifact,
				currentThreadId,
				currentThreadName,
				messages,
				// initializeWorkspace,
				fetchThreadMessages,
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
