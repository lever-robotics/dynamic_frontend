import type React from 'react';
import { Table } from './Table';
import type { SearchQuery } from './LeverApp';

interface ConnectionSpreadsheetProps {
    edges: any[];
    updateSearchQuery: (query: SearchQuery) => void;
}

const ConnectionSpreadsheet: React.FC<ConnectionSpreadsheetProps> = ({ 
    edges, 
    updateSearchQuery 
}) => {
    if (!edges || edges.length === 0) return null;

    // Get the first node to analyze structure
    const firstNode = edges[0].node;
    
    // Find all collection keys in the node (they will be objects/arrays)
    const collectionKeys = Object.keys(firstNode).filter(key => {
        const value = firstNode[key];
        return value && typeof value === 'object' && !Array.isArray(value) && key !== '__typename';
    });

    console.log('Found collections:', collectionKeys);
    console.log('First node structure:', firstNode);

    return (
        <div className="max-w-3xl h-min">
            <h2 className="text-2xl font-heading text-portage-950">Connected Collections</h2>
            <div className="overflow-y-hidden overflow-x-scroll no-scrollbar">
                {collectionKeys.map(collectionKey => {
                    // Extract data for this collection from all nodes
                    const collectionData = edges
                        .map(edge => edge.node[collectionKey])
                        .filter(Boolean); // Remove any null/undefined entries

                    // Format the collection name for display
                    const displayName = collectionKey
                        .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
                        .replace(/^./, str => str.toUpperCase()); // Capitalize first letter

                    console.log(`Collection ${collectionKey} data:`, collectionData);

                    return collectionData.length > 0 ? (
                        <Table
                            key={collectionKey}
                            data={collectionData}
                            tableName={displayName}
                            updateSearchQuery={updateSearchQuery}
                        />
                    ) : null;
                })}
            </div>
        </div>
    );
};

export default ConnectionSpreadsheet;