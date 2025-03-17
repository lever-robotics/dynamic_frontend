import React, { useState } from 'react';
import type { SearchQuery } from './LeverApp';
import type { Blueprint } from '@/types/blueprint';

interface DisplayDataProps {
    blueprint: Blueprint;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}

interface RecommendResponse {
    message: string;
    recommendations: string[];
}

const useRecommend = () => {
    const [data, setData] = useState<RecommendResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const makeRecommendRequest = async () => {
        try {
            setLoading(true);
            setError(null);
            setData(null);

            const response = await fetch('http://127.0.0.1:5000/recommend');
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

    return { data, loading, error, makeRecommendRequest };
};

export const RecommendDisplay: React.FC<DisplayDataProps> = ({ blueprint, searchQuery, updateSearchQuery }) => {
    const { data, loading, error, makeRecommendRequest } = useRecommend();

    React.useEffect(() => {
        makeRecommendRequest();
    }, [makeRecommendRequest]);

    const handleQuestionClick = (question: string) => {
        updateSearchQuery({
            name: '',
            type: 'ai',
            metadata: {
                searchTerm: question
            }
        });
    };

    if (loading) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold">Recommendations</h2>
                <div className="mt-4">Loading recommendations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold">Recommendations</h2>
                <div className="mt-4 text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Recommendations</h2>
            <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Strategic Questions</h3>
                {data?.recommendations ? (
                    <div className="space-y-3">
                        {data.recommendations.map((recommendation, index) => (
                            <button
                                type="button"
                                key={recommendation}
                                onClick={() => handleQuestionClick(recommendation)}
                                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 
                                         transition-colors duration-150 flex items-start group"
                            >
                                <span className="flex-shrink-0 w-6 text-gray-600 group-hover:text-gray-800">
                                    {index + 1}.
                                </span>
                                <span className="text-gray-700 group-hover:text-gray-900">
                                    {recommendation}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-700">No recommendations available</p>
                )}
            </div>
        </div>
    );
};

export default RecommendDisplay;