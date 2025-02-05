import React, { useState } from 'react';
import { useMetadataSearch } from '../hooks/useMetadataSearch';
import { NodeConnections } from './NodeConnections';
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import styles from "./SearchBar.module.css";

export function MetadataSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedTypeName, setSelectedTypeName] = useState<string | null>(null);
    const { results, loading, error } = useMetadataSearch(searchTerm);

    const handleResultClick = (nodeId: string, typeName: string) => {
        setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
        setSelectedTypeName(selectedTypeName === typeName ? null : typeName);
    };

    const limitedResults = results.slice(0, 5);

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Search Container */}
            <div className={styles.SearchbarContainer}>
                <MagnifyingGlassIcon className={styles.Icon} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search any field..."
                    className={styles.Searchbar}
                />
            </div>

            {/* Results Container */}
            {loading ? (
                <div className="text-center py-4 text-gray-600">Searching...</div>
            ) : error ? (
                <div className="text-center py-4 text-red-600">Error: {error.message}</div>
            ) : searchTerm.trim() !== '' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-4">
                    {limitedResults.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {limitedResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleResultClick(result.nodeId, result.typeName)}
                                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors focus:outline-none"
                                >
                                    <div className="font-semibold text-lg text-gray-900">
                                        {result.displayName}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {result.matchedField}: {result.matchedValue}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        in {result.sourceTable}
                                    </div>
                                    {selectedNodeId === result.nodeId && (
                                        <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                            <div>Node ID: {result.nodeId}</div>
                                            <div>Type: {result.typeName}</div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-600">
                            No results found for "{searchTerm}"
                        </div>
                    )}
                </div>
            )}

            {/* Node Connections */}
            {selectedNodeId && (
                <div className="mt-8">
                    <NodeConnections nodeId={selectedNodeId} typeName={selectedTypeName!} />
                </div>
            )}
        </div>
    );
}