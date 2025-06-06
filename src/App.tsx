import { SidebarProvider } from "@/components/ui/sidebar";
import AuthModal from "./components/AuthModal";
import LeverApp from "./components/LeverApp";
import { useAuth } from "./utils/AuthProvider";

export const App = () => {
	const { session } = useAuth();
	if (!session) {
		return <AuthModal />;
	}

	return (
		<SidebarProvider defaultOpen={true}>
			<LeverApp />
		</SidebarProvider>
	);
};

export default App;
