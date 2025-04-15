// import { client } from './config/apollo-client';
import { LeverApp } from './components/LeverApp';
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from 'react';
import { useAuth } from './utils/AuthProvider';
import AuthModal from './components/AuthModal';
import { useUserConfig } from './utils/UserConfigProvider';

export const App = () => {
  const { isAuthenticated } = useAuth();
  const { userConfig, isLoading } = useUserConfig();

  // Log user data for debugging
  useEffect(() => {
    if (userConfig) {
      console.log('User Config:', {
        completed_onboarding: userConfig.completed_onboarding,
        business_overview: userConfig.business_overview
      });
      
      console.log('Data Connectors:', userConfig.data_connectors.map(connector => ({
        id: connector.id,
        type: connector.connection_type,
        entities: connector.meta.entities.map(entity => ({
          name: entity.name,
          fields: entity.fields.map(f => f.name)
        }))
      })));

      console.log('Raw User Config:', userConfig);
    }
  }, [userConfig]);

  if (!isAuthenticated) {
    return (
      <AuthModal />
    )
  }

  //If use config is not complete then return loading
  if (!userConfig) {
    return (
      <div>Loading...</div>
    )
  }

  return (
      <SidebarProvider defaultOpen={true}>
        <LeverApp />
      </SidebarProvider>
  );
};

export default App;