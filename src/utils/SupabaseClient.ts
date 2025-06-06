// src/utils/SupabaseClient.ts
import type { Artifact } from "@/contexts/WorkspaceContext";
import type { MessageBubble } from "@/types/chat";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ugqelrsbgvwjlnzrzqab.supabase.co";
const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncWVscnNiZ3Z3amxuenJ6cWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDg5NzgsImV4cCI6MjA2MjY4NDk3OH0.XqfvQ2IGrNs3CCttk0eEiGY6UgftXD8sWHllnKWnzVc";

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class Supabase extends SupabaseClient {
	constructor() {
		super(SUPABASE_URL, SUPABASE_ANON_KEY);
	}

	async getMessages(threadId: string) {
		if (threadId === null) return [];
		const { data: messages, error: messagesError } = await this.from(
			"thread_messages",
		)
			.select("*")
			.eq("thread_id", threadId)
			.order("order_index", { ascending: true });

		if (messagesError) throw messagesError;

		return messages;
	}

	async getArtifacts(threadId: string) {
		if (threadId === null) return [];
		const { data: artifacts, error: artifactsError } = await this.from(
			"thread_artifacts",
		)
			.select("artifact_type, content, created_at, id")
			.eq("thread_id", threadId);

		if (artifactsError) throw artifactsError;

		return artifacts;
	}

	async pushMessage(threadId: string, message: MessageBubble) {
		if (threadId === null) return;
		const { error } = await this.from("thread_messages")
			.upsert([
				{
					id: message.id,
					thread_id: threadId,
					message_type: message.type,
					content: message,
					order_index: message.orderIndex,
				},
			])
			.select();

		if (error) throw error;
	}

	async updateArtifact(threadId: string, artifact: Artifact) {
		if (threadId === null) return;
		const { error } = await this.from("thread_artifacts")
			.update({
				content: artifact.content,
			})
			.eq("id", artifact.id)
			.eq("thread_id", threadId);

		if (error) throw error;
	}

	async addArtifact(threadId: string, artifact: Artifact) {
		if (threadId === null) return;

		const { data: newArtifact, error } = await this.from("thread_artifacts")
			.insert([
				{
					thread_id: threadId,
					...artifact,
				},
			])
			.select()
			.single();

		if (error) throw error;
	}
}

export const supabase = new Supabase();
