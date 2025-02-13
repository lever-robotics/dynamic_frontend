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

const MASTER_SUPABASE_URL = "https://ugqelrsbgvwjlnzrzqab.supabase.co"
const MASTER_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncWVscnNiZ3Z3amxuenJ6cWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0Njk1MjIsImV4cCI6MjA1NTA0NTUyMn0.onkTRQl074KrSeQ8kmK3Kv3gUt-PAru-z1RrrK1tq5E"


export const masterSupabase = createClient(
    MASTER_SUPABASE_URL,
    MASTER_SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
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

    async signIn(email: string, password: string) {
        console.log('Starting sign in process...');
        try {
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                console.error('Sign in error:', authError);
                throw authError;
            }

            if (!authData.user) {
                console.error('No user data received');
                throw new Error('No user data received');
            }

            console.log('Successfully signed in user:', authData.user.id);

            // Query user_configurations table

            let { configData, error } = await this.supabase
                .from('user_configurations')
                .select('*');

            // .eq('id', authData.user.id)
            // .single();

            console.log('User configuration:', configData);

            if (error) {
                console.error('Error fetching user configuration:', error);
                throw error;
            }

            if (!error) {
                console.log('No configuration found for user');
                throw new Error('No configuration found for user');
            }

            // console.log('User configuration:', {
            //     supabaseUrl: configData.supabase_domain,
            //     apiKey: configData.api_key,
            //     schema: configData.schema
            // });

            return configData as any;
        } catch (e) {
            console.error('Caught error during sign in:', e);
            throw e;
        }
    }

    async signOut() {
        return this.supabase.auth.signOut()
    }
}

export default ApolloMaster.getInstance()