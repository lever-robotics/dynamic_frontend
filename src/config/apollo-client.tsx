import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

// Add error logging
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ),
        );
    if (networkError) console.log(`[Network error]: ${networkError}`);
});

const httpLink = createHttpLink({
    uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('auth0_token');
    console.log('Setting auth header with token:', token ? 'exists' : 'not found');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        }
    };
});

export const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'network-only',
        },
    },
});