import React from 'react';
import { SearchQuery } from './LeverApp';
import AllDisplay from './AllDisplay';
import TableDisplay from './TableDisplay';
import ObjectDisplay from './ObjectDisplay';
import RecommendDisplay from './RecommendDisplay';
import SettingsDisplay from './SettingsDisplay';

// Display component props
interface DisplayDataProps {
    schema: any;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}

// Main DisplayData component
export const DisplayData: React.FC<DisplayDataProps> = ({
    schema,
    searchQuery,
    updateSearchQuery
}) => {
    console.log('DisplayData searchQuery:', searchQuery);

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
                // AI display is now handled in the sidebar
                return <div className="p-4">AI chat is available in the sidebar</div>;
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
        <div className="flex-1 overflow-auto w-full px-4">
            {/* <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Search Query</h2>
                <pre>{JSON.stringify(searchQuery, null, 2)}</pre>
            </div> */}
            {renderDisplay()}
        </div>
    );
};

export default DisplayData;