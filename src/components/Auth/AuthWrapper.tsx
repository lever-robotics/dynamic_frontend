import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import apolloMaster from '../../utils/apolloMaster'
import AuthScreen from './AuthScreen'

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

interface AuthWrapperProps {
    children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const [userConfig, setUserConfig] = useState<UserConfig | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const subscription = apolloMaster.getAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN') {
                    try {
                        const config = await apolloMaster.getUserConfig()
                        setUserConfig(config)
                    } catch (error) {
                        console.error('Error fetching user config:', error)
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUserConfig(null)
                }
                setLoading(false)
            }
        )

        return () => {
            subscription.data.subscription.unsubscribe()
        }
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    if (!userConfig) {
        return <AuthScreen />
    }

    return <>{children}</>
}

export default AuthWrapper