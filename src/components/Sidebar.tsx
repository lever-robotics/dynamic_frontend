import React from 'react';
import {
    Users,
    Group,
    FileText,
    Calendar,
    Activity,
    Box,
    Settings,
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
import { AspectRatio } from "radix-ui";
import logoImg from '../assets/cgLogo.png';

// Sidebar component props
interface SidebarProps {
    schema: any;
    updateSearchQuery: (query: SearchQuery) => void;
}

export const SidebarComp: React.FC<SidebarProps> = ({ schema, updateSearchQuery }) => {
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

    // Extract object types from schema
    const schemaItems = schema.entities.map((type: any) => ({
        title: type.name,
        id: `table_${type.name.toLowerCase().replace(/\s+/g, '_')}`,  // Generate unique ID from name,
        type: 'table' as SearchQueryType,
        icon: getIconForType(type.name)
    }));

    const recommendationsItem = {
        title: 'Recommendations',
        id: 101,
        type: 'recommend' as SearchQueryType,
        icon: Award
    };

    const settingsItem = {
        title: 'Settings',
        id: 102,
        type: 'settings' as SearchQueryType,
        icon: Settings
    };

    const handleLogoClick = () => {
        updateSearchQuery({
            id: 0,
            type: 'all',
            metadata: {
                other: 'home'
            }
        });
    };

    const handleItemClick = (item: any) => {
        updateSearchQuery({
            id: item.id,
            type: item.type,
            metadata: {
                other: item.title.toLowerCase()
            }
        });
    };

    const handleSettingsClick = () => {
        updateSearchQuery({
            id: settingsItem.id,
            type: settingsItem.type,
            metadata: {
                other: settingsItem.title.toLowerCase()
            }
        });
    };

    return (
        <Sidebar className="flex flex-col justify-between h-screen">
            {/* Logo Section */}
            <div
                className="p-6 pl-4 cursor-pointer hover:bg-anakiwa-50 transition-colors"
                onClick={handleLogoClick}
            >
                <AspectRatio.Root ratio={22 / 6}>
                    <img
                        src={logoImg}
                        alt="logo"
                        className="w-full h-full object-contain"
                    />
                </AspectRatio.Root>
            </div>

            {/* Main Menu Section */}
            <SidebarContent className="flex-1 ml-1 justify-center">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {schemaItems.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => handleItemClick(recommendationsItem)}
                                >
                                    <recommendationsItem.icon className="w-4 h-4" />
                                    <span>{recommendationsItem.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Settings Section - Moved to bottom like in AppSidebar */}
            <SidebarContent className="pb-4 ml-1 justify-end">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleSettingsClick}
                                >
                                    <settingsItem.icon className="w-4 h-4" />
                                    <span>{settingsItem.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export default SidebarComp;