import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './SupabaseClient';
import { useAuth } from './AuthProvider';

interface DataConnector {
    id: string;
    connection_type: string;
    meta: {
        version: string;
        entities: Array<{
            name: string;
            fields: Array<{
                name: string;
                type: string;
                description: string;
                displayName: string;
            }>;
            description: string;
            displayName: string;
        }>;
    };
}

interface UserConfig {
    completed_onboarding: boolean;
    business_overview: string;
    data_connectors: DataConnector[];
}

interface UserConfigContextType {
    userConfig: UserConfig | null;
    isLoading: boolean;
    error: string | null;
    fetchUserConfig: () => Promise<void>;
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined);

export const UserConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { userId } = useAuth();

    const fetchUserConfig = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Fetch user config
            const { data: configData, error: configError } = await supabase
                .from('user_configs')
                .select('completed_onboarding, business_overview')
                .eq('user_id', userId)
                .single();

            if (configError) {
                throw new Error(configError.message);
            }

            // Fetch data connectors
            const { data: connectorsData, error: connectorsError } = await supabase
                .from('data_connectors')
                .select('id, connection_type, meta')
                .eq('user_id', userId);

            if (connectorsError) {
                throw new Error(connectorsError.message);
            }

            setUserConfig({
                completed_onboarding: configData.completed_onboarding,
                business_overview: configData.business_overview,
                data_connectors: connectorsData || []
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user config');
            console.error('Error fetching user config:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Fetch user config when userId changes
    useEffect(() => {
        if (userId) {
            fetchUserConfig();
        }
    }, [userId, fetchUserConfig]);

    return (
        <UserConfigContext.Provider value={{ userConfig, isLoading, error, fetchUserConfig }}>
            {children}
        </UserConfigContext.Provider>
    );
};

export const useUserConfig = () => {
    const context = useContext(UserConfigContext);
    if (!context) {
        throw new Error('useUserConfig must be used within a UserConfigProvider');
    }
    return context;
}; 