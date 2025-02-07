// src/App.tsx
import React, { useState } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./utils/apolloClient";
import { DataDisplay } from "./components/DataDisplay";
import { AppSidebar } from "./components/app-sidebar";
import "./index.css";
import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
  const [tableToDisplay, setTableToDisplay] = useState<string | null>(null);

  const handleTableSelect = (tableName: string) => {
    if (tableName === 'settings') {
      console.log('Settings clicked');
      return;
    }
    setTableToDisplay(tableName);
  };

  return (
    <ApolloProvider client={client}>
      <SidebarProvider defaultIsOpen={true}>
        <div className="flex h-screen overflow-hidden">
          <AppSidebar onTableSelect={handleTableSelect} />
          <main className="flex-1 overflow-auto p-6">
            <DataDisplay
              onTableSelect={handleTableSelect}
              tableToDisplay={tableToDisplay}
            />
          </main>
        </div>
      </SidebarProvider>
    </ApolloProvider>
  );
}

export default App;