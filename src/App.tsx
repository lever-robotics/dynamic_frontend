import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import AuthModal from "./components/AuthModal";
// import { client } from './config/apollo-client';

import { LeverApp } from "./components/LeverApp";
import { useAuth } from "./utils/AuthProvider";
import { UserConfigProvider, useUserConfig } from "./utils/UserConfigProvider";

export const App = () => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <AuthModal />;
	}

	//If use config is not complete then return loading
	// if (!userConfig) {
	// 	return <div>Loading...</div>;
	// }

	return (
		<UserConfigProvider>
			<SidebarProvider defaultOpen={true}>
				<LeverApp />
			</SidebarProvider>
		</UserConfigProvider>
	);
};

export default App;
