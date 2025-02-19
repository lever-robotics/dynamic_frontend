import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import Spreadsheet from 'react-spreadsheet';
import { SearchQuery } from './LeverApp';
import { QueryBuilder } from '../utils/QueryBuilder';

export const AllDisplay: React.FC<{
    schema: any;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}> = ({ schema }) => {
    // Prepare queries for all tables using useMemo to avoid recreating on every render
    const tableQueries = useMemo(() => {
        return schema.object_types.map((type: any) => ({
            tableName: type.table_name,
            query: QueryBuilder.getQueryForTable(type.table_name)
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

    // State to store spreadsheet data
    const [spreadsheetData, setSpreadsheetData] = useState<Array<{
        tableName: string;
        data: Array<Array<{ value: string; readOnly?: boolean }>>;
        headers: string[];
    }>>([]);

    // Prepare spreadsheet data when results change
    useEffect(() => {
        if (tableQueryResults.length > 0) {
            const preparedData = tableQueryResults.map(result => {
                if (!result.data || result.data.length === 0) {
                    return {
                        tableName: result.tableName,
                        data: [],
                        headers: []
                    };
                }

                // Get headers (excluding certain internal fields)
                const headers = Object.keys(result.data[0]).filter(key =>
                    !['__typename', 'nodeId', 'id'].includes(key)
                );

                // Create matrix of data
                const matrix = result.data.map(item =>
                    headers.map(header => ({
                        value: String(item[header] || ''),
                        readOnly: true
                    }))
                );

                return {
                    tableName: result.tableName,
                    data: matrix,
                    headers
                };
            });

            setSpreadsheetData(preparedData);
        }
    }, [tableQueryResults]);

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

                {spreadsheetData.map((sheet) => (
                    <div
                        key={sheet.tableName}
                        className="mb-6 bg-white shadow rounded-lg overflow-hidden"
                    >
                        <div className="bg-gray-100 px-4 py-2 border-b">
                            <h3 className="text-lg font-semibold text-gray-700">
                                {sheet.tableName}
                            </h3>
                        </div>

                        {sheet.data.length > 0 ? (
                            <Spreadsheet
                                data={sheet.data}
                                columnLabels={sheet.headers}
                                onChange={() => { }} // Read-only, so no changes
                            />
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No data available
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllDisplay;