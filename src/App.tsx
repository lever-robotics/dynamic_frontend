import React, { useState, useEffect } from "react";
// import { ApolloProvider } from "@apollo/client";
import { createClient } from '@supabase/supabase-js';
// import client from "./utils/apolloClient";
// import { DataDisplay } from "./components/DataDisplay";
// import { AppSidebar } from "./components/app-sidebar";
import "./index.css";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import AuthModal from "./components/Auth/AuthModal";
// import apolloMaster, { masterSupabase } from "./utils/apolloMaster";
import { UserConfig } from "./types/auth";
import { querySupabase } from './utils/supabaseClient';

function App() {
  const [tableToDisplay, setTableToDisplay] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Just show auth modal immediately
    setShowAuthModal(true);
  }, []);

  const handleTableSelect = (tableName: string) => {
    if (tableName === 'settings') {
      console.log('Settings clicked');
      return;
    }
    setTableToDisplay(tableName);
  };

  const testMasterSupabase = async () => {
    try {
      const data = await querySupabase('tesing');
      console.log('Query result:', data);
    } catch (e) {
      console.error('Test error:', e);
    }

  };

  // Add a button to trigger the test
  useEffect(() => {
    setShowAuthModal(true);
    // Run test on mount
    // testMasterSupabase();
  }, []);

  return (
    <>

      <button
        onClick={testMasterSupabase}
        className="fixed top-4 right-4 z-[100] bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Supabase
      </button>

      {/* <AuthModal isOpen={showAuthModal} onSuccess={(config) => {
        setUserConfig(config);
        setShowAuthModal(false);
      }} /> */}
      {/*       
      <AuthModal isOpen={showAuthModal} onSuccess={(config) => {
        setUserConfig(config);
        setShowAuthModal(false);
      }} />
      <div className={showAuthModal ? 'pointer-events-none opacity-50' : ''}>
        <ApolloProvider client={client}>
          <SidebarProvider defaultIsOpen={true}>
            <div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
              <AppSidebar onTableSelect={handleTableSelect} />
              <DataDisplay
                onTableSelect={handleTableSelect}
                tableToDisplay={tableToDisplay}
              />
            </div>
          </SidebarProvider>
        </ApolloProvider>
      </div> */}
    </>
  );
}

export default App;