// import { client } from './config/apollo-client';
import { LeverApp } from './components/LeverApp';
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from 'react';
import { useAuth } from './utils/AuthProvider';
import AuthModal from './components/AuthModal';

export const App = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <AuthModal />
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <LeverApp />
    </SidebarProvider>
  );
};

export default App;