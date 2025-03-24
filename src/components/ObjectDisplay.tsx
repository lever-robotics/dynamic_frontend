import type React from 'react';
import { useQuery } from '@apollo/client';
import type { SearchQuery } from './LeverApp';
import { QueryBuilder } from '../utils/QueryBuilder';
import MainEntityData from './MainEntityData';
import type { Blueprint, GraphQLResponse } from '@/types/blueprint';

// Custom hook for fetching object data and connections
export function useObjectData(blueprint: Blueprint, nodeId: string | undefined, typeName: string | undefined): GraphQLResponse {
    // Generate connections query for the specific object type
    // if(!typeName) {
    //     return {
    //         data: null,
    //         loading: false,
    //         error: new Error('No type name found')
    //     };
    // }

    const connectionsQuery = QueryBuilder.buildConnectionsQuery(blueprint, typeName);

    if(!connectionsQuery) {
        return {
            data: null,
            loading: false,
            error: new Error('No connections query found')
            };
    }
    console.log("connectionsQuery", connectionsQuery);
    // Execute the query
    const { data, loading, error } = useQuery(connectionsQuery, {
        variables: { nodeId: nodeId },
        // skip: !nodeId || !typeName
    });

    console.log('Raw GraphQL Response:', data);

    // Extract and return processed data
    return {
        data,
        loading,
        error
    };
}

// ObjectDisplay component
export const ObjectDisplay: React.FC<{
    blueprint: Blueprint;
    searchQuery: SearchQuery;
    updateSearchQuery: (query: SearchQuery) => void;
}> = ({ blueprint, searchQuery }) => {
    // Find object type from schema using the objectType in search query metadata
    const objectType = searchQuery.metadata?.objectType;
    console.log("searchQuery", searchQuery);
    // const objectDef = blueprint.entities.find(
    //     (type: any) => type.name === objectType
    // );

    // Use custom hook to fetch object data and connections
    const { data, loading, error } = useObjectData(
        blueprint,
        searchQuery.metadata?.objectID,
        objectType
    );

    if(!objectType) {
        return <div className="p-4">No object type found</div>;
    }

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
    if (!data) {
        return <div className="p-4">No data available</div>;
    }

    // Get collections from the data
    const entityData = Object.values(data)[0][0];
    console.log("entityData",entityData);
    // const collections = Object.entries(data)
    //     .filter(([key]) => key.endsWith('Collection'));

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex flex-col justify-start gap-10 max-w-3xl">
                {/* Main entity data */}
                <MainEntityData
                    data={entityData}
                />

                {/* Connection data */}
                {/* {collections.map(([collectionName, collection]: [string, any]) => (
                    <ConnectionSpreadsheet
                        key={collectionName}
                        collectionName={collectionName}
                        edges={collection.edges}
                        updateSearchQuery={updateSearchQuery}
                    />
                ))} */}
            </div>
        </div>
    );
};

export default ObjectDisplay;