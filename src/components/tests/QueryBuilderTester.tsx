// src/components/QueryBuilderTester.tsx
import React, { useState, useEffect } from 'react';
import { QueryBuilder } from '../../utils/QueryBuilder';
import schemaData from '../../assets/common_grounds.json'; // Import your schema data
import { print, DocumentNode } from 'graphql'; // Optional: for prettier query formatting

// Define schema interface
interface Field {
    name: string;
    type: string;
}

interface Entity {
    name: string;
    fields: Field[];
}

interface Schema {
    entities: Entity[];
}

// Component props interface (if needed)
interface QueryBuilderTesterProps {
    // Add any props you might need
}

const QueryBuilderTester: React.FC<QueryBuilderTesterProps> = () => {
    const [selectedEntity, setSelectedEntity] = useState<string>('');
    const [queryOutput, setQueryOutput] = useState<string>('');
    const [queryType, setQueryType] = useState<string>('table');
    const [error, setError] = useState<string>('');

    // Ensure the schema is typed
    const typedSchema = schemaData as Schema;

    // Initialize the schema on component mount
    useEffect(() => {
        try {
            // Set the schema in QueryBuilder
            QueryBuilder.setSchema(typedSchema);

            // Set the first entity as selected by default
            if (typedSchema.entities && typedSchema.entities.length > 0) {
                setSelectedEntity(typedSchema.entities[0].name);
            }
        } catch (err) {
            setError(`Error initializing schema: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, []);

    // Generate query based on selected type
    const generateQuery = (): void => {
        if (!selectedEntity) {
            setError('Please select an entity first');
            return;
        }

        try {
            let result: DocumentNode | null = null;

            switch (queryType) {
                case 'table':
                    result = QueryBuilder.getQueryForTable(selectedEntity);
                    break;
                case 'connections':
                    result = QueryBuilder.buildConnectionsQuery(selectedEntity);
                    break;
                case 'search':
                    result = QueryBuilder.buildMetadataSearchQuery();
                    break;
                default:
                    result = null;
            }

            if (result) {
                // If using Apollo's gql and want prettier formatting
                try {
                    setQueryOutput(print(result));
                } catch (err) {
                    // Fallback if print fails
                    if (result.loc?.source?.body) {
                        setQueryOutput(result.loc.source.body);
                    } else {
                        setQueryOutput(JSON.stringify(result, null, 2));
                    }
                }
            } else {
                setQueryOutput('No query generated');
            }
        } catch (err) {
            setError(`Error generating query: ${err instanceof Error ? err.message : String(err)}`);
            setQueryOutput('');
        }
    };

    useEffect(() => {
        if (selectedEntity) {
            generateQuery();
        }
    }, [queryType, selectedEntity]);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">GraphQL Query Builder Tester</h1>

            {error && (
                <div className="mb-6 p-4 border rounded bg-red-50 text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 p-4 border rounded">
                <h2 className="text-lg font-semibold mb-2">Schema Loaded: {typedSchema.entities?.length || 0} entities found</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-1">Select Entity:</label>
                        <select
                            value={selectedEntity}
                            onChange={(e) => setSelectedEntity(e.target.value)}
                            className="mb-2 border p-2 rounded w-full"
                        >
                            {typedSchema.entities?.map(entity => (
                                <option key={entity.name} value={entity.name}>{entity.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Query Type:</label>
                        <select
                            value={queryType}
                            onChange={(e) => setQueryType(e.target.value)}
                            className="mb-2 border p-2 rounded w-full"
                        >
                            <option value="table">getQueryForTable</option>
                            <option value="connections">buildConnectionsQuery</option>
                            <option value="search">buildMetadataSearchQuery</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={generateQuery}
                    className="bg-green-500 text-white p-2 rounded"
                >
                    Regenerate Query
                </button>
            </div>

            {queryOutput && (
                <div className="mb-6 p-4 border rounded">
                    <h2 className="text-lg font-semibold mb-2">Generated Query</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                        {queryOutput}
                    </pre>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(queryOutput);
                        }}
                        className="mt-2 bg-gray-500 text-white p-2 rounded"
                    >
                        Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default QueryBuilderTester;