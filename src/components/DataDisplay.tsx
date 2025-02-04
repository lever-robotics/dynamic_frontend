// src/components/DataDisplay.tsx
import React from 'react';
// import { useSchemaIntrospection } from '../schema/fetchSchema';
// import { useTypeQuery } from '../hooks/useTypeQuery';
import { useSchemaQueries } from '../hooks/useSchemaQueries';

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
    <div>
      {results.map(({ name, tableName, data }) => (
        <div key={tableName}>
          <h2>{name}</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}