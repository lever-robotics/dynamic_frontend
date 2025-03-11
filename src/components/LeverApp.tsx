import React, { useState } from 'react';
import { SidebarComp } from '../components/Sidebar';
import { SearchBar } from '../components/SearchBar';
import { DisplayData } from '../components/DisplayData';
import { useAuthApollo } from '../utils/ApolloProvider';
import { AIChatSidebar } from '../components/AIChatSidebar';
import QueryBuilderTester from './tests/QueryBuilderTester';

// Define the search query type
export type SearchQueryType = 'object' | 'table' | 'ai' | 'recommend' | 'settings' | 'all';

// Define the search query structure
export interface SearchQuery {
    id: number;
    name: string;
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
        name: '',
        metadata: {
            objectID: "WyJwdWJsaWMiLCAiaW5kaXZpZHVhbCIsIDFd",
            objectType: "individual",
        },
    });

    // Function to update search query
    const updateSearchQuery = (query: SearchQuery) => {
        console.log('Updating search query:', query);
        setSearchQuery(query);
    };

    const { jsonSchema } = useAuthApollo();

    if (jsonSchema === null) {
        return (
            <div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
                <div className="flex flex-col items-center w-full h-full p-4">
                    <h2 className="text-xl font-bold">Loading schema...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row items-start w-screen h-screen overflow-hidden bg-portage-50">
            {/* Left Sidebar */}
            <SidebarComp
                schema={jsonSchema}
                updateSearchQuery={updateSearchQuery}
                searchQuery={searchQuery}
            />

            {/* Middle Content Area */}
            <div className='flex-1 flex flex-col items-center bg-white max-h-[calc(100%-20px)] min-h-[calc(100%-20px)] rounded-xl overflow-auto pb-16 shadow-lg my-2.5'>
                {/* Search Bar */}
                <SearchBar
                    schema={jsonSchema}
                    updateSearchQuery={updateSearchQuery}
                />

                {/* Display Data */}
                <DisplayData
                    schema={jsonSchema}
                    searchQuery={searchQuery}
                    updateSearchQuery={updateSearchQuery}
                />

                {/* Display JSON */}
                {/* <div className="max-w-3xl w-full h-min overflow-y-hidden overflow-x-scroll no-scrollbar">
                    <pre className="p-4 text-sm text-gray-600">{JSON.stringify(searchQuery, null, 2)}</pre>
                </div> */}

                {/* For debugging queries */}
                {/* <QueryBuilderTester schema={jsonSchema} /> */}

            </div>

            {/* Right Chat Panel */}
            <div className="w-96 h-screen border-l border-gray-200 bg-white">
                <AIChatSidebar searchQuery={searchQuery} />
            </div>
        </div>
    );
};

export default LeverApp;