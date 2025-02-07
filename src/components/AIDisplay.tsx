import React from 'react';
import { useAI } from '../hooks/useAI';

interface AIDisplayProps {
    searchQuery: string;
}

interface AIResponse {
    message: string;
}

export const AIDisplay: React.FC<AIDisplayProps> = ({ searchQuery }) => {
    const { data, loading, error, makeAIRequest } = useAI<AIResponse>();

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
        <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">AI Response</h3>
            <p className="text-gray-700">{data.message}</p>
        </div>
    );
};