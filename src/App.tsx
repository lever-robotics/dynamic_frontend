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
      <SidebarProvider defaultIsOpen={true}   >
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