import React, { useState } from 'react';
import { SchemaJson } from '../config/SchemaLoader';
import { SidebarComp } from '../components/Sidebar';
import { SearchBar } from '../components/SearchBar';
import { DisplayData } from '../components/DisplayData';

// Define the search query type
export type SearchQueryType = 'object' | 'table' | 'ai' | 'recommend' | 'settings' | 'all';

// Define the search query structure
export interface SearchQuery {
    id: number;
    type: SearchQueryType;
    metadata?: {
        objectID?: string; //Their node ID defined by graphQL
        objectType?: string; //Their objectType which is table_name for now.
        searchTerm?: string; //Their search term, used for AI.
        other?: string;
    };
}

// LeverApp component with search query management
export const LeverApp: React.FC = () => {
    // State for search query
    const [searchQuery, setSearchQuery] = useState<SearchQuery>({
        id: 0,
        type: 'all',
        metadata: {
            objectID: "WyJwdWJsaWMiLCAiaW5kaXZpZHVhbCIsIDFd",
            objectType: "individual",
        },
    });

    // State for schema
    const [schema] = useState(SchemaJson);

    // Function to update search query
    const updateSearchQuery = (query: SearchQuery) => {
        setSearchQuery(query);
    };

    return (
        <div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
            {/* Sidebar */}
            <SidebarComp
                schema={schema}
                updateSearchQuery={updateSearchQuery}
            />

            <div className="flex-1 flex flex-col h-full">
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