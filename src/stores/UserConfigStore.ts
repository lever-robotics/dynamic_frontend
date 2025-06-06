import type { DataConnector } from "@/types/connectors";
import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "../utils/SupabaseClient";

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
	// In your MobX store
	async upsertUserConfig(token: string, newConfig: UserConfig) {
		if (!token) {
			console.error("No valid token for upsertUserConfig");
			return;
		}
		try {
			const resp = await fetch(`${import.meta.env.VITE_API_URL}/v0/config`, {
				method: "POST", // or "PUT" depending on your API
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
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
	async createThread(userId: string, name: string): Promise<string> {
		try {
			const { data, error } = await supabase
				.from("threads")
				.insert([{ user_id: userId, name }])
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

	async updateConnectionMeta(
		token: string,
		connectionId: string,
		meta: DataConnector["meta"],
	) {
		if (!token) {
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
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ meta }),
				},
			);
			const updateBody = await updateResp.json();
			if (updateBody.error) {
				throw new Error(updateBody.error);
			}
			// Refresh user config after update
			await this.fetchUserConfig(token);
		} catch (err) {
			console.error("Error updating connection metadata:", err);
		}
	}

	async createConnection(
		token: string,
		connectionType: string,
		keys: Record<string, string>,
	) {
		if (!token) {
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
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(keys),
				},
			);
			const body = await resp.json();
			if (body.error) {
				throw new Error(body.error);
			}
			// Refresh user config after creation
			await this.fetchUserConfig(token);
		} catch (err) {
			console.error("Error creating connection:", err);
		}
	}

	constructor() {
		makeAutoObservable(this);
	}

	async fetchUserConfig(token: string) {
		if (!token) {
			console.error("Failed to get valid token");
			return;
		}
		try {
			const configResp = await fetch(
				`${import.meta.env.VITE_API_URL}/v0/config`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
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
						Authorization: `Bearer ${token}`,
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
		} catch (err) {
			console.error("Error fetching user config:", err);
		}
	}

	async fetchThreads(token: string, userId: string) {
		if (!token || !userId) {
			console.error("fetchThreads: Missing token or userId");
			return;
		}
		try {
			// Assuming supabase is globally available or imported
			const { data: threads, error: threadsError } = await supabase
				.from("threads")
				.select("id, name, created_at")
				.eq("user_id", userId)
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
