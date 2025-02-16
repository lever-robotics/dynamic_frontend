import React from 'react';
import { SearchQuery, SearchQueryType } from './LeverApp';

// Sidebar component props
interface SidebarProps {
    schema: any;
    updateSearchQuery: (query: SearchQuery) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ schema, updateSearchQuery }) => {
    // Extract object types from schema
    const schemaItems = schema.object_types
        ? schema.object_types
            .filter((type: any) => !type.name.includes('Mention'))
            .map((type: any) => ({
                title: type.name,
                id: type.id,
                data: type.table_name || type.name.toLowerCase(),
                type: 'object' as SearchQueryType
            }))
        : [];

    // Predefined sidebar actions
    const additionalActions = [
        {
            title: 'Recommendations',
            id: 1,
            data: 'recommend',
            type: 'recommend' as SearchQueryType
        },
        {
            title: 'Settings',
            id: 1,
            data: 'settings',
            type: 'settings' as SearchQueryType
        }
    ];

    // Combine schema items and additional actions
    const sidebarItems = [...schemaItems, ...additionalActions];

    return (
        <div className="w-64 bg-gray-100 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {sidebarItems.map((item) => (
                    <button
                        key={item.id}
                        className="w-full p-3 text-left hover:bg-gray-200"
                        onClick={() => updateSearchQuery({
                            id: item.id,
                            data: item.data,
                            type: item.type
                        })}
                    >
                        {item.title}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;