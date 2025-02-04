import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './utils/apolloClient';
import { SchemaExplorer } from './schema/displaySchema';
import { DataDisplay } from './components/DataDisplay';


function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>Dynamic Frontend</h1>
        {/* <SchemaExplorer /> */}
        <DataDisplay />
      </div>
    </ApolloProvider>
  );
}

export default App;