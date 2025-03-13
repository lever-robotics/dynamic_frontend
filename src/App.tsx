// import { client } from './config/apollo-client';
import { LeverApp } from './components/LeverApp';
import { SidebarProvider } from "@/components/ui/sidebar";


// For Testing
import { useAuth } from './utils/AuthProvider';
import { useAuthApollo } from './utils/ApolloProvider';
import AuthModal from './components/AuthModal';

export const App = () => {

  const { isAuthenticated } = useAuth();
  const { blueprint } = useAuthApollo();

  if (!isAuthenticated || !blueprint) {
    return (
      <AuthModal />
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <LeverApp />
    </SidebarProvider>

  );
};

export default App;