import React from 'react';
import { ApolloProvider } from '@apollo/client';
import client from './utils/apolloClient';
import { DataDisplay } from './components/DataDisplay';
import NavBar from './components/NavBar';
import styles from "./App.module.css";


function App() {
  return (
    <div className={styles.App}>
      <ApolloProvider client={client}>
        <NavBar />
        <div>
          {/* <h1>Dynamic Frontend</h1> */}
          <DataDisplay />
        </div>
      </ApolloProvider>
    </div>
  );
}

export default App;