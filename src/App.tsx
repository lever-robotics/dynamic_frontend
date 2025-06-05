import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import AuthModal from "./components/AuthModal";
// import { client } from './config/apollo-client';

import { LeverApp } from "./components/LeverApp";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { useAuth } from "./utils/AuthProvider";
import { useUserConfig } from "./utils/UserConfigProvider";

export const App = () => {
	const { isAuthenticated } = useAuth();
	const { userConfig } = useUserConfig();

	if (!isAuthenticated) {
		return <AuthModal />;
	}

	//If use config is not complete then return loading
	if (!userConfig) {
		return <div>Loading...</div>;
	}

	return (
		<SidebarProvider defaultOpen={true}>
			<WorkspaceProvider>
				<LeverApp />
			</WorkspaceProvider>
		</SidebarProvider>
	);
};

export default App;
