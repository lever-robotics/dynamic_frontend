import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

export const Auth0ProviderWithNavigate = ({ children }: Auth0ProviderWithNavigateProps) => {
  return (
    <Auth0Provider
      domain="dev-s6nzy156lszdz84l.us.auth0.com"
      clientId="4HG31VL05FH8OvkRvKeepktRC21LrTAu"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://dev-s6nzy156lszdz84l.us.auth0.com/api/v2/",
        scope: "openid profile email"
      }
      }
    >
      {children}
    </Auth0Provider>
  );
};  