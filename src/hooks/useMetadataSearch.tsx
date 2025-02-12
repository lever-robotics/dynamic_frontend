// src/hooks/useMetadataSearch.ts
import React from 'react';
import { useQuery } from '@apollo/client';
import { QueryBuilder } from '../utils/QueryBuilder';
import schemaData from '../assets/odoo_schema.json';
import { ApolloError } from '@apollo/client';

interface MetadataSearchResult {
    displayName: string;
    matchedField: string;
    matchedValue: string;
    sourceTable: string;
    nodeId: string;
    typeName: string;
}

export function useMetadataSearch(searchTerm: string) {
    const metadataQuery = QueryBuilder.buildMetadataSearchQuery();

    // Convert number to float instead of int
    const numberTerm = !isNaN(parseFloat(searchTerm)) ? parseFloat(searchTerm) : null;

    // Keep date as string
    const dateTerm = searchTerm.match(/^\d{4}-\d{2}-\d{2}$/) ? searchTerm : null;

    // Log all variables being sent
    const variables = {
        searchTerm: `%${searchTerm}%`,
        numberTerm,
        dateTerm
    };

    const handleError = (error: ApolloError) => {

        if (error.graphQLErrors) {
            console.error('GraphQL Errors:', error.graphQLErrors.map(e => ({
                message: e.message,
                locations: e.locations,
                path: e.path,
                extensions: e.extensions
            })));
        }

        if (error.networkError) {
            console.error('Network Error:', {
                statusCode: (error.networkError as any).statusCode,
                result: (error.networkError as any).result,
                bodyText: (error.networkError as any).bodyText
            });
        }
    };

    const { data, loading, error } = useQuery(metadataQuery, {
        variables,
        skip: !searchTerm || searchTerm.trim() === '',
        onError: handleError,
        onCompleted: (data) => {
            // console.log('Query Completed Successfully:', data);
        }
    });



    const formattedResults = React.useMemo(() => {
        if (!data && !searchTerm) return [];

        // Get schema object type matches
        const schemaMatches = schemaData.object_types
            .filter(obj => obj.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(obj => ({
                displayName: obj.name,
                matchedField: 'table',
                matchedValue: obj.table_name,
                sourceTable: obj.table_name,
                nodeId: '',
                typeName: ''
            }));

        if (!data) return schemaMatches;

        const dbResults = Object.entries(data)
            .flatMap(([tableName, tableData]: [string, any]) => {
                const edges = tableData?.edges || [];
                return edges.flatMap(({ node }) => {
                    // First check if name fields match the search term
                    const nameMatches = [];
                    if (node.name && node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        nameMatches.push(['name', node.name]);
                    }
                    if (node.first_name && node.first_name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        nameMatches.push(['first_name', node.first_name]);
                    }
                    if (node.last_name && node.last_name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        nameMatches.push(['last_name', node.last_name]);
                    }

                    // Then check other fields
                    const otherMatches = Object.entries(node)
                        .filter(([key, value]) => {
                            if (key === 'name' || key === 'first_name' || key === 'last_name' ||
                                key === '__typename' || key === 'nodeId') return false;

                            const stringValue = String(value).toLowerCase();
                            const searchLower = searchTerm.toLowerCase();

                            if (typeof value === 'number') {
                                return numberTerm !== null && value === numberTerm;
                            } else if (value instanceof Date || stringValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                return dateTerm !== null && stringValue.includes(searchTerm);
                            } else {
                                return stringValue.includes(searchLower);
                            }
                        });

                    // Combine both name matches and other matches
                    const allMatches = [...nameMatches, ...otherMatches];

                    return allMatches.map(([field, value]) => ({
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

        // Combine schema matches and database results, with schema matches first
        return [...schemaMatches, ...dbResults];
    }, [data, searchTerm, numberTerm, dateTerm]);

    return {
        results: formattedResults,
        loading: loading && searchTerm.trim() !== '',
        error
    };
}