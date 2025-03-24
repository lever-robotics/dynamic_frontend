import React, { useState } from 'react';
import { SearchQuery } from './LeverApp';
import AllDisplay from './AllDisplay';
import TableDisplay from './TableDisplay';
import ObjectDisplay from './ObjectDisplay';
import RecommendDisplay from './RecommendDisplay';
import SettingsDisplay from './SettingsDisplay';
import KnowledgeGraph from './KnowledgeGraph';
import { AIChatSidebar } from './AIChatSidebar';
import { Blueprint } from '@/types/blueprint';

// Display component props
interface DisplayDataProps {
    blueprint: Blueprint;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
    onAIChatVisibilityChange: (show: boolean) => void;
}

// Main DisplayData component
export const DisplayData: React.FC<DisplayDataProps> = ({
    blueprint,
    searchQuery,
    updateSearchQuery,
    onAIChatVisibilityChange
}) => {
    const [showAIChat, setShowAIChat] = useState(false);
    const [currentAISearchQuery, setCurrentAISearchQuery] = useState<SearchQuery | null>(null);

    // Handle new search queries
    React.useEffect(() => {
        if (searchQuery?.type === 'ai') {
            // Set the new search query and show the chat
            setCurrentAISearchQuery(searchQuery);
            setShowAIChat(true);
            onAIChatVisibilityChange(true);
        }
    }, [searchQuery, onAIChatVisibilityChange]);

    const handleCloseSidebar = () => {
        setShowAIChat(false);
        onAIChatVisibilityChange(false);
        // Clear the current AI search query to ensure a fresh start next time
        setCurrentAISearchQuery(null);
    };

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
                return <div></div>;
            case 'recommend':
                return <RecommendDisplay blueprint={blueprint} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'all':
                return <AllDisplay blueprint={blueprint} searchQuery={searchQuery} updateSearchQuery={updateSearchQuery} />;
            case 'settings':
                return <SettingsDisplay />;
            case 'graph':
                return <KnowledgeGraph blueprint={blueprint} />;
            default:
                return <div className="p-4">Unknown search type</div>;
        }
    };

    return (
        <div className="flex-1 overflow-auto w-full px-4 relative">
            {/* <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Search Query</h2>
                <pre>{JSON.stringify(searchQuery, null, 2)}</pre>
            </div> */}
            {renderDisplay()}
            <div className={`fixed right-0 top-0 h-full w-[499px] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${showAIChat ? 'translate-x-0' : 'translate-x-full'}`}>
                {showAIChat && currentAISearchQuery && (
                    <AIChatSidebar
                        searchQuery={currentAISearchQuery}
                        onClose={handleCloseSidebar}
                    />
                )}
            </div>
            {/* Add a semi-transparent overlay when sidebar is open */}
            {showAIChat && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-25 z-40"
                    onClick={handleCloseSidebar}
                />
            )}
        </div>
    );
};

export default DisplayData;