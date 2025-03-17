import { gql, useQuery } from '@apollo/client';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';


const GET_USER_CONFIGS = gql`
  query GetUserConfigs($email: String!) {
    getUserConfigurations(email: $email) {
      id
      configuration
      created_at
    }
  }
`;

export const UserProfile = () => {
    const { user, isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();

    // Add this effect to save the token
    useEffect(() => {
        const getToken = async () => {
            if (isAuthenticated) {
                try {
                    const token = await getAccessTokenSilently();
                    console.log('Got new token from Auth0');
                    localStorage.setItem('auth0_token', token);
                } catch (error) {
                    console.error('Error getting token:', error);
                }
            }
        };
        getToken();
    }, [isAuthenticated, getAccessTokenSilently]);

    const { loading, error, data } = useQuery(GET_USER_CONFIGS, {
        variables: { email: user?.email },
        skip: !isAuthenticated || !user?.email,
        onError: (error) => {
            console.error('GraphQL Error:', {
                message: error.message,
                networkError: error.networkError,
                graphQLErrors: error.graphQLErrors
            });
        },
        context: {
            headers: {
                authorization: `Bearer ${localStorage.getItem('auth0_token')}`
            }
        }
    });

    if (authLoading || loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!isAuthenticated) return <div>Please log in</div>;

    const configurations = data?.getUserConfigurations;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            <div className="space-y-2">
                <div>Email: {user?.email}</div>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-4">Configurations</h3>
            <div className="space-y-4">
                {configurations?.map(config => (
                    <div key={config.id} className="p-4 bg-white rounded shadow">
                        <pre className="whitespace-pre-wrap">
                            {JSON.stringify(JSON.parse(config.configuration), null, 2)}
                        </pre>
                        <div className="text-sm text-gray-500 mt-2">
                            Created: {new Date(config.created_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};