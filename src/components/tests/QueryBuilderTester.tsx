// src/components/QueryBuilderTester.tsx
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { print, parse } from 'graphql';

interface SchemaEntity {
    name: string;
    fields: {
        name: string;
        type: string;
        description: string;
        values?: string[];
    }[];
    description: string;
    display_name: string;
}

interface Schema {
    version: string;
    entities: SchemaEntity[];
    relationships: any[];
}

interface QueryBuilderTesterProps {
    schema: Schema;
}

const useQueryExecution = (
    parsedQuery: any,
    shouldRun: boolean,
    queryType: 'table' | 'search',
    searchTerm: string,
    queryError: string
) => {
    const variables = queryType === 'search' ? { searchTerm: `%${searchTerm}%` } : {};

    return useQuery(parsedQuery!, {
        skip: !parsedQuery || !shouldRun || (queryType === 'search' && !searchTerm) || !!queryError,
        variables,
        fetchPolicy: "no-cache"
    });
};

const QueryBuilderTester: React.FC<QueryBuilderTesterProps> = ({ schema }) => {
    const [showQuery, setShowQuery] = useState(false);
    const [shouldRun, setShouldRun] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [queryType, setQueryType] = useState<'table' | 'search'>('table');
    const [editedQuery, setEditedQuery] = useState<string>('');
    const [queryError, setQueryError] = useState<string>('');
    const [parsedQuery, setParsedQuery] = useState<any>(null);

    // Get the query based on type
    const generatedQuery = queryType === 'table'
        ? (schema.entities?.[0] ? QueryBuilder.getQueryForTable(schema, schema.entities[0].name) : null)
        : QueryBuilder.buildMetadataSearchQuery(schema);

    const { data, loading, error } = useQueryExecution(
        parsedQuery,
        shouldRun,
        queryType,
        searchTerm,
        queryError
    );

    const handleLoadQuery = (type: 'table' | 'search') => {
        setQueryType(type);
        const query = type === 'table'
            ? (schema.entities?.[0] ? QueryBuilder.getQueryForTable(schema, schema.entities[0].name) : null)
            : QueryBuilder.buildMetadataSearchQuery(schema);

        if (query) {
            setEditedQuery(print(query));
            try {
                setParsedQuery(query);
                setQueryError('');
            } catch (err) {
                setQueryError(err instanceof Error ? err.message : 'Invalid GraphQL query');
            }
        }
        setShouldRun(false);
    };

    const handleEditQuery = () => {
        try {
            const parsed = parse(editedQuery);
            setParsedQuery(parsed);
            setQueryError('');
        } catch (err) {
            setQueryError(err instanceof Error ? err.message : 'Invalid GraphQL query');
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">GraphQL Query Tester</h1>

            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => handleLoadQuery('table')}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Load Table Query
                </button>
                <button
                    onClick={() => handleLoadQuery('search')}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                    Load Search Query
                </button>
                <button
                    onClick={() => setShowQuery(!showQuery)}
                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                    {showQuery ? 'Hide' : 'Show'} GraphQL Query
                </button>
            </div>

            {queryType === 'search' && (
                <div className="mb-6 p-4 border rounded">
                    <label className="block mb-2">Search Term:</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 rounded w-full"
                        placeholder="Enter search term..."
                    />
                </div>
            )}

            {showQuery && (
                <div className="mb-6 p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">GraphQL Query</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (generatedQuery) {
                                        setEditedQuery(print(generatedQuery));
                                        setParsedQuery(generatedQuery);
                                        setQueryError('');
                                    }
                                }}
                                className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                            >
                                Reset Query
                            </button>
                            <button
                                onClick={handleEditQuery}
                                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            >
                                Validate Query
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(editedQuery);
                                }}
                                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={editedQuery}
                        onChange={(e) => setEditedQuery(e.target.value)}
                        className="w-full h-64 p-4 font-mono text-sm bg-gray-100 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Edit your GraphQL query here..."
                    />
                    {queryError && (
                        <div className="mt-2 text-red-600 text-sm">
                            {queryError}
                        </div>
                    )}
                </div>
            )}

            <div className="mb-6">
                <button
                    onClick={() => setShouldRun(true)}
                    disabled={!!queryError || (queryType === 'search' && !searchTerm)}
                    className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
                >
                    Run Query
                </button>
            </div>

            {loading && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded">
                    Loading data...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded">
                    <h2 className="text-xl font-bold mb-2">Query Error</h2>
                    <p>{error.message}</p>
                </div>
            )}

            {data && (
                <div className="mb-6 p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Query Result</h2>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                            }}
                            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                        >
                            Copy Result
                        </button>
                    </div>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default QueryBuilderTester;