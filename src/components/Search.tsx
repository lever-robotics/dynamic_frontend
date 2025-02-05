// src/components/Search.tsx
import { useState } from 'react';
import { useSearchQuery } from '../hooks/useSearchQuery';

export function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const { results, loading, error } = useSearchQuery(searchTerm);

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full p-2 border rounded"
                />
            </div>

            {loading && <div>Searching...</div>}
            {error && <div>Error: {error.message}</div>}

            {results.length > 0 && (
                <div>
                    <h2>Search Results:</h2>
                    {results.map((result, index) => (
                        <div key={index} className="p-2 border-b">
                            <h3>{result.name || `${result.first_name} ${result.last_name}`}</h3>
                            <p>Found in: {result.sourceTable}</p>
                            <pre className="mt-2 text-sm">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}