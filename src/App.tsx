import { ApolloProvider } from '@apollo/client';
import { Auth0ProviderWithNavigate } from './auth/Auth0Provider';
import { LoginButton } from './components/LoginButton';
import { UserProfile } from './components/UserProfile';
// import { client } from './config/apollo-client';
import { LeverApp } from './components/LeverApp';
import { SidebarProvider } from "@/components/ui/sidebar";
import BusinessSetup from './components/onboarding/BusinessSetup';
import { useState, useEffect } from 'react';

// For Testing
import { useAuth } from './utils/AuthProvider';
import AuthModal from './components/AuthModal';

export const App = () => {
  const { isAuthenticated } = useAuth();
  const [showBusinessSetup, setShowBusinessSetup] = useState(false);
  const [isNewSignIn, setIsNewSignIn] = useState(false);

  // Effect to show BusinessSetup when newly signed in
  useEffect(() => {
    if (isAuthenticated && isNewSignIn) {
      setShowBusinessSetup(true);
      setIsNewSignIn(false); // Reset the flag after showing setup
    }
  }, [isAuthenticated, isNewSignIn]);

  if (!isAuthenticated) {
    return (
      <AuthModal onSignInSuccess={() => setIsNewSignIn(true)} />
    )
  }

  if (showBusinessSetup) {
    return (
      <BusinessSetup onClose={() => setShowBusinessSetup(false)} />
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <LeverApp setShowBusinessSetup={setShowBusinessSetup} />
    </SidebarProvider>
  );
};

export default App;