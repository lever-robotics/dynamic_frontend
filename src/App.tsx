import { ApolloProvider } from '@apollo/client';
import { Auth0ProviderWithNavigate } from './auth/Auth0Provider';
import { LoginButton } from './components/LoginButton';
import { UserProfile } from './components/UserProfile';
// import { client } from './config/apollo-client';
import { LeverApp } from './components/LeverApp';
import { SidebarProvider } from "@/components/ui/sidebar";
import BusinessSetup from './components/onboarding/BusinessSetup';
import { useState } from 'react';

// For Testing
import { useAuth } from './utils/AuthProvider';
import { useAuthApollo } from './utils/ApolloProvider';
import AuthModal from './components/AuthModal';

export const App = () => {
  const { isAuthenticated } = useAuth();
  const { jsonSchema } = useAuthApollo();
  const [showBusinessSetup, setShowBusinessSetup] = useState(true);

  if (!isAuthenticated || !jsonSchema) {
    return (
      <AuthModal />
    )
  }

  if (showBusinessSetup) {
    return (
      <BusinessSetup onClose={() => setShowBusinessSetup(false)} />
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <LeverApp />
    </SidebarProvider>
  );
};

export default App;