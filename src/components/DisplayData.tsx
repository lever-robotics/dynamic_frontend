import React from 'react';
import { SearchQuery, SearchQueryType } from './LeverApp';

// Display component props
interface DisplayDataProps {
    schema: any;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}

// Individual display components
const ObjectDisplay: React.FC<DisplayDataProps> = ({ schema, searchQuery }) => {
    // Find the specific object type based on the search query
    const objectType = schema.object_types.find(
        (type: any) => type.id === searchQuery?.id
    );

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Object: {objectType?.name}</h2>
            {objectType ? (
                <div>
                    <h3 className="font-semibold">Fields:</h3>
                    <ul>
                        {objectType.metadata.fields.map((field: any) => (
                            <li key={field.name} className="mb-2">
                                <strong>{field.name}</strong>: {field.description}
                                <span className="text-gray-500 ml-2">(Type: {field.type})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No object type found</p>
            )}
        </div>
    );
};

const TableDisplay: React.FC<DisplayDataProps> = ({ searchQuery }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Tables</h2>
            <p>Table search for: {searchQuery?.data}</p>
        </div>
    );
};

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

const AllDisplay: React.FC<DisplayDataProps> = ({ schema }) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">All Objects</h2>
            {schema.object_types.map((type: any) => (
                <div key={type.id} className="mb-4">
                    <h3 className="font-semibold">{type.name}</h3>
                    <p>{type.metadata.description}</p>
                </div>
            ))}
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
            {renderDisplay()}
        </div>
    );
};

export default DisplayData;