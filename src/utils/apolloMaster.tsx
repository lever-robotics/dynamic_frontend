import { createClient, SupabaseClient } from '@supabase/supabase-js'

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
const MASTER_SUPABASE_URL = process.env.REACT_APP_MASTER_SUPABASE_URL!
const MASTER_SUPABASE_ANON_KEY = process.env.REACT_APP_MASTER_SUPABASE_ANON_KEY!

if (!MASTER_SUPABASE_URL || !MASTER_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables')
}

export const masterSupabase = createClient(
    MASTER_SUPABASE_URL,
    MASTER_SUPABASE_ANON_KEY
)



export class ApolloMaster {
    private static instance: ApolloMaster
    private supabase: SupabaseClient

    private constructor() {
        this.supabase = masterSupabase
    }

    public static getInstance(): ApolloMaster {
        if (!ApolloMaster.instance) {
            ApolloMaster.instance = new ApolloMaster()
        }
        return ApolloMaster.instance
    }

    async signUp(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    async signIn(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut()
        if (error) throw error
    }

    async getUserConfig(): Promise<UserConfig> {
        const { data: { session } } = await this.supabase.auth.getSession()

        if (!session) throw new Error('No active session')

        const { data, error } = await this.supabase
            .from('user_configurations')
            .select('*')
            .single()

        if (error) throw error
        return data as UserConfig
    }

    getAuthStateChange(callback: (event: string, session: any) => void) {
        return this.supabase.auth.onAuthStateChange(callback)
    }
}

export default ApolloMaster.getInstance()