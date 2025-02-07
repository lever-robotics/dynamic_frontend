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
        <div className={styles.searchWrapper}>
            {isSearchFocused && <div className={styles.overlay} />}

            <div className="relative w-full flex flex-col items-center">
                {/* Search Bar */}
                <div
                    ref={searchContainerRef}
                    className={`${styles.SearchbarContainer} ${isSearchFocused ? styles.SearchbarContainerActive : ''}`}
                >
                    <MagnifyingGlassIcon className={styles.Icon} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        placeholder="Search any field or ask AI..."
                        className={styles.Searchbar}
                    />

                    {/* Floating Results Container */}
                    {searchTerm.trim() !== '' && (
                        <div
                            className={`${styles.ResultsContainer} ${isSearchFocused ? styles.ResultsContainerVisible : ''}`}
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
                                            className={`${styles.ResultItem} ${index === selectedIndex ? styles.selected : ''}`}
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
                                        className={`${styles.ResultItem} ${selectedIndex === limitedResults.length ? styles.selected : ''}`}
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
            </div>
        </div>
    );
}