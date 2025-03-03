import React from 'react';
import { useAI } from '../hooks/useAI';
import { useState } from 'react';

interface AIDisplayProps {
    searchQuery: string;
}

interface GraphQLQuery {
    query: string;
    result: any;
}

interface AIResponse {
    answer: string;  // Changed from message
    queries: GraphQLQuery[];  // Added GraphQL queries
}

export const AIDisplay: React.FC<AIDisplayProps> = ({ searchQuery }) => {
    const { data, loading, error, makeAIRequest } = useAI();
    const [expandedQuery, setExpandedQuery] = useState<number | null>(null);


    // Make the request when searchQuery changes
    React.useEffect(() => {
        if (searchQuery) {
            makeAIRequest(searchQuery);
        }
    }, [searchQuery]);

    if (loading) return <div className="p-4">Loading AI response...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (!data) return null;

    return (
        <div className="space-y-4">
            {/* AI Response */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-semibold mb-2">AI Response</h3>
                <p className="text-gray-700">{data.answer}</p>
            </div>

            {/* GraphQL Queries */}
            {data.queries && data.queries.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">GraphQL Queries</h3>
                    <div className="space-y-2">
                        {data.queries.map((q, index) => (
                            <div key={index} className="border rounded p-3">
                                <button
                                    className="w-full text-left font-medium text-gray-700 flex justify-between items-center"
                                    onClick={() => setExpandedQuery(expandedQuery === index ? null : index)}
                                >
                                    <span>Query {index + 1}</span>
                                    <span>{expandedQuery === index ? '▼' : '▶'}</span>
                                </button>

                                {expandedQuery === index && (
                                    <div className="mt-2 space-y-2">
                                        <div className="bg-gray-50 p-2 rounded">
                                            <h4 className="text-sm font-medium text-gray-600">Query:</h4>
                                            <pre className="text-sm overflow-x-auto">{q.query}</pre>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <h4 className="text-sm font-medium text-gray-600">Result:</h4>
                                            <pre className="text-sm overflow-x-auto">
                                                {JSON.stringify(q.result, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};