// src/utils/supabaseClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { RestLink } from 'apollo-link-rest';

const restLink = new RestLink({
    uri: 'https://ugqelrsbgvwjlnzrzqab.supabase.co/rest/v1/',
    headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncWVscnNiZ3Z3amxuenJ6cWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0Njk1MjIsImV4cCI6MjA1NTA0NTUyMn0.onkTRQl074KrSeQ8kmK3Kv3gUt-PAru-z1RrrK1tq5E',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncWVscnNiZ3Z3amxuenJ6cWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0Njk1MjIsImV4cCI6MjA1NTA0NTUyMn0.onkTRQl074KrSeQ8kmK3Kv3gUt-PAru-z1RrrK1tq5E`,
        'Content-Type': 'application/json'
    },
    endpoints: {
        tesing: 'tesing',
        user_configurations: 'user_configurations'
    }
});

const client = new ApolloClient({
    link: restLink,
    cache: new InMemoryCache(),
});

// Helper function to make REST calls
export const querySupabase = async (table: string) => {
    try {
        const response = await fetch(
            `https://ugqelrsbgvwjlnzrzqab.supabase.co/rest/v1/${table}`,
            {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncWVscnNiZ3Z3amxuenJ6cWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0Njk1MjIsImV4cCI6MjA1NTA0NTUyMn0.onkTRQl074KrSeQ8kmK3Kv3gUt-PAru-z1RrrK1tq5E',
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncWVscnNiZ3Z3amxuenJ6cWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0Njk1MjIsImV4cCI6MjA1NTA0NTUyMn0.onkTRQl074KrSeQ8kmK3Kv3gUt-PAru-z1RrrK1tq5E`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return await response.json();
    } catch (e) {
        console.error('Query error:', e);
        throw e;
    }
};

export default client;