// src/components/DataDisplay.tsx
import React, { useState } from 'react';
import { MetadataSearch } from './MetadataSearch';

interface DataDisplayProps {
  onTableSelect: (tableName: string) => void;
  tableToDisplay: string | null;
}

export function DataDisplay({ onTableSelect, tableToDisplay }: DataDisplayProps) {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <div className='flex flex-col items-center w-full h-screen overflow-y-scroll overflow-x-hidden pb-16'>
      <MetadataSearch
        onSearchStart={() => setIsSearching(true)}
        onTableSelect={onTableSelect}
        tableToDisplay={tableToDisplay}
      />
    </div>
  );
}