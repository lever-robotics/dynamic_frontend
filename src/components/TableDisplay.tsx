import React from 'react';
import { useQuery } from '@apollo/client';
import { SearchQuery } from './LeverApp';
import { QueryBuilder } from '../utils/QueryBuilder';
import { Table } from './Table';

export const TableDisplay: React.FC<{
    schema: any;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}> = ({ schema, searchQuery, updateSearchQuery }) => {
    // Find the object type that matches the search query ID

    const matchedObjectType = schema.entities.find(
        (type: any) => type.name === searchQuery?.id
    );

    // If no matching object type found, render an error
    if (!matchedObjectType) {
        return (
            <div className="p-4 text-red-600">
                <h2 className="text-xl font-bold">Error</h2>
                <p>No matching table found for the given ID</p>
            </div>
        );
    }

    // Get the table name for the matched object type
    const tableName = matchedObjectType.name;

    // Generate query for the specific table
    const query = QueryBuilder.getQueryForTable(schema, tableName);

    // Execute the query
    const { data, loading, error } = useQuery(query!);

    // Render loading state
    if (loading) {
        return <div className="p-4">Loading data...</div>;
    }

    // Render error state
    if (error) {
        return (
            <div className="p-4 text-red-600">
                <h2 className="text-xl font-bold mb-4">Error</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    // Prepare table data
    const tableData = data?.[`${tableName}Collection`]?.edges?.map(edge => edge.node) || [];

    return (
        <div className="flex flex-col items-center w-full">
            <div className="max-w-3xl w-full h-min overflow-y-hidden overflow-x-scroll no-scrollbar">
                <Table data={tableData} tableName={tableName} updateSearchQuery={updateSearchQuery} />
            </div>
        </div>
    );
};

export default TableDisplay;