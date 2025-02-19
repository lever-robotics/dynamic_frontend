import React from 'react';
import { SearchQuery } from './LeverApp';
import AllDisplay from './AllDisplay';
import TableDisplay from './TableDisplay';
import ObjectDisplay from './ObjectDisplay';

// Display component props
interface DisplayDataProps {
    schema: any;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}

const AIDisplay: React.FC<DisplayDataProps> = ({ searchQuery }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">AI Search</h2>
            <p>AI-powered search for: {searchQuery?.data}</p>
        </div>
    );
};

const RecommendDisplay: React.FC<DisplayDataProps> = ({ searchQuery }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Recommendations</h2>
            <p>Recommendations for: {searchQuery?.data}</p>
        </div>
    );
};

const SettingsDisplay: React.FC<DisplayDataProps> = ({ searchQuery }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Settings</h2>
            <p>Settings for: {searchQuery?.data}</p>
        </div>
    );
};

// Main DisplayData component
export const DisplayData: React.FC<DisplayDataProps> = ({
    schema,
    searchQuery,
    updateSearchQuery
}) => {
    // Render different components based on search query type
    const renderDisplay = () => {
        if (!searchQuery) {
            return <div className="p-4">No search query selected</div>;
        }

        switch (searchQuery.type) {
            case 'object':
                return <ObjectDisplay schema={schema} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'table':
                return <TableDisplay schema={schema} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'ai':
                return <AIDisplay schema={schema} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'recommend':
                return <RecommendDisplay schema={schema} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'all':
                return <AllDisplay schema={schema} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'settings':
                return <SettingsDisplay schema={schema} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            default:
                return <div className="p-4">Unknown search type</div>;
        }
    };

    return (
        <div className="flex-1 overflow-auto">
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Search Query</h2>
                <pre>{JSON.stringify(searchQuery, null, 2)}</pre>
            </div>
            {renderDisplay()}
        </div>
    );
};

export default DisplayData;