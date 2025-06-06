import type { Session, User } from "@supabase/supabase-js";
import { makeAutoObservable, runInAction } from "mobx";
import { configure } from "mobx";
import { supabase } from "./SupabaseClient";

export interface AuthResponse {
	user: User | null;
	session: Session | null;
}

export interface Credentials {
	email: string;
	password: string;
}

configure({
	enforceActions: "never",
});

export class AuthStore {
	session: Session | null = null;
	user: User | null = null;
	loading = true;
	error: string | null = null;

	constructor() {
		makeAutoObservable(this);
		this.init();
	}

	init() {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			runInAction(() => {
				this.session = session;
				this.user = session?.user || null;
				this.loading = false;
			});
		});

		// Subscribe to auth state changes
		supabase.auth.onAuthStateChange((_event, session) => {
			runInAction(() => {
				this.session = session;
				this.user = session?.user || null;
				this.loading = false;
			});
		});
	}

	async signIn({ email, password }: Credentials) {
		this.loading = true;
		this.error = null;
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;
			runInAction(() => {
				this.session = data.session;
				this.user = data.user;
				this.loading = false;
			});
			return data;
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message || "Sign in failed";
				this.loading = false;
			});
			throw err;
		}
	}

	async signOut() {
		this.loading = true;
		try {
			await supabase.auth.signOut();
			runInAction(() => {
				this.session = null;
				this.user = null;
				this.loading = false;
			});
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message || "Sign out failed";
				this.loading = false;
			});
			throw err;
		}
	}
}

export const authStore = new AuthStore();
