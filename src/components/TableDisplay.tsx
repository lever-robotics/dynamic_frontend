import React from 'react';
import { useQuery } from '@apollo/client';
import { SearchQuery } from './LeverApp';
import { QueryBuilder } from '../utils/QueryBuilder';
import { Table } from './Table';

interface TableData {
    nodeId: number;
    [key: string]: string | number;
}

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
    const { data, loading, error } = useQuery(query!, { fetchPolicy: "no-cache" });
    console.log(data);

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

    // Prepare table data - updated to handle new data structure
    const rawData = (data?.[tableName] || []) as TableData[];

    // Transform the data to match the expected format
    const tableData = rawData.map(item => {
        const transformedItem: any = {};
        // Keep nodeId for selection handling
        transformedItem.nodeId = item.nodeId;
        // Add all other fields
        Object.entries(item).forEach(([key, value]) => {
            if (key !== 'nodeId') {
                transformedItem[key] = value;
            }
        });
        return transformedItem;
    });

    // Get all unique fields from the data
    const fields = Array.from(new Set(
        tableData.flatMap((item: TableData) => Object.keys(item))
    )).filter(field => field !== 'nodeId'); // Exclude nodeId from display

    console.log(tableData);

    return (
        <div className="flex flex-col items-center w-full">
            <div className="max-w-3xl w-full h-min overflow-y-hidden overflow-x-scroll no-scrollbar">
                <Table
                    data={tableData}
                    tableName={tableName}
                    updateSearchQuery={updateSearchQuery}
                    excludeFields={['nodeId']} // Only exclude nodeId since we're handling other fields in the transformation
                />
            </div>
        </div>
    );
};

export default TableDisplay;