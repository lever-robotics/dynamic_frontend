// src/hooks/useMetadataSearch.ts
import React from 'react';
import { useQuery } from '@apollo/client';
import { QueryBuilder } from '../utils/QueryBuilder';

interface MetadataSearchResult {
    displayName: string;
    matchedField: string;
    matchedValue: string;
    sourceTable: string;
}

export function useMetadataSearch(searchTerm: string) {
    const metadataQuery = QueryBuilder.buildMetadataSearchQuery();

    // Try to parse the search term as a number if possible
    const numberTerm = !isNaN(parseInt(searchTerm)) ? parseInt(searchTerm) : null;

    // Try to parse the search term as a date if it matches date format
    let dateTerm = null;
    if (searchTerm.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dateObj = new Date(searchTerm);
        if (!isNaN(dateObj.getTime())) {
            dateTerm = searchTerm;
        }
    }

    const { data, loading, error } = useQuery(metadataQuery, {
        variables: {
            searchTerm: `%${searchTerm}%`,
            numberTerm: numberTerm,
            dateTerm: dateTerm
        },
        skip: !searchTerm || searchTerm.trim() === '',
    });

    const formattedResults = React.useMemo(() => {
        if (!data) return [];

        return Object.entries(data)
            .flatMap(([tableName, tableData]: [string, any]) => {
                const edges = tableData?.edges || [];
                return edges.flatMap(({ node }) => {
                    const matches = Object.entries(node)
                        .filter(([key, value]) => {
                            if (key === 'name' || key === 'first_name' || key === 'last_name') return false;

                            const stringValue = String(value).toLowerCase();
                            const searchLower = searchTerm.toLowerCase();

                            // Match based on value type
                            if (typeof value === 'number') {
                                return numberTerm !== null && value === numberTerm;
                            } else if (value instanceof Date || stringValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                return dateTerm !== null && stringValue.includes(searchTerm);
                            } else {
                                return stringValue.includes(searchLower);
                            }
                        });

                    return matches.map(([field, value]) => ({
                        displayName: node.name || `${node.first_name} ${node.last_name}`,
                        matchedField: field,
                        matchedValue: value,
                        sourceTable: tableName.replace('Collection', ''),
                        nodeId: node.nodeId,
                        typeName: node.__typename
                    }));
                });
            })
            .filter(Boolean);
    }, [data, searchTerm, numberTerm, dateTerm]);

    return {
        results: formattedResults,
        loading: loading && searchTerm.trim() !== '',
        error
    };
}