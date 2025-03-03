import React, { useState, useCallback } from 'react';
import { SearchQuery, SearchQueryType } from './LeverApp';
import { QueryBuilder } from '../utils/QueryBuilder';
import { useQuery } from '@apollo/client';
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useRef } from 'react';

// Search Bar component props
interface SearchBarProps {
    schema: any;
    updateSearchQuery: (query: SearchQuery) => void;
}


function useMetadataSearch(searchTerm: string, schema: any) {
    const metadataQuery = QueryBuilder.buildMetadataSearchQuery();


    const isTermContainedInSearch = (term: string) => {
        const searchLower = searchTerm.toLowerCase().replace(/\s/g, '');
        const termLower = term.toLowerCase().replace(/\s/g, '');

        // Check if all characters in the search term are in the target term, 
        // maintaining their relative order
        let searchIndex = 0;
        for (let i = 0; i < termLower.length && searchIndex < searchLower.length; i++) {
            if (termLower[i] === searchLower[searchIndex]) {
                searchIndex++;
            }
        }

        return searchIndex === searchLower.length;
    };

    // Try to parse the search term as a number if possible
    const numberTerm = !isNaN(parseInt(searchTerm)) ? parseInt(searchTerm) : null;

    // Try to parse the search term as a date if it matches date format
    let dateTerm = null;
    if (searchTerm.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dateObj = new Date(searchTerm);
        if (!isNaN(dateObj.getTime())) {
            dateTerm = searchTerm;
        }
    }

    const { data, loading, error } = useQuery(metadataQuery, {
        variables: {
            searchTerm: `%${searchTerm}%`,
            numberTerm: numberTerm,
            dateTerm: dateTerm
        },
        skip: !searchTerm || searchTerm.trim() === '',
    });



    const formattedResults = React.useMemo(() => {
        if (!data && !searchTerm) return [];

        // Get schema object type matches
        const schemaMatches = schema.entities
            .filter(obj => obj.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(obj => ({
                displayName: obj.name,
                resultType: 'table',
                matchedField: 'table',
                matchedValue: obj.display_name,
                sourceTable: obj.display_name,
                nodeId: '',
                typeName: ''
            }));

        if (!data) return schemaMatches;



        const dbResults = Object.entries(data)
            .flatMap(([tableName, tableData]: [string, any]) => {
                const edges = tableData?.edges || [];
                return edges.flatMap(({ node }) => {
                    // First check if name fields match the search term
                    const nameMatches = [];
                    if (node.name && node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        nameMatches.push(['name', node.name]);
                    }
                    if (node.first_name && node.first_name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        nameMatches.push(['first_name', node.first_name]);
                    }
                    if (node.last_name && node.last_name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        nameMatches.push(['last_name', node.last_name]);
                    }

                    // Then check other fields
                    const otherMatches = Object.entries(node)
                        .filter(([key, value]) => {
                            if (key === 'name' || key === 'first_name' || key === 'last_name' ||
                                key === '__typename' || key === 'nodeId') return false;

                            const stringValue = String(value).toLowerCase();
                            const searchLower = searchTerm.toLowerCase();

                            if (typeof value === 'number') {
                                return numberTerm !== null && value === numberTerm;
                            } else if (value instanceof Date || stringValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                return dateTerm !== null && stringValue.includes(searchTerm);
                            } else {
                                return stringValue.includes(searchLower);
                            }
                        });

                    // Combine both name matches and other matches
                    const allMatches = [...nameMatches, ...otherMatches];

                    return allMatches.map(([field, value]) => ({
                        displayName: node.name || `${node.first_name} ${node.last_name}`,
                        matchedField: field,
                        resultType: 'object',
                        matchedValue: value,
                        sourceTable: tableName.replace('Collection', ''),
                        nodeId: node.nodeId,
                        typeName: node.__typename
                    }));
                });
            })
            .filter(Boolean);

        // Additional static results
        const additionalResults = [
            {
                displayName: 'Recommendations',
                resultType: 'recommend',
                matchedField: 'suggestions',
                matchedValue: searchTerm,
                sourceTable: 'recommend',
                nodeId: '',
                typeName: ''
            },
            {
                displayName: 'Settings',
                resultType: 'settings',
                matchedField: 'configuration',
                matchedValue: searchTerm,
                sourceTable: 'settings',
                nodeId: '',
                typeName: ''
            },
        ].filter(option =>
            isTermContainedInSearch(option.displayName)
        );

        // Combine schema matches and database results, with schema matches first
        const results = [...schemaMatches, ...dbResults, ...additionalResults];


        //take top 4 results
        const top_results = results.slice(0, 4);

        //Add AI result if search term exists
        if (searchTerm.trim()) {
            const aiResult = {
                displayName: `Ask AI about: "${searchTerm}"`,
                resultType: 'ai',
                matchedField: 'query',
                matchedValue: searchTerm,
                sourceTable: 'ai',
                nodeId: '',
                typeName: ''
            };
            top_results.push(aiResult);
        }

        return top_results;
    }, [data, searchTerm, numberTerm, dateTerm]);

    return {
        results: formattedResults,
        loading: loading && searchTerm.trim() !== '',
        error
    };
}

export const SearchBar: React.FC<SearchBarProps> = ({ schema, updateSearchQuery }) => {
    // State for search input and potential results
    const [searchInput, setSearchInput] = useState('');
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    const handleSearchBlur = (e: React.FocusEvent) => {
        // If clicking within search container or results, don't blur
        if (searchContainerRef.current?.contains(e.relatedTarget as Node)) {
            return;
        }
        setIsSearchFocused(false);
    };

    // Use metadata search hook
    const { results, loading } = useMetadataSearch(searchInput, schema);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
    };

    // Handle result selection
    const handleResultSelect = (result: any) => {
        // Find the corresponding object type from schema
        const objectType = schema.entities.find(
            (type: any) => type.display_name === result.sourceTable
        );

        updateSearchQuery({
            id: objectType ? objectType.id : 0,
            type: result.resultType,
            metadata: {
                objectType: result.sourceTable,
                objectID: result.nodeId,
                other: result.displayName,
                searchTerm: searchInput
            }
        });

        // Clear input after selection
        setSearchInput('');
    };

    return (
        <div className='my-32 z-10 w-96 flex flex-col'>
            <div className={`${isSearchFocused ? 'fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity duration-200' : 'opacity-0 pointer-events-none'}`} />
            <div className='absolute z-10'>
                <div className="w-96 transition-all focus-within:scale-105">
                    {/* Search Bar */}
                    <div
                        ref={searchContainerRef}
                        className='flex items-center px-3 pr-5 rounded-3xl shadow-md bg-anakiwa-50 focus-within:bg-white'
                    >
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 p-2 transition-all">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={handleInputChange}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                placeholder="Search any field or ask AI..."
                                className="w-full border-none bg-transparent placeholder:font-light font-base text-[14px] focus:outline-none text-portage-950"
                            />
                        </div>
                    </div>
                </div>

                {/* Floating Results Container */}
                {searchInput.trim() !== '' && (
                    <div
                        className={`mt-2 w-full bg-white rounded-xl ${isSearchFocused ? 'opacity-1' : 'opacity-0'}`}
                        tabIndex={-1}
                    >
                        {loading ? (
                            <div className="p-2 pl-5 w-full min-w-0 rounded-xl box-border">
                                Searching...
                            </div>
                        ) : (
                            <>
                                {results.map((result, index) => (
                                    <button
                                        key={`${result.sourceTable}-${index}`}
                                        onClick={() => handleResultSelect(result)}
                                        className={`flex flex-col p-2 pl-5 my-2 w-full min-w-0 rounded-xl box-border transition-all hover:bg-anakiwa-200 hover:shadow-sm`}
                                    >
                                        <div className="text-lg font-medium">
                                            {result.displayName}
                                        </div>
                                        {result.sourceTable !== 'ai' && (
                                            <div className="text-sm font-light">
                                                {result.matchedField}: {result.matchedValue}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;