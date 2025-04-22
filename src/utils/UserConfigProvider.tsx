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
    updateConnectionMeta: (connectionId: string, meta: DataConnector['meta']) => Promise<void>;
    createConnection: (connectionType: string, keys: Record<string, string>) => Promise<void>;
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

    const updateConnectionMeta = useCallback(async (connectionId: string, meta: DataConnector['meta']) => {
        if (!userId) return;

        try {
            const { error: updateError } = await supabase
                .from('data_connectors')
                .update({ meta })
                .eq('id', connectionId)
                .eq('user_id', userId);

            if (updateError) {
                throw new Error(updateError.message);
            }

            // Refresh the user config to get the updated data
            await fetchUserConfig();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update connection metadata');
            console.error('Error updating connection metadata:', err);
        }
    }, [userId, fetchUserConfig]);

    const createConnection = useCallback(async (connectionType: string, keys: Record<string, string>) => {
        if (!userId) return;

        try {
            const { error: createError } = await supabase
                .from('data_connectors')
                .insert([
                    {
                        user_id: userId,
                        connection_type: connectionType,
                        meta: {
                            version: '1.0',
                            entities: []
                        },
                        keys: keys
                    }
                ]);

            if (createError) {
                throw new Error(createError.message);
            }

            // Refresh the user config to get the new connection
            await fetchUserConfig();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create connection');
            console.error('Error creating connection:', err);
        }
    }, [userId, fetchUserConfig]);

    // Fetch user config when userId changes
    useEffect(() => {
        if (userId) {
            fetchUserConfig();
        }
    }, [userId, fetchUserConfig]);

    return (
        <UserConfigContext.Provider value={{ 
            userConfig, 
            isLoading, 
            error, 
            fetchUserConfig,
            updateConnectionMeta,
            createConnection
        }}>
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