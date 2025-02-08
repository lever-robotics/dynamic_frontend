// src/components/MetadataSearch.tsx
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useMetadataSearch } from '../hooks/useMetadataSearch';
import { NodeConnections } from './NodeConnections';
import { ObjectList } from './ObjectList';
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import styles from "./SearchBar.module.css";
import { AIDisplay } from './AIDisplay';
import DynamicSpreadsheets from './DynamicSpreadsheets';
import { useSchemaQueries } from '../hooks/useSchemaQueries';



interface MetadataSearchProps {
    onSearchStart?: () => void;
    onTableSelect: (tableName: string) => void;
    tableToDisplay: string | null;
}

export function MetadataSearch({
    onSearchStart,
    onTableSelect,
    tableToDisplay
}: MetadataSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedTypeName, setSelectedTypeName] = useState<string | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [isAIMode, setIsAIMode] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const { results: schemaResults, isLoading, errors } = useSchemaQueries();

    const { results, loading, error } = useMetadataSearch(searchTerm);
    const limitedResults = results.slice(0, 4);

    // Reset selected index when search term changes
    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchTerm]);

    // Clear other displays when table is selected from sidebar
    useEffect(() => {
        if (tableToDisplay) {
            setSelectedNodeId(null);
            setSelectedTypeName(null);
            setIsAIMode(false);
            setSearchTerm('');
            setIsSearchFocused(false);
        }
    }, [tableToDisplay]);

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

    const handleResultSelect = (result: any) => {
        if (result.typeName === '') {
            // This is a schema object type result
            setSelectedNodeId(null);
            setSelectedTypeName(null);
            onTableSelect(result.sourceTable);
        } else {
            // This is a regular search result
            onTableSelect('');
            setSelectedNodeId(result.nodeId);
            setSelectedTypeName(result.typeName);
        }
        setSearchTerm('');
        setIsAIMode(false);
        setAiQuery('');
        setIsSearchFocused(false);
        onSearchStart?.();
    };

    const handleAISelect = () => {

        setIsAIMode(true);
        setAiQuery(searchTerm);
        setSearchTerm('');
        setIsSearchFocused(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const totalOptions = limitedResults.length + (searchTerm.trim() !== '' ? 1 : 0);
        console.log(totalOptions)
        if (totalOptions === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < totalOptions - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    if (selectedIndex < limitedResults.length) {
                        const result = limitedResults[selectedIndex];
                        handleResultSelect(result);
                    } else {
                        handleAISelect();
                    }
                }
                break;
            case 'Escape':
                setSearchTerm('');
                setIsSearchFocused(false);
                break;
        }
    };

    // Function to determine what content to display
    const renderMainContent = () => {
        // Check for node selection first
        if (selectedNodeId && !isAIMode) {
            return (
                <div className="mt-8">
                    <NodeConnections nodeId={selectedNodeId} typeName={selectedTypeName} />
                </div>
            );
        }
        // Then check table display conditions
        if ((tableToDisplay === 'logo-table' || !tableToDisplay)&& !isAIMode) {
            return !isLoading && !errors.length && (
                <DynamicSpreadsheets queryResults={schemaResults} />
            );
        }
        // Ai node
        if (isAIMode) {
            return (
                <AIDisplay searchQuery={aiQuery}/>
            )
        }


        // Finally, handle regular table display
            return (
                <div className="mt-8">
                    <ObjectList tableName={tableToDisplay} />
                </div>
            );
    };

    return (
        <>
        <div className='my-32 z-10 w-96 flex flex-col'>
            {isSearchFocused && <div className={styles.overlay} />}
            <div className='absolute z-10'>
                <div className="w-96 transition-all focus-within:scale-105">
                    {/* Search Bar */}
                    <div
                        ref={searchContainerRef}
                        className='flex items-center px-3 pr-5 rounded-3xl shadow-md bg-white'
                    >
                        <MagnifyingGlassIcon className={styles.Icon} />
                        <div className="bg-white flex-1 p-2 transition-all">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={handleSearchFocus}
                            onBlur={handleSearchBlur}
                            placeholder="Search any field or ask AI..."
                            className="w-full border-none bg-transparent focus:outline-none"
                        />
                        </div>
                    </div>
                </div>
                            
                    {/* Floating Results Container */}
                    {searchTerm.trim() !== ''  && (
                        <div
                            className={`mt-2 w-full bg-white rounded-xl ${isSearchFocused ? 'opacity-1' : 'opacity-0'}`}
                            tabIndex={-1}
                        >
                            {loading ? (
                                <div className="p-2 pl-5 w-full min-w-0 rounded-xl box-border">
                                    Searching...
                                </div>
                            ) : error ? (
                                <div className="p-2 pl-5 w-full min-w-0 rounded-xl box-border">
                                    Error: {error.message}
                                </div>
                            ) : (
                                <>
                                    {/* Regular search results */}
                                    {limitedResults.map((result, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleResultSelect(result)}
                                            className={`flex flex-col p-2 pl-5 w-full min-w-0 rounded-xl box-border transition-all hover:bg-primary-500/20 hover:shadow-sm ${index === selectedIndex && "bg-primary-500/20"}`}
                                        >
                                            <div className="text-lg">
                                                {result.displayName}
                                            </div>
                                            <div className="text-sm">
                                                {result.matchedField}: {result.matchedValue}
                                            </div>
                                        </button>
                                    ))}

                                    {/* AI Option */}
                                    <button
                                        onClick={handleAISelect}
                                        className={`flex flex-col w-full p-2 pl-5 box-border rounded-xl transition-all hover:bg-primary-500/20 hover:shadow-sm ${limitedResults.length === selectedIndex && "bg-primary-500/20"}`}
                                    >
                                        <div className="text-lg">
                                            Ask AI about: "{searchTerm}"
                                        </div>
                                        <div className="text-sm">
                                            Get AI-powered insights and analysis
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    </div>
            </div>
        {renderMainContent()}

    </>
    );
}