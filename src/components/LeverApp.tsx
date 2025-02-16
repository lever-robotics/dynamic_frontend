import React, { useState } from 'react';
import { SchmeaJson } from '../config/SchemaLoader';
import { Sidebar } from '../components/Sidebar';
import { SearchBar } from '../components/SearchBar';
import { DisplayData } from '../components/DisplayData';

// Define the search query type
export type SearchQueryType = 'object' | 'table' | 'ai' | 'recommend' | 'settings' | 'all';

// Define the search query structure
export interface SearchQuery {
    id: number;
    type: SearchQueryType;
    data: string;
}

// LeverApp component with search query management
export const LeverApp: React.FC = () => {
    // State for search query
    const [searchQuery, setSearchQuery] = useState<SearchQuery | null>(null);

    // State for schema
    const [schema] = useState(SchmeaJson);

    // Function to update search query
    const updateSearchQuery = (query: SearchQuery) => {
        setSearchQuery(query);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar
                schema={schema}
                updateSearchQuery={updateSearchQuery}
            />

            <div className="flex-1 flex flex-col">
                {/* Search Bar */}
                <SearchBar
                    schema={schema}
                    updateSearchQuery={updateSearchQuery}
                />

                {/* Display Data */}
                <DisplayData
                    schema={schema}
                    searchQuery={searchQuery}
                    updateSearchQuery={updateSearchQuery}
                />
            </div>
        </div>
    );
};

export default LeverApp;