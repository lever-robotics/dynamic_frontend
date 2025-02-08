// src/components/MainEntityData.tsx
import React, { useState } from 'react';

interface MainEntityDataProps {
    data: any;
    typename: string;
}

const MainEntityData: React.FC<MainEntityDataProps> = ({ data, typename }) => {
    const [showDebug, setShowDebug] = useState(false);

    // Filter out collections and internal fields
    const mainData = Object.entries(data)
        .filter(([key, value]) =>
            !key.endsWith('Collection') &&
            !key.startsWith('__') &&
            value !== null
        );

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header with Debug Toggle */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {typename}
                </h2>
                <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                    {showDebug ? 'Hide' : 'Show'} Debug
                </button>
            </div>

            {/* Formatted Data Display */}
            {!showDebug && (
                <div className="grid gap-3">
                    {mainData.map(([key, value]) => (
                        <div
                            key={key}
                            className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-0"
                        >
                            <span className="text-gray-600 font-medium">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="col-span-2 text-gray-800">
                                {typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)
                                }
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Debug View */}
            {showDebug && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default MainEntityData;