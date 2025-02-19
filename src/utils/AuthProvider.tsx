import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

interface AuthResponse {
	user: User | null;
	session: Session | null;
}

interface Credentials {
	email: string;
	password: string;
}

type AuthContextType = {
	getValidToken: () => Promise<string | null | undefined>;
	signUp: (credentials: Credentials) => Promise<AuthResponse>;
	signIn: (credentials: Credentials) => Promise<AuthResponse>;
	signOut: () => Promise<void>;
	readonly isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	/**
	 * Subscribes to Supabase to listen for Auth changes
	 */
	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				setSession(session);
				setIsAuthenticated(true);
			}
		});

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				if (session) {
					console.log(session.user);
					setSession(session);
					setIsAuthenticated(true);
				}
			},
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	const getValidToken = async (): Promise<string | null | undefined> => {
		if (!session) return null;

		const now = Math.floor(Date.now() / 1000);
		if (session.expires_at && session.expires_at < now) {
			const { data: refreshedSession } = await supabase.auth.refreshSession();
			setSession(refreshedSession.session);
			return refreshedSession.session?.access_token;
		}

		return session.access_token;
	};

	return (
		<AuthContext.Provider
			value={{ getValidToken, isAuthenticated, signUp, signIn, signOut }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

/**
 * Signs up a user with email & password (PKCE flow).
 */
async function signUp({ email, password }: Credentials) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	});

	if (error) throw error;
	return data;
}

/**
 * Signs in a user with email & password (PKCE flow).
 */
async function signIn({ email, password }: Credentials) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) throw error;
	return data;
}

/**
 * Logs out the user.
 */
async function signOut() {
	await supabase.auth.signOut();
}
