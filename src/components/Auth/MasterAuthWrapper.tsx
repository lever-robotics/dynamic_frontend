import React, { useEffect, useState } from 'react'
import apolloMaster from '../../utils/apolloMaster'
import AuthScreen from './AuthScreen'
import { UserConfig } from '../../types/auth'

interface MasterAuthWrapperProps {
    children: React.ReactNode;
}

export const MasterAuthWrapper: React.FC<MasterAuthWrapperProps> = ({ children }) => {
    const [userConfig, setUserConfig] = useState<UserConfig | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const subscription = apolloMaster.getAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN') {
                    try {
                        const config = await apolloMaster.getUserConfig()
                        setUserConfig(config)
                        // Debug logging
                        console.log('User Config:', {
                            supabaseUrl: config.supabase_domain,
                            apiKey: config.api_key,
                            schema: config.schema
                        })
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
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    if (!userConfig) {
        return <AuthScreen />
    }

    return <>{children}</>
}

export default MasterAuthWrapper