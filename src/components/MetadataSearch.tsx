// src/components/MetadataSearch.tsx
import React, { useState, useEffect, KeyboardEvent } from 'react';
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
    const [aiQuery, setAiQuery] = useState(''); // Separate state for AI query
    const { results, loading, error } = useMetadataSearch(searchTerm);

    // Limit regular results to 4 to leave room for AI option
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
            setAiQuery('');
            setSearchTerm('');
        }
    }, [tableToDisplay]);

    const handleResultSelect = (result: any) => {
        if (result.typeName === '') {
            setSelectedNodeId(null);
            setSelectedTypeName(null);
            onTableSelect(result.sourceTable);
        } else {
            onTableSelect('');
            setSelectedNodeId(result.nodeId);
            setSelectedTypeName(result.typeName);
        }
        setSearchTerm('');
        setIsAIMode(false);
        setAiQuery('');
        onSearchStart?.();
    };

    const handleAISelect = () => {
        onTableSelect('');
        setIsAIMode(true);
        setSelectedNodeId(null);
        setSelectedTypeName(null);
        setAiQuery(searchTerm); // Set AI query when explicitly selecting AI
        setSearchTerm('');
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
                break;
        }
    };

    return (
        <div style={{ zIndex: 50 }}>
            {/* Search Container */}
            <div className={styles.SearchbarContainer}>
                <MagnifyingGlassIcon className={styles.Icon} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search any field or ask AI..."
                    className={styles.Searchbar}
                />
            </div>

            {/* Floating Results Container */}
            {searchTerm.trim() !== '' && (
                <div className={styles.ResultsContainer}>
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

            {/* Display Components - Only one will show at a time */}
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
    );
}