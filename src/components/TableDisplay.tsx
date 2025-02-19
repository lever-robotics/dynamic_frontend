import React from 'react';
import { useQuery } from '@apollo/client';
import { SearchQuery } from './LeverApp';
import { QueryBuilder } from '../utils/QueryBuilder';

export const TableDisplay: React.FC<{
    schema: any;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}> = ({ schema, searchQuery }) => {
    // Find the object type that matches the search query ID
    const matchedObjectType = schema.object_types.find(
        (type: any) => type.id === searchQuery?.id
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
    const tableName = matchedObjectType.table_name;

    // Generate query for the specific table
    const query = QueryBuilder.getQueryForTable(tableName);

    // Execute the query
    const { data, loading, error } = useQuery(query);

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
    const tableData = data
        ? data[`${tableName}Collection`]?.edges?.map(edge => edge.node)
        : null;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Table: {tableName}</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(tableData, null, 2)}
            </pre>
        </div>
    );
};

export default TableDisplay;