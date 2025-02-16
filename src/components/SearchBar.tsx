import React, { useState, useCallback } from 'react';
import { SearchQuery, SearchQueryType } from './LeverApp';

// Search Bar component props
interface SearchBarProps {
    schema: any;
    updateSearchQuery: (query: SearchQuery) => void;
}

// Interface for potential search results
interface PotentialSearchResult {
    id: number;
    type: SearchQueryType;
    data: string;
    title: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ schema, updateSearchQuery }) => {
    // State for search input and potential results
    const [searchInput, setSearchInput] = useState('');
    const [potentialResults, setPotentialResults] = useState<PotentialSearchResult[]>([]);

    // Function to find potential search results
    const findPotentialResults = useCallback((searchTerm: string) => {
        // This is a mock implementation that returns fake results
        const mockResults: PotentialSearchResult[] = [
            // Object type results
            ...schema.object_types.slice(0, 3).map((type: any) => ({
                id: type.id,
                type: 'object' as SearchQueryType,
                data: type.table_name,
                title: `${type.name} Search`
            })),

            // Table results
            {
                id: 101,
                type: 'table' as SearchQueryType,
                data: 'all_tables',
                title: 'All Tables Search'
            },

            // AI result
            {
                id: 1,
                type: 'ai' as SearchQueryType,
                data: 'ai_search',
                title: 'AI Powered Search'
            }
        ];

        // Filter and limit results (top 5)
        const filteredResults = mockResults
            .filter(result =>
                result.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 5);

        setPotentialResults(filteredResults);
    }, [schema]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);

        // Trigger search for potential results if input is not empty
        if (value.trim()) {
            findPotentialResults(value);
        } else {
            setPotentialResults([]);
        }
    };

    // Handle result selection
    const handleResultSelect = (result: PotentialSearchResult) => {
        updateSearchQuery({
            id: result.id,
            data: result.data,
            type: result.type
        });

        // Clear input and results after selection
        setSearchInput('');
        setPotentialResults([]);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
            />

            {potentialResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded mt-1 shadow-lg">
                    {potentialResults.map((result) => (
                        <button
                            key={result.id}
                            className="w-full p-2 text-left hover:bg-gray-100"
                            onClick={() => handleResultSelect(result)}
                        >
                            {result.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;