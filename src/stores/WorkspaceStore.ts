import type { MessageBubble } from "@/types/chat";
import { supabase } from "@/utils/SupabaseClient";
import type { Artifact, Artifacts } from "@/utils/UserConfigProvider";
import { makeAutoObservable, runInAction } from "mobx";

// Maybe turn strict mode off somehow
export class WorkspaceStore {
	artifacts: Artifacts = {
		images: [],
		documents: [],
		queries: [],
	};
	messages: MessageBubble[] = [];
	currentArtifact: Artifact | null = null;
	potentialResponses: string[] = [];

	constructor() {
		makeAutoObservable(this);
	}

	async addArtifactAndPersist(threadId: string, artifact: Artifact) {
		await supabase.addArtifact(threadId, artifact);
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
	async updateArtifactAndPersist(
		threadId: string,
		updatedArtifact: Artifact,
	): Promise<void> {
		await supabase.updateArtifact(threadId, updatedArtifact);
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

	async addMessageAndPersist(threadId: string, message: MessageBubble) {
		await supabase.pushMessage(threadId, message);
		runInAction(() => {
			this.messages.push(message);
		});
	}

	// setMessages(messages: MessageBubble[]) {
	//   this.messages = messages;
	// }

	/**
	 * Loads artifacts and messages for a thread and sets them in the store.
	 * Returns true if successful, false otherwise.
	 */
	async loadThreadContent(threadId: string): Promise<boolean> {
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
			});
			return true;
		} catch (err) {
			console.error("[WorkspaceStore] Error loading thread content:", err);
			return false;
		}
	}
}

export const workspaceStore = new WorkspaceStore();
