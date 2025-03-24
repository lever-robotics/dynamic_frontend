import type React from 'react';
import { useEffect, useState } from 'react';
import { SidebarComp } from '../components/Sidebar';
import { SearchBar } from '../components/SearchBar';
import { DisplayData } from '../components/DisplayData';
import { useAuthApollo } from '../utils/ApolloProvider';
import { Blueprint } from '@/types/blueprint';
// import QueryBuilderTester from './tests/QueryBuilderTester';

// Define the search query type
export type SearchQueryType = 'object' | 'table' | 'ai' | 'recommend' | 'settings' | 'all' | 'graph';

// Define the search query structure
export interface SearchQuery {
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
        type: 'all',
        name: '',
        metadata: {
            objectID: "WyJwdWJsaWMiLCAiaW5kaXZpZHVhbCIsIDFd",
            objectType: "individual",
        },
    });

    // Add state for AI chat visibility
    const [showAIChat, setShowAIChat] = useState(false);

    // Function to update search query
    const updateSearchQuery = (query: SearchQuery) => {
        console.log('Updating search query:', query);
        setSearchQuery(query);
    };

    const { blueprint } = useAuthApollo();

    return (
        <div className="flex flex-row items-center w-screen h-screen overflow-hidden bg-portage-50">
            {/* Show the schema being loaded */}
            {blueprint === null && (
                <div className="flex flex-col items-center w-full h-full p-4">
                    <h2 className="text-xl font-bold">Loading schema...</h2>
                </div>
            )}

            {/* Sidebar */}
            <SidebarComp
                blueprint={blueprint}
                updateSearchQuery={updateSearchQuery}
                searchQuery={searchQuery}
            />

            {/* Middle Content Area */}
            <div className={`flex-1 flex flex-col items-center bg-white max-h-[calc(100%-20px)] min-h-[calc(100%-20px)] rounded-xl overflow-auto pb-16 shadow-lg my-2.5 transition-all duration-300 ${showAIChat ? 'mr-96' : ''}`}>
                {/* Search Bar */}
                <SearchBar
                    blueprint={blueprint}
                    updateSearchQuery={updateSearchQuery}
                />

                {/* Display Data */}
                <DisplayData
                    blueprint={blueprint}
                    searchQuery={searchQuery}
                    updateSearchQuery={updateSearchQuery}
                    onAIChatVisibilityChange={setShowAIChat}
                />

                {/* Display JSON */}
                {/* <div className="max-w-3xl w-full h-min overflow-y-hidden overflow-x-scroll no-scrollbar">
                    <pre className="p-4 text-sm text-gray-600">{JSON.stringify(searchQuery, null, 2)}</pre>
                </div> */}

                {/* For debugging queries */}
                {/* <QueryBuilderTester schema={jsonSchema} /> */}
            </div>
        </div>
    );
};

export default LeverApp;