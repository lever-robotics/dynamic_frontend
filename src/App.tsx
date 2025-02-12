import React, { useState } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./utils/apolloClient";
import { DataDisplay } from "./components/DataDisplay";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import OdooLoginForm from "./components/ui/loginOdoo";

interface OdooCredentials {
  odooUrl: string;
  database: string;
  username: string;
  apiKey: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState<OdooCredentials | null>(null);
  const [tableToDisplay, setTableToDisplay] = useState<string | null>(null);

  const handleConnect = (creds: OdooCredentials) => {
    // Here you would typically validate the connection
    // and store the credentials securely
    setCredentials(creds);
    setIsAuthenticated(true);
  };

  const handleTableSelect = (tableName: string) => {
    if (tableName === 'settings') {
      console.log('Settings clicked');
      return;
    }
    setTableToDisplay(tableName);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-portage-50 flex items-center justify-center">
        <OdooLoginForm onSubmit={handleConnect} />
      </div>
    );
  }

  return (
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
  );
}

export default App;