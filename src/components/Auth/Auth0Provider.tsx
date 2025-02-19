import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ReactNode } from 'react';

type Props = { children: ReactNode }
export const Auth0ProviderWithNavigate = ({ children }: Props) => {
    return (
        <Auth0Provider
            domain="dev-8wniutd0lyrffhmt.us.auth0.com"
            clientId="YeKALfMUxCwS9zKKfZcbVo5apsGK5wl2"
            authorizationParams={{ redirect_uri: window.location.origin, audience: "http://localhost:4000/graphql" }}
        >
            {children}
        </Auth0Provider>
    );
};

export const LoginButton = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();

    if (isAuthenticated) return null;
    return <button onClick={() => loginWithRedirect()}>Log In</button>;
};

export const LogoutButton = () => {
    const { logout } = useAuth0();

    return (
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Log Out
        </button>
    );
};