import React from 'react';
import {
    Users,
    Group,
    FileText,
    Calendar,
    Activity,
    Box,
    Settings,
    List,
    Award
} from 'lucide-react';
import { SearchQuery, SearchQueryType } from './LeverApp';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from "../components/ui/sidebar";

// Icon mapping for different object types
const iconMapping: { [key: string]: any } = {
    Individual: Users,
    Volunteer: Users,
    Staff: Users,
    Group: Group,
    ProgressNote: FileText,
    Event: Calendar,
    Activity: Activity,
    Equipment: Box,
};

// Function to get icon for a type
const getIconForType = (typeName: string) => {
    return iconMapping[typeName] || Box;
};

// Sidebar component props
interface SidebarProps {
    schema: any;
    updateSearchQuery: (query: SearchQuery) => void;
}

export const SidebarComp: React.FC<SidebarProps> = ({ schema, updateSearchQuery }) => {
    // Extract object types from schema
    const schemaItems = schema.object_types
        ? schema.object_types
            .filter((type: any) => !type.name.includes('Mention'))
            .map((type: any) => ({
                title: type.name,
                id: type.id,
                type: 'table' as SearchQueryType,
                icon: getIconForType(type.name)
            }))
        : [];

    // Predefined sidebar actions
    const additionalActions = [
        {
            title: 'Recommendations',
            id: 1,
            type: 'recommend' as SearchQueryType,
            icon: Award
        },
        {
            title: 'Settings',
            id: 1,
            type: 'settings' as SearchQueryType,
            icon: Settings
        }
    ];

    // Combine schema items and additional actions
    const sidebarItems = [...schemaItems, ...additionalActions];

    return (
        <Sidebar className="flex flex-col justify-between h-screen">
            <SidebarContent className="flex-1 ml-1 justify-center">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sidebarItems.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        onClick={() => updateSearchQuery({
                                            id: item.id,
                                            type: item.type,
                                            metadata: {
                                                other: item.title.toLowerCase()
                                            }
                                        })}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export default SidebarComp;