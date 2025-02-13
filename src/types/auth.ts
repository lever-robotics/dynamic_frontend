export interface UserConfig {
    id: string;
    supabase_domain: string;
    schema: any; // You might want to type this more specifically
    api_key: string;
}

export interface AuthState {
    loading: boolean;
    error: string | null;
    user: any | null;
}