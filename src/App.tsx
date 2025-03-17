// import { client } from './config/apollo-client';
import { LeverApp } from './components/LeverApp';
import { SidebarProvider } from "@/components/ui/sidebar";
import BusinessSetup from './components/onboarding/BusinessSetup';
import { useState } from 'react';

// For Testing
import { useAuth } from './utils/AuthProvider';
import AuthModal from './components/AuthModal';

export const App = () => {
  const { isAuthenticated } = useAuth();
  const [showBusinessSetup, setShowBusinessSetup] = useState(true);

  if (!isAuthenticated) {
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