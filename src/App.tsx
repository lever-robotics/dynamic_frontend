import { ApolloProvider } from '@apollo/client';
import { Auth0ProviderWithNavigate } from './auth/Auth0Provider';
import { LoginButton } from './components/LoginButton';
import { UserProfile } from './components/UserProfile';
// import { client } from './config/apollo-client';
import { LeverApp } from './components/LeverApp';
import { SidebarProvider } from "@/components/ui/sidebar";



// For Testing
import client from "./utils/TempapolloClient";
import { useAuth } from './utils/AuthProvider';
import { useAuthApollo } from './utils/ApolloProvider';
import AuthModal from './components/AuthModal';

export const App = () => {

  const { isAuthenticated } = useAuth();
  // const { jsonSchema } = useAuthApollo();

  if(!isAuthenticated) {
    return (
      <AuthModal/>
    )
  }

  return (
      <SidebarProvider defaultOpen={true}>
        <LeverApp />
      </SidebarProvider>
  );
};

export default App;