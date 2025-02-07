// src/components/DataDisplay.tsx
import React, { useState } from 'react';
import { useSchemaQueries } from '../hooks/useSchemaQueries';
import DynamicSpreadsheets from './DynamicSpreadsheets';
import { MetadataSearch } from './MetadataSearch';

export function DataDisplay() {
  const { results, isLoading, errors } = useSchemaQueries();
  const [isSearching, setIsSearching] = useState(false);

  if (isLoading) return <div>Loading data...</div>;

  if (errors.length > 0) {
    return (
      <div>
        <h2>Errors:</h2>
        {errors.map(({ table, error }) => (
          <div key={table}>Error loading {table}: {error.message}</div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <MetadataSearch
        onSearchStart={() => setIsSearching(true)}
      />

      {!isSearching && (
        <>
          {/* <h1 className="text-3xl font-bold text-center my-4">Database Tables</h1> */}
          <DynamicSpreadsheets queryResults={results} />
        </>
      )}










      {/* Debug View */}
      <div>
        <h2>Raw Data (Debug View)</h2>
        {results.map(({ name, tableName, data }) => (
          <div key={tableName}>
            <h3>{name}</h3>
            <pre>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}