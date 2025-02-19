import { ApolloProvider } from '@apollo/client';
import { Auth0ProviderWithNavigate } from './auth/Auth0Provider';
import { LoginButton } from './components/LoginButton';
import { UserProfile } from './components/UserProfile';
// import { client } from './config/apollo-client';
import { LeverApp } from './components/LeverApp';
import { SidebarProvider } from "@/components/ui/sidebar";


// For Testing
import client from "./utils/TempapolloClient";

export const App = () => {
  return (
    // <Auth0ProviderWithNavigate>
    //   <ApolloProvider client={client}>
    //     <div className="min-h-screen bg-gray-100">
    //       <header className="bg-white shadow p-4">
    //         <div className="max-w-7xl mx-auto flex justify-between items-center">
    //           <h1 className="text-xl font-bold">My App</h1>
    //           <LoginButton />
    //         </div>
    //       </header>

    //       <main className="max-w-7xl mx-auto mt-8 p-4">
    //         <UserProfile />
    //       </main>
    //     </div>
    //   </ApolloProvider>
    // </Auth0ProviderWithNavigate>

    <ApolloProvider client={client}>
      <SidebarProvider defaultOpen={true}>
        <LeverApp />
      </SidebarProvider>
    </ApolloProvider>
  );
};

export default App;