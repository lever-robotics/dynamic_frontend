import type React from 'react';
import type { SearchQuery } from './LeverApp';
import type { Blueprint } from '@/types/blueprint';
import AllDisplay from './AllDisplay';
import TableDisplay from './TableDisplay';
import ObjectDisplay from './ObjectDisplay';
import AIDisplay from './AIDisplay';
import RecommendDisplay from './RecommendDisplay';
import SettingsDisplay from './SettingsDisplay';
import KnowledgeGraph from './KnowledgeGraph';

// Display component props
interface DisplayDataProps {
    blueprint: Blueprint;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}

// Main DisplayData component
export const DisplayData: React.FC<DisplayDataProps> = ({
    blueprint,
    searchQuery,
    updateSearchQuery
}) => {
    // Render different components based on search query type
    const renderDisplay = () => {
        if (!searchQuery) {
            return <div className="p-4">No search query selected</div>;
        }
        console.log("searchQuery.type", searchQuery.type);
        switch (searchQuery.type) {
            case 'object':
                return <ObjectDisplay blueprint={blueprint} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'table':
                return <TableDisplay blueprint={blueprint} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'ai':
                return <AIDisplay blueprint={blueprint} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'recommend':
                return <RecommendDisplay blueprint={blueprint} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'all':
                return <AllDisplay blueprint={blueprint} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'settings':
                return <SettingsDisplay />;
            case 'graph':
                return <KnowledgeGraph blueprint={blueprint} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            default:
                return <div className="p-4">Unknown search type</div>;
        }
    };

    return (
        <div className="flex-1 overflow-auto">
            {/* <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Search Query</h2>
                <pre>{JSON.stringify(searchQuery, null, 2)}</pre>
            </div> */}
            {renderDisplay()}
        </div>
    );
};

export default DisplayData;