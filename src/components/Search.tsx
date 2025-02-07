// src/components/Search.tsx
import { useState } from 'react';
import { useSearchQuery } from '../hooks/useSearchQuery';

export function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const { results, loading, error } = useSearchQuery(searchTerm);

    return (
        <div>
            <div>
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
                        <div key={index}>
                            <h3>{result.name || `${result.first_name} ${result.last_name}`}</h3>
                            <p>Found in: {result.sourceTable}</p>
                            <pre>
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}