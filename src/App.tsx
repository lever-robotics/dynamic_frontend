import React from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./utils/apolloClient";
import { DataDisplay } from "./components/DataDisplay";
import NavBar from "./components/NavBar";
import styles from "./App.module.css";
import "./index.css";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";

function App() {
	return (
		<ApolloProvider client={client}>
			<SidebarProvider>
				<AppSidebar />
				{/* <SidebarTrigger /> */}
				<DataDisplay />
			</SidebarProvider>
		</ApolloProvider>
	);
}

export default App;
