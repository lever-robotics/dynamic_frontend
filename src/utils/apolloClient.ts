import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  // uri: 'http://localhost:4000/graphql', // Replace with your GraphQL API
  uri: 'https://fvejsqognqttdkgurlla.supabase.co/graphql/v1',
  headers: {
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZWpzcW9nbnF0dGRrZ3VybGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2MDg3NzgsImV4cCI6MjA1MzE4NDc3OH0.qvmbMe82lfk2gEZNRRp7BCoYywLwD9IHPdcE84CfvyM',
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
