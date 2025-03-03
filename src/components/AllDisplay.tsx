import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import Spreadsheet from 'react-spreadsheet';
import { SearchQuery } from './LeverApp';
import { QueryBuilder } from '../utils/QueryBuilder';
import {
    Table

} from './Table';
export const AllDisplay: React.FC<{
    schema: any;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}> = ({ schema, updateSearchQuery }) => {
    // Prepare queries for all tables using useMemo to avoid recreating on every render
    const tableQueries = useMemo(() => {
        return schema.entities.map((type: any) => ({
            tableName: type.table_name,
            query: QueryBuilder.getQueryForTable(schema, type.table_name)
        })).filter(item => item.query);
    }, [schema]);

    // Use useQuery for each table query
    const tableQueryResults = tableQueries.map(({ tableName, query }) => {
        const { data, loading, error } = useQuery(query);

        return {
            tableName,
            data: data ? data[`${tableName}Collection`]?.edges?.map(edge => edge.node) : null,
            loading,
            error
        };
    });

    // Check for loading state
    const isLoading = tableQueryResults.some(result => result.loading);

    // Check for errors
    const errors = tableQueryResults.filter(result => result.error);

    // Render loading state
    if (isLoading) {
        return <div className="flex flex-col items-center w-full p-4">Loading objects...</div>;
    }

    // Render errors if any
    if (errors.length > 0) {
        return (
            <div className="p-4 text-red-600">
                <h2 className="text-xl font-bold mb-4">Errors</h2>
                {errors.map((error, index) => (
                    <div key={index}>
                        <strong>{error.tableName}:</strong> {error.error.message}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="max-w-3xl w-full h-min overflow-y-hidden overflow-x-scroll no-scrollbar">
                <h2 className="text-2xl font-heading mb-4">All Objects</h2>
                {tableQueryResults.map(result => (
                    result.data && (
                        <Table
                            key={result.tableName}
                            data={result.data}
                            tableName={result.tableName}
                            updateSearchQuery={updateSearchQuery}
                        />
                    )
                ))}
            </div>
        </div>
    );
};

export default AllDisplay;