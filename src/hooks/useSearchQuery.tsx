// src/hooks/useSearchQuery.ts
import React from 'react';
import { useQuery } from '@apollo/client';
import { QueryBuilder } from '../utils/QueryBuilder';

export function useSearchQuery(searchTerm: string) {
    const searchQuery = QueryBuilder.buildSearchQuery();

    const { data, loading, error } = useQuery(searchQuery, {
        variables: { searchTerm: `%${searchTerm}%` }, // Adding wildcards for LIKE query
        skip: !searchTerm, // Skip query if no search term
    });

    // Transform results into a flat array of matches
    const results = React.useMemo(() => {
        if (!data) return [];

        return Object.entries(data)
            .flatMap(([tableName, tableData]: [string, any]) => {
                const edges = tableData?.edges || [];
                return edges.map(({ node }) => ({
                    ...node,
                    sourceTable: tableName.replace('Collection', '')
                }));
            })
            .filter(Boolean);
    }, [data]);

    return { results, loading, error };
}