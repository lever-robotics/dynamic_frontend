import type { FlagType } from "@/types/chat";
import type { DataConnector } from "@/types/connectors";
import { authStore } from "@/utils/AuthProvider";
import { WebSocketConversation } from "@/utils/WebSocket";
import { makeAutoObservable, runInAction } from "mobx";
import { configure } from "mobx";
import { supabase } from "../utils/SupabaseClient";
import { workspaceStore } from "./WorkspaceStore";

configure({
	enforceActions: "never",
});

export interface UserConfig {
	completed_onboarding: boolean;
	business_overview: string;
	data_connectors: DataConnector[];
	business_name: string;
	business_url: string;
}

export class UserConfigStore {
	userConfig = null;
	threads = [];
	threadId = "";

	constructor() {
		makeAutoObservable(this);
	}
	// In your MobX store
	async upsertUserConfig(newConfig: UserConfig) {
		if (!authStore.session?.access_token) {
			console.error("No valid token for upsertUserConfig");
			return;
		}
		try {
			const resp = await fetch(`${import.meta.env.VITE_API_URL}/v0/config`, {
				method: "POST", // or "PUT" depending on your API
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authStore.session?.access_token}`,
				},
				body: JSON.stringify(newConfig),
			});
			const body = await resp.json();
			if (body.error) throw new Error(body.error);

			// Update the store state
			runInAction(() => {
				this.userConfig = { ...newConfig };
			});
		} catch (err) {
			console.error("Error updating user config:", err);
		}
	}
	async createThread(name: string): Promise<string> {
		try {
			const { data, error } = await supabase
				.from("threads")
				.insert([{ user_id: authStore.session?.user.id, name }])
				.select()
				.single();
			if (error) {
				console.error("Error creating thread:", error);
				return "";
			}

			runInAction(() => {
				this.threads = [...this.threads, data];
			});

			return data.id;
		} catch (err) {
			console.error("[UserConfigStore] Error creating thread:", err);
			return "";
		}
	}
	async updateThread(threadId: string, name: string): Promise<string> {
		try {
			const { data, error } = await supabase
				.from("threads")
				.update([{ name }])
				.eq("id", threadId)
				.select()
				.single();
			if (error) {
				console.error("Error updating thread:", error);
				return "";
			}

			runInAction(() => {
				this.threads = this.threads.map((t) =>
					t.id === threadId ? { ...t, name } : t,
				);
			});

			return threadId;
		} catch (err) {
			console.error("[UserConfigStore] Error updating thread:", err);
			return "";
		}
	}

	async updateConnectionMeta(
		connectionId: string,
		meta: DataConnector["meta"],
	) {
		if (!authStore.session?.access_token) {
			console.error("No valid token for updateConnectionMeta");
			return;
		}
		try {
			const updateResp = await fetch(
				`${import.meta.env.VITE_API_URL}/v0/connectors/${connectionId}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authStore.session?.access_token}`,
					},
					body: JSON.stringify({ meta }),
				},
			);
			const updateBody = await updateResp.json();
			if (updateBody.error) {
				throw new Error(updateBody.error);
			}
			// Refresh user config after update
			await this.fetchUserConfig(authStore.session?.user.id);
		} catch (err) {
			console.error("Error updating connection metadata:", err);
		}
	}

	// async switchThread(threadId: string) {
	// 	await workspaceStore.loadThreadContent(threadId);
	// 	runInAction(() => {
	// 		this.threadId = threadId;
	// 	});
	// }

	async createConnection(connectionType: string, keys: Record<string, string>) {
		if (!authStore.session?.access_token) {
			console.error("No valid token for createConnection");
			return;
		}
		try {
			const resp = await fetch(
				`${import.meta.env.VITE_API_URL}/v0/connectors/${connectionType}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${authStore.session?.access_token}`,
					},
					body: JSON.stringify(keys),
				},
			);
			const body = await resp.json();
			if (body.error) {
				throw new Error(body.error);
			}
			// Refresh user config after creation
			await this.fetchUserConfig(authStore.session?.user.id);
		} catch (err) {
			console.error("Error creating connection:", err);
		}
	}

	async fetchUserConfig(userId: string) {
		if (!authStore.session?.access_token) {
			console.error("No valid token for fetchUserConfig");
			return;
		}
		try {
			const configResp = await fetch(
				`${import.meta.env.VITE_API_URL}/v0/config`,
				{
					headers: {
						Authorization: `Bearer ${authStore.session?.access_token}`,
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
						Authorization: `Bearer ${authStore.session?.access_token}`,
					},
				},
			);
			const connectorsBody = await connectorsResp.json();
			const connectors = Object.values(connectorsBody.data) || [];
			runInAction(() => {
				this.userConfig = {
					completed_onboarding: configBody.data.completed_onboarding,
					business_overview: configBody.data.business_overview,
					data_connectors: connectors,
					business_name: configBody.data.business_name,
					business_url: configBody.data.business_url,
				};
			});
			console.log(this.userConfig);
		} catch (err) {
			console.error("Error fetching user config:", err);
		}
	}

	// async switchThread(threadId: string) {
	// 	this.threadId = threadId;
	// 	await workspaceStore.loadThreadContent();
	// }

	async fetchThreads(userId: string) {
		if (!authStore.session?.access_token || !userId) {
			console.error("fetchThreads: Missing token or userId");
			return;
		}
		try {
			// Assuming supabase is globally available or imported
			const { data: threads, error: threadsError } = await supabase
				.from("threads")
				.select("id, name, created_at")
				.eq("user_id", authStore.session?.user.id)
				.order("created_at", { ascending: false });
			if (threadsError) throw threadsError;
			runInAction(() => {
				this.threads = threads || [];
			});
		} catch (err) {
			console.error("Error fetching threads:", err);
		}
	}
}

export const userConfigStore = new UserConfigStore();
