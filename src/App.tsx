import { SidebarProvider } from "@/components/ui/sidebar";
import { observer } from "mobx-react-lite";
import AuthModal from "./components/AuthModal";
import LeverApp from "./components/LeverApp";
import { authStore } from "./utils/AuthProvider";

export const App = () => {
	if (!authStore.session) {
		return <AuthModal />;
	}

	return (
		<SidebarProvider defaultOpen={true}>
			<LeverApp />
		</SidebarProvider>
	);
};

export default observer(App);
