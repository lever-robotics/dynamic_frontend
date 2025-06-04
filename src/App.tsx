import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import AuthModal from "./components/AuthModal";
// import { client } from './config/apollo-client';

import { LeverApp } from "./components/LeverApp";
import { ToastProvider } from "./components/ui/Toast/ToastProvider";
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
		console.log("Loading...");
		return <div>Loading...</div>;
	}

	return (
		<ToastProvider>
			<SidebarProvider defaultOpen={true}>
				<WorkspaceProvider>
					<LeverApp />
				</WorkspaceProvider>
			</SidebarProvider>
		</ToastProvider>
	);
};

export default App;
