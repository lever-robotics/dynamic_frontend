// src/components/MetadataSearch.tsx
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useMetadataSearch } from '../hooks/useMetadataSearch';
import { NodeConnections } from './NodeConnections';
import { ObjectList } from './ObjectList';
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import styles from "./SearchBar.module.css";
import { AIDisplay } from './AIDisplay';

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
        // setIsSearchFocused(false);
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
        onTableSelect('');
        setIsAIMode(true);
        setSelectedNodeId(null);
        setSelectedTypeName(null);
        setAiQuery(searchTerm);
        setSearchTerm('');
        setIsSearchFocused(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const totalOptions = limitedResults.length + (searchTerm.trim() !== '' ? 1 : 0);
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

    return (
        <>
        <div className='my-32 z-10 w-96 flex flex-col'>
            {isSearchFocused && <div className={styles.overlay} />}

            <div className="z-10 w-96 transition-all focus-within:scale-105">
                {/* Search Bar */}
                <div
                    ref={searchContainerRef}
                    className='flex items-center px-3 pr-5 rounded-3xl shadow bg-white'
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
                    {searchTerm.trim() !== '' && (
                        <div
                            className={`z-10 mt-2 w-full bg-white rounded-xl ${isSearchFocused ? styles.ResultsContainerVisible : ''}`}
                            tabIndex={-1}
                        >
                            {loading ? (
                                <div className={styles.ResultItem}>
                                    Searching...
                                </div>
                            ) : error ? (
                                <div className={styles.ResultItem}>
                                    Error: {error.message}
                                </div>
                            ) : (
                                <>
                                    {/* Regular search results */}
                                    {limitedResults.map((result, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleResultSelect(result)}
                                            className={`flex flex-col p-2 pl-5 w-full min-w-0 rounded-xl box-border transition-all hover:bg-primary-500/20 hover:shadow-sm`}
                                        >
                                            <div className={styles.ResultName}>
                                                {result.displayName}
                                            </div>
                                            <div className={styles.ResultDetail}>
                                                {result.matchedField}: {result.matchedValue}
                                            </div>
                                        </button>
                                    ))}

                                    {/* AI Option */}
                                    <button
                                        onClick={handleAISelect}
                                        className={"flex flex-col w-full p-2 pl-5 box-border rounded-xl transition-all hover:bg-primary-500/20 hover:shadow-sm"}
                                    >
                                        <div className={styles.ResultName}>
                                            Ask AI about: "{searchTerm}"
                                        </div>
                                        <div className={styles.ResultDetail}>
                                            Get AI-powered insights and analysis
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
        </div>
        {/* Display Components - Only one will show at a time */}
        <div className={`w-full ${isSearchFocused ? 'opacity-50' : ''} transition-opacity duration-200`}>
        {tableToDisplay ? (
            <div className="mt-8">
                <ObjectList tableName={tableToDisplay} />
            </div>
        ) : selectedNodeId ? (
            <div className="mt-8">
                <NodeConnections nodeId={selectedNodeId} typeName={selectedTypeName} />
            </div>
        ) : isAIMode ? (
            <div>
                <AIDisplay searchQuery={aiQuery} />
            </div>
        ) : null}
    </div>
    </>
    );
}