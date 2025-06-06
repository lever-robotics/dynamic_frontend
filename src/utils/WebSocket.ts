import type { Artifact, Artifacts } from "@/contexts/WorkspaceContext";
import { userConfigStore } from "@/stores/UserConfigStore";
import { workspaceStore } from "@/stores/WorkspaceStore";
import type {
	AgentChunk,
	FlagChunk,
	FlagContext,
	FlagType,
	MessageBubble,
	MessageChunk,
	MessageChunkBubble,
	Payload,
	ToLLMMessage,
	ToolChunk,
	WebSocketMessage,
	WebSocketMessageType,
} from "@/types/chat";
import type { UserConfig } from "@/utils/UserConfigProvider";
import { supabase } from "./SupabaseClient";

type WebSocketEvent = "message" | "tool" | "agent" | "error" | "open" | "close";
type Subscriber = (eventData: any) => void;

export class WebSocketConversation {
	threadId: string | null;
	token: string;
	userId: string;
	ws: WebSocket;
	potentialResponses: string[];
	isConnected: boolean;
	private subscribers: Map<WebSocketEvent, Set<Subscriber>> = new Map();

	constructor(token: string, userId: string, threadId?: string) {
		this.threadId = threadId || null;

		this.token = token;
		this.userId = userId;
		this.isConnected = false;
		this.potentialResponses = [];

		// Initialize subscriber sets for each event
		["message", "error", "open", "close", "tool", "agent"].forEach((event) => {
			this.subscribers.set(event as WebSocketEvent, new Set());
		});
	}

	async connect(flag: FlagType) {
		console.log("Connecting to WebSocket");
		if (this.threadId) {
			await workspaceStore.loadThreadContent(this.threadId);
			console.log(
				"[WebSocketConversation] Messages loaded:",
				workspaceStore.messages,
			);
			this.notify("message", workspaceStore.messages);
		}

		const flagChunk = this.getFlagChunk(flag);

		const wsUrl = `${import.meta.env.VITE_API_URL}/ws?token=${this.token}`;

		this.ws = new WebSocket(wsUrl);

		this.ws.onopen = () => {
			this.sendMessage("flag", flagChunk);
			this.notify("open");
		};

		this.ws.onclose = (event) => {
			this.notify("close", event);
		};

		this.ws.onmessage = (event) => {
			const message = JSON.parse(event.data) as WebSocketMessage;
			this.handleIncomingMessage(message);
		};

		this.ws.onerror = (event) => {
			console.error("WebSocket error:", event);
			this.notify("error", event);
		};
		this.isConnected = true;
	}

	disconnect() {
		console.log("Disconnecting from WebSocket");
		if (this.ws) {
			this.ws.close();
		}
		this.isConnected = false;
	}

	private getFlagChunk(flag: FlagType): FlagChunk {
		switch (flag) {
			case "query": {
				return {
					type: "flag",
					flag: flag,
					context: {
						...userConfigStore.userConfig,
						messages: workspaceStore.messages,
						artifacts: workspaceStore.artifacts,
					},
				};
			}
			case "blueprint": {
				return {
					type: "flag",
					flag: flag,
					context: {
						...userConfigStore.userConfig,
					},
				};
			}
			case "onboarding": {
				return {
					type: "flag",
					flag: flag,
					context: {
						...userConfigStore.userConfig,
					},
				};
			}
			default: {
				return null;
			}
		}
	}

	private sendMessage(type: WebSocketMessageType, payload: Payload) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.error("WebSocket is not connected");
			return false;
		}

		const wsMessage: WebSocketMessage = {
			type: type,
			messageId: crypto.randomUUID(),
			userId: this.userId,
			payload: payload,
			timestamp: new Date().toISOString(),
		};

		this.ws.send(JSON.stringify(wsMessage));
	}

	// queryData() {
	// 	console.log("[WebSocketConversation] queryData");
	// 	const queryId = crypto.randomUUID();
	// 	const toolCall = {
	// 		tool: "agent_execute_sql_query",
	// 		arguments: {
	// 			query_id: queryId,
	// 		},
	// 		status: "pending",
	// 		result: "",
	// 		error: "",
	// 	};
	// 	const newQuery: Artifact = {
	// 		id: queryId,
	// 		artifact_type: "query",
	// 		content: "",
	// 		created_at: new Date().toISOString(),
	// 	};
	// 	this.artifacts.queries.push(newQuery);
	// 	this.createQuery(toolCall);
	// }

	// private async createQuery(toolCall: ToolExecutionBubble) {
	// 	const newQuery: Artifact = {
	// 		artifact_type: "query",
	// 		content: "",
	// 		created_at: new Date().toISOString(),
	// 		id: crypto.randomUUID(),
	// 		metadata: {},
	// 	};
	// 	this.artifacts.queries.push(newQuery);
	// 	await workspaceStore.addArtifactAndPersist(this.threadId, newQuery);
	// 	this.notify("tool", toolCall);
	// }

	async sendUserMessage(content: string) {
		const userMessage: MessageBubble = {
			id: crypto.randomUUID(),
			type: "user",
			chunks: [{ content }],
			orderIndex: workspaceStore.messages.length,
		};
		await workspaceStore.addMessageAndPersist(this.threadId, userMessage);
		this.sendMessage("toLLM", { type: "toLLM", text: content } as ToLLMMessage);
	}

	private async handleIncomingMessage(message: WebSocketMessage) {
		const { payload, messageId } = message;

		switch (payload.type) {
			case "text": {
				const newChunk: MessageChunkBubble = {
					content: (payload as MessageChunk).content,
				};
				const lastMessage =
					workspaceStore.messages[workspaceStore.messages.length - 1];
				if (lastMessage?.type === "assistant") {
					lastMessage.chunks.push(newChunk);
					await workspaceStore.addMessageAndPersist(this.threadId, lastMessage);
				} else {
					const assistantMessage: MessageBubble = {
						id: crypto.randomUUID(),
						type: "assistant",
						chunks: [newChunk],
						orderIndex: workspaceStore.messages.length,
					};
					await workspaceStore.addMessageAndPersist(
						this.threadId,
						assistantMessage,
					);
				}
				return;
			}
			case "agent": {
				const agentChunk = payload as AgentChunk;
				this.notify("agent", agentChunk);
				break;
			}
			case "tool": {
				const toolChunk = payload as ToolChunk;
				const tool = toolChunk.tool;
				const result = toolChunk.result;
				const image = toolChunk.image;
				const toolArgs =
					typeof toolChunk.arguments === "string"
						? JSON.parse(toolChunk.arguments)
						: toolChunk.arguments;

				const id = crypto.randomUUID();

				const newChunk: MessageChunkBubble = {
					toolCall: {
						tool,
						arguments: toolArgs,
						status: toolChunk.status,
						result,
						error: toolChunk.error,
					},
				};

				switch (tool) {
					case "agent_user_potential_responses": {
						if (
							toolArgs &&
							typeof toolArgs === "object" &&
							"potential_responses" in toolArgs
						) {
							this.potentialResponses = toolArgs.potential_responses;
						}
						this.notify("tool", newChunk.toolCall);
						return;
					}
					case "write_bi_report": {
						const report = toolArgs.report;
						if (report) {
							const firstDocument = workspaceStore.artifacts.documents[0];
							if (firstDocument) {
								firstDocument.content = report;
								newChunk.toolCall.artifactId = firstDocument.id;
								await workspaceStore.updateArtifactAndPersist(
									this.threadId,
									firstDocument,
								);
							} else {
								const newDocument: Artifact = {
									id,
									artifact_type: "document",
									content: report,
									created_at: new Date().toISOString(),
								};
								// Create new document and get its ID
								await workspaceStore.addArtifactAndPersist(
									this.threadId,
									newDocument,
								);
							}
						}
						this.notify("tool", newChunk.toolCall);
						break;
					}
					case "agent_execute_python_code": {
						if (image) {
							const newImage: Artifact = {
								id,
								artifact_type: "image",
								content: image,
								created_at: new Date().toISOString(),
							};
							await workspaceStore.addArtifactAndPersist(
								this.threadId,
								newImage,
							);
						}
						this.notify("tool", newChunk.toolCall);
						break;
					}
					case "agent_execute_sql_query": {
						if (result) {
							const newQuery: Artifact = {
								id,
								artifact_type: "query",
								content: result,
								created_at: new Date().toISOString(),
							};
							await workspaceStore.addArtifactAndPersist(
								this.threadId,
								newQuery,
							);
						}
						this.notify("tool", newChunk.toolCall);
						break;
					}
					case "agent_execute_bigquery": {
						if (result) {
							const newQuery: Artifact = {
								id,
								artifact_type: "query",
								content: result,
								created_at: new Date().toISOString(),
							};
							await workspaceStore.addArtifactAndPersist(
								this.threadId,
								newQuery,
							);
						}
						this.notify("tool", newChunk.toolCall);
						break;
					}

					case "agent_update_business": {
						if (result) {
							await userConfigStore.upsertUserConfig(this.token, {
								...userConfigStore.userConfig,
								business_overview: result,
							});
						}
						this.notify("tool", newChunk.toolCall);
						break;
					}

					case "agent_write_meta_file": {
						this.notify("tool", newChunk.toolCall);
						break;
					}
					default: {
						break;
					}
				}

				if (toolChunk.status === "complete") {
					const newMessage: MessageBubble = {
						id,
						type: "tool",
						chunks: [newChunk],
						orderIndex: workspaceStore.messages.length,
					};
					await workspaceStore.addMessageAndPersist(this.threadId, newMessage);
				}
				break;
			}
		}
	}

	/**
	 * Subscribe to a WebSocket event.
	 * @param event Event type ('message', 'error', 'open', 'close')
	 * @param callback Function to call when the event occurs
	 */
	subscribe(event: WebSocketEvent, callback: Subscriber) {
		this.subscribers.get(event)?.add(callback);
	}

	/**
	 * Unsubscribe from a WebSocket event.
	 * @param event Event type
	 * @param callback Function to remove
	 */
	unsubscribe(event: WebSocketEvent, callback: Subscriber) {
		this.subscribers.get(event)?.delete(callback);
	}

	/**
	 * Notify all subscribers of an event.
	 * @param event Event type
	 * @param data Data to pass to subscribers
	 */
	private notify(event: WebSocketEvent, data?: any) {
		this.subscribers.get(event)?.forEach((cb) => {
			try {
				cb(data);
			} catch (err) {
				console.error(`Error in ${event} subscriber:`, err);
			}
		});
	}
}
