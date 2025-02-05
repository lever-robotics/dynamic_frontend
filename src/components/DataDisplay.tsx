// src/components/DataDisplay.tsx
import React from 'react';
import { useSchemaQueries } from '../hooks/useSchemaQueries';
import DynamicSpreadsheets from './DynamicSpreadsheets';
import { Search } from './Search';
import { MetadataSearch } from './MetadataSearch';

export function DataDisplay() {
  const { results, isLoading, errors } = useSchemaQueries();

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
    <div className="p-4">
      <MetadataSearch />
      {/* <Search /> */}
      <h1 className="text-3xl font-bold text-center my-4">Database Tables</h1>
      {/* <DynamicSpreadsheets queryResults={results} /> */}

      {/* Optionally keep the JSON view for debugging */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Raw Data (Debug View)</h2>
        {results.map(({ name, tableName, data }) => (
          <div key={tableName} className="mb-4">
            <h3 className="font-bold">{name}</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}