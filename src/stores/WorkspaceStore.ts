import type { MessageBubble } from "@/types/chat";
import { supabase } from "@/utils/SupabaseClient";
import type { Artifact, Artifacts } from "@/utils/UserConfigProvider";
import { WebSocketConversation } from "@/utils/WebSocket";
import { makeAutoObservable, runInAction } from "mobx";
import { configure } from "mobx";
import { userConfigStore } from "./UserConfigStore";

configure({
	enforceActions: "never",
});

export class WorkspaceStore {
	artifacts: Artifacts = {
		images: [],
		documents: [],
		queries: [],
	};
	messages: MessageBubble[] = [];
	currentArtifact: Artifact | null = null;
	potentialResponses: string[] = [];
	ws: WebSocketConversation = new WebSocketConversation();

	constructor() {
		makeAutoObservable(this);
	}

	async addArtifactAndPersist(artifact: Artifact) {
		if (userConfigStore.threadId !== "") {
			await supabase.addArtifact(userConfigStore.threadId, artifact);
		}
		runInAction(() => {
			if (artifact.artifact_type === "image") {
				this.artifacts.images.push(artifact);
			} else if (artifact.artifact_type === "document") {
				this.artifacts.documents.push(artifact);
			} else if (artifact.artifact_type === "query") {
				this.artifacts.queries.push(artifact);
			}
		});
	}

	createQuery() {
		const newQuery: Artifact = {
			id: crypto.randomUUID(),
			artifact_type: "query",
			content: "",
			created_at: new Date().toISOString(),
		};
		this.artifacts.queries.push(newQuery);
		return newQuery;
	}

	/**
	 * Updates an artifact in the store and persists the update to the backend.
	 * Finds the artifact by id and replaces it in the correct array.
	 */
	async updateArtifactAndPersist(updatedArtifact: Artifact): Promise<void> {
		if (userConfigStore.threadId !== "") {
			await supabase.updateArtifact(userConfigStore.threadId, updatedArtifact);
		}
		runInAction(() => {
			const arr =
				updatedArtifact.artifact_type === "image"
					? this.artifacts.images
					: updatedArtifact.artifact_type === "document"
						? this.artifacts.documents
						: this.artifacts.queries;
			const idx = arr.findIndex((a) => a.id === updatedArtifact.id);
			if (idx !== -1) {
				arr[idx] = updatedArtifact;
			}
		});
	}

	// setArtifacts(artifacts: Artifacts) {
	//   this.artifacts = artifacts;
	// }

	// setCurrentArtifact(artifact: Artifact | null) {
	//   this.currentArtifact = artifact;
	// }

	async addMessageAndPersist(message: MessageBubble) {
		if (userConfigStore.threadId !== "") {
			supabase.pushMessage(userConfigStore.threadId, message);
		}
		console.log("Adding message", message);
		const idx = this.messages.findIndex((m) => m.id === message.id);
		if (idx === -1) {
			runInAction(() => {
				this.messages.push(message);
			});
		} else {
			runInAction(() => {
				this.messages[idx] = message;
			});
		}
	}

	/**
	 * Loads artifacts and messages for a thread and sets them in the store.
	 * Returns true if successful, false otherwise.
	 */
	async loadThreadContent(threadId: string): Promise<boolean> {
		console.log("Loading thread content for threadId", threadId);
		try {
			const artifacts = await supabase.getArtifacts(threadId);
			const messages = await supabase.getMessages(threadId);
			const formattedMessages = messages.map((message: any) => message.content);
			const processedArtifacts: Artifacts = {
				images: artifacts
					.filter((a: any) => a.artifact_type === "image")
					.sort(
						(a: any, b: any) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					),
				documents: artifacts
					.filter((a: any) => a.artifact_type === "document")
					.sort(
						(a: any, b: any) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					),
				queries: artifacts
					.filter((a: any) => a.artifact_type === "query")
					.sort(
						(a: any, b: any) =>
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime(),
					),
			};
			runInAction(() => {
				this.artifacts = processedArtifacts;
				this.messages = formattedMessages;
				userConfigStore.threadId = threadId;
			});
			console.log("[Workspace] Messages", this.messages.length);
			return true;
		} catch (err) {
			console.error("[WorkspaceStore] Error loading thread content:", err);
			return false;
		}
	}
}

export const workspaceStore = new WorkspaceStore();
