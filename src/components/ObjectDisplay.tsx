import React from 'react';
import { useQuery } from '@apollo/client';
import { SearchQuery } from './LeverApp';
import { QueryBuilder } from '../utils/QueryBuilder';
import MainEntityData from './MainEntityData';
import ConnectionSpreadsheet from './ConnectionsData';

// Custom hook for fetching object data and connections
export function useObjectData(objectId: string, typeName: string) {
    // Generate connections query for the specific object type
    const connectionsQuery = QueryBuilder.buildConnectionsQuery(typeName);

    // Execute the query
    const { data, loading, error } = useQuery(connectionsQuery!, {
        variables: { nodeId: objectId },
        skip: !objectId || !typeName
    });

    console.log('Raw GraphQL Response:', data);

    // Extract and return processed data
    return {
        data: data?.node,
        loading,
        error
    };
}

// ObjectDisplay component
export const ObjectDisplay: React.FC<{
    schema: any;
    searchQuery: SearchQuery;
    updateSearchQuery: (query: SearchQuery) => void;
}> = ({ schema, searchQuery, updateSearchQuery }) => {
    // Find object type from schema using the objectType in search query metadata
    const objectType = searchQuery.metadata?.objectType;
    const objectDef = schema.object_types.find(
        (type: any) => type.table_name === objectType
    );

    // Use custom hook to fetch object data and connections
    const { data: nodeData, loading, error } = useObjectData(
        searchQuery.metadata?.objectID!,
        objectType!
    );

    // Render loading state
    if (loading) {
        return <div className="p-4">Loading object data...</div>;
    }

    // Render error state
    if (error) {
        return (
            <div className="p-4 text-red-600">
                <h2 className="text-xl font-bold">Error</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    // If no node data, show no data message
    if (!nodeData) {
        return <div className="p-4">No data available</div>;
    }

    // Get collections from the data
    const collections = Object.entries(nodeData)
        .filter(([key]) => key.endsWith('Collection'));

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex flex-col justify-start gap-10 max-w-3xl">
                {/* Main entity data */}
                <MainEntityData
                    data={nodeData}
                    typename={nodeData.__typename}
                />

                {/* Connection data */}
                {collections.map(([collectionName, collection]: [string, any]) => (
                    <ConnectionSpreadsheet
                        key={collectionName}
                        collectionName={collectionName}
                        edges={collection.edges}
                        updateSearchQuery={updateSearchQuery}
                    />
                ))}
            </div>
        </div>
    );
};

export default ObjectDisplay;