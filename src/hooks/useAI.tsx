// useAI.tsx
import { useState } from 'react';

interface AIResponse {
    text: string;
    // Add other response properties as needed
}

export const useAI = () => {
    const [data, setData] = useState<AIResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const makeAIRequest = async (searchText: string) => {
        try {
            setLoading(true);
            setError(null);

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