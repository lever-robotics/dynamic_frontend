import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './utils/apolloClient';
import { DataDisplay } from './components/DataDisplay';


function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>Dynamic Frontend</h1>
        <DataDisplay />
      </div>
    </ApolloProvider>
  );
}

export default App;