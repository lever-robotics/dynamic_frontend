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
    <div className='flex flex-col items-center w-full mr-3 bg-white max-h-[calc(100%-20px)] min-h-[calc(100%-20px)] rounded-xl overflow-auto pb-16 shadow-lg'>
      <MetadataSearch
        onSearchStart={() => setIsSearching(true)}
        onTableSelect={onTableSelect}
        tableToDisplay={tableToDisplay}
      />
    </div>
  );
}