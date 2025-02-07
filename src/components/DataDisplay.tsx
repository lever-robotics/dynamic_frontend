// src/components/DataDisplay.tsx
import React, { useState } from 'react';
import { useSchemaQueries } from '../hooks/useSchemaQueries';
import DynamicSpreadsheets from './DynamicSpreadsheets';
import { MetadataSearch } from './MetadataSearch';

interface DataDisplayProps {
  onTableSelect: (tableName: string) => void;
  tableToDisplay: string | null;
}

export function DataDisplay({ onTableSelect, tableToDisplay }: DataDisplayProps) {
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
    <div className='flex justify-center w-full h-screen'>
      <MetadataSearch
        onSearchStart={() => setIsSearching(true)}
        onTableSelect={onTableSelect}
        tableToDisplay={tableToDisplay}
      />

      {!isSearching && !tableToDisplay && (
          <DynamicSpreadsheets queryResults={results} />
      )}
    </div>
  );
}