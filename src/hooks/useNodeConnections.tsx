// src/hooks/useNodeConnections.ts
import { useQuery } from '@apollo/client';
import { QueryBuilder } from '../utils/QueryBuilder';

// useNodeConnections hook
export function useNodeConnections(nodeId: string, typeName: string) {
    const connectionsQuery = QueryBuilder.buildConnectionsQuery(typeName);

    const { data, loading, error } = useQuery(connectionsQuery!, {
        variables: { nodeId },
        skip: !nodeId
    });

    // console.log('Raw GraphQL Response:', data);

    return {
        data: data?.node,
        loading,
        error
    };
}