import React, { useState } from 'react';
import { SearchQuery } from './LeverApp';

interface DisplayDataProps {
    schema: any;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}

interface AIResponse {
    message: string;
}

const useAI = () => {
    const [data, setData] = useState<AIResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const makeAIRequest = async (searchText: string) => {
        try {
            setLoading(true);
            setError(null);
            setData(null);

            const response = await fetch(`http://127.0.0.1:5000/api?param=${encodeURIComponent(searchText)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, makeAIRequest };
};

export const AIDisplay: React.FC<DisplayDataProps> = ({ schema, searchQuery, updateSearchQuery }) => {
    const { data, loading, error, makeAIRequest } = useAI();

    React.useEffect(() => {
        if (searchQuery?.metadata?.searchTerm) {
            makeAIRequest(searchQuery.metadata.searchTerm);
        }
    }, [searchQuery?.metadata?.searchTerm]);

    if (loading) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold">AI Search</h2>
                <div className="mt-4">Loading AI response...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold">AI Search</h2>
                <div className="mt-4 text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">AI Search</h2>
            <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
                <h3 className="text-lg font-semibold mb-2">AI Response</h3>
                <p className="text-gray-700">
                    {data?.message || 'No response yet'}
                </p>
            </div>
        </div>
    );
};

export default AIDisplay;