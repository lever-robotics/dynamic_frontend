import type { Artifact, Artifacts } from "@/contexts/WorkspaceContext";
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
import { supabase } from "./SupabaseClient";

type WebSocketEvent = "message" | "tool" | "agent" | "error" | "open" | "close";
type Subscriber = (eventData: any) => void;

export class WebSocketConversation {
	threadId: string | null;
	token: string;
	userId: string;
	ws: WebSocket;
	artifacts: Artifacts;
	messages: MessageBubble[];
	potentialResponses: string[];

	private subscribers: Map<WebSocketEvent, Set<Subscriber>> = new Map();

	constructor(token: string, userId: string, threadId?: string) {
		this.threadId = threadId || null;
		this.token = token;
		this.userId = userId;

		// Initialize subscriber sets for each event
		["message", "error", "open", "close", "tool", "agent"].forEach((event) => {
			this.subscribers.set(event as WebSocketEvent, new Set());
		});
	}

	private async loadThreadContent() {
		try {
			const artifacts = await supabase.getArtifacts(this.threadId);
			const messages = await supabase.getMessages(this.threadId);

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

			return {
				artifacts: processedArtifacts,
				messages: messages,
			};
		} catch (err) {
			console.error(
				"[WebSocketConversation] Error loading thread content:",
				err,
			);
			return {
				artifacts: null,
				messages: null,
			};
		}
	}

	async connect(flag: FlagType, flagContext) {
		if (!this.threadId) {
			const { artifacts, messages } = await this.loadThreadContent();
			this.artifacts = artifacts;
			this.messages = messages;
		}

		const flagChunk = this.getFlagChunk(flag, flagContext);

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
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
		}
	}

	private getFlagChunk(flag: FlagType, context): FlagChunk {
		switch (flag) {
			case "query": {
				return {
					type: "flag",
					flag: flag,
					context: {
						...context,
						messages: this.messages,
						artifacts: this.artifacts,
					},
				};
			}
			case "blueprint": {
				return {
					type: "flag",
					flag: flag,
					context: context,
				};
			}
			case "onboarding": {
				return {
					type: "flag",
					flag: flag,
					context: context,
				};
			}
			default: {
				return null;
			}
		}
	}

	updateArtifact(artifact: Artifact) {
		const index = this.artifacts.queries.findIndex((a) => a.id === artifact.id);
		if (index !== -1) {
			this.artifacts.queries[index] = artifact;
		}
		this.notify("tool", artifact);
		supabase.updateArtifact(this.threadId, artifact);
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

		try {
			this.ws.send(JSON.stringify(wsMessage));
			return true;
		} catch (error) {
			console.error("Error sending message:", error);
			return false;
		}
	}

	queryData() {
		const queryId = crypto.randomUUID();
		const toolCall = {
			tool: "agent_execute_sql_query",
			arguments: {
				query_id: queryId,
			},
			status: "pending",
			result: "",
			error: "",
		};
		const newQuery: Artifact = {
			id: queryId,
			artifact_type: "query",
			content: "",
			created_at: new Date().toISOString(),
		};
		this.artifacts.queries.push(newQuery);
		supabase.addArtifact(this.threadId, newQuery);
		this.notify("tool", toolCall);
	}

	sendUserMessage(content: string) {
		const userMessage: MessageBubble = {
			id: crypto.randomUUID(),
			type: "user",
			chunks: [{ content }],
			orderIndex: this.messages.length,
		};
		this.messages.push(userMessage);
		supabase.pushMessage(this.threadId, userMessage);
		this.notify("message", userMessage);
		this.sendMessage("toLLM", { type: "toLLM", text: content } as ToLLMMessage);
	}

	handleIncomingMessage(message: WebSocketMessage) {
		const { payload, messageId } = message;

		switch (payload.type) {
			case "text": {
				const newChunk: MessageChunkBubble = {
					content: (payload as MessageChunk).content,
				};
				const lastMessage = this.messages[this.messages.length - 1];
				if (lastMessage?.type === "assistant") {
					lastMessage.chunks.push(newChunk);
					supabase.pushMessage(this.threadId, lastMessage);
				} else {
					this.messages.push({
						id: crypto.randomUUID(),
						type: "assistant",
						chunks: [newChunk],
						orderIndex: this.messages.length,
					});
					supabase.pushMessage(
						this.threadId,
						this.messages[this.messages.length - 1],
					);
				}
				this.notify("message", message);

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
							const firstDocument = this.artifacts.documents[0];
							if (firstDocument) {
								firstDocument.content = report;
								newChunk.toolCall.artifactId = firstDocument.id;
								supabase.updateArtifact(this.threadId, firstDocument);
							} else {
								const newDocument: Artifact = {
									id,
									artifact_type: "document",
									content: report,
									created_at: new Date().toISOString(),
								};
								// Create new document and get its ID
								this.artifacts.documents.push(newDocument);
								supabase.addArtifact(this.threadId, newDocument);
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
							this.artifacts.images.push(newImage);
							supabase.addArtifact(this.threadId, newImage);
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
							this.artifacts.queries.push(newQuery);
							supabase.addArtifact(this.threadId, newQuery);
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
							this.artifacts.queries.push(newQuery);
							supabase.addArtifact(this.threadId, newQuery);
						}
						this.notify("tool", newChunk.toolCall);
						break;
					}

					case "agent_update_business": {
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
						orderIndex: this.messages.length,
					};
					this.messages.push(newMessage);
					this.notify("message", newMessage);
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
