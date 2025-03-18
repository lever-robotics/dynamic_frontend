import type React from 'react';
import {
    Users,
    Group,
    FileText,
    Calendar,
    Activity,
    Box,
    Settings,
    Award,
    Network
} from 'lucide-react';
import type { SearchQuery, SearchQueryType } from './LeverApp';
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
import logoImg from '@/assets/cgLogo.png';
import type { Blueprint } from "@/types/blueprint";
import type { LucideIcon } from 'lucide-react';

// Sidebar component props
interface SidebarProps {
    blueprint: Blueprint;
    updateSearchQuery: (query: SearchQuery) => void;
}

interface SidebarItem {
    title: string;
    // id: number;
    type: SearchQueryType;
    icon: LucideIcon;
}

export const SidebarComp: React.FC<SidebarProps> = ({ blueprint, updateSearchQuery }) => {
    // Icon mapping for different object types
    const iconMapping: { [key: string]: LucideIcon } = {
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
    const schemaItems: SidebarItem[] = blueprint.entities.map((type: any) => ({
        title: type.name,
        // id: `${type.name}`,  // Generate unique ID from name,
        type: 'table' as SearchQueryType,
        icon: getIconForType(type.name)
    }));

    const recommendationsItem: SidebarItem = {
        title: 'Recommendations',
        // id: 101,
        type: 'recommend' as SearchQueryType,
        icon: Award
    };

    const graphItem: SidebarItem = {
        title: 'Knowledge Graph',
        // id: 102,
        type: 'graph' as SearchQueryType,
        icon: Network
    };

    const settingsItem: SidebarItem = {
        title: 'Settings',
        // id: 103,
        type: 'settings' as SearchQueryType,
        icon: Settings
    };

    const handleLogoClick = () => {
        updateSearchQuery({
            type: 'all',
            name: '',
            metadata: {
                other: 'home'
            }
        });
    };

    const handleItemClick = (item: SidebarItem) => {
        updateSearchQuery({
            type: item.type,
            name: item.title,
            metadata: {
                other: item.title.toLowerCase()
            }
        });
    };

    const handleSettingsClick = () => {
        updateSearchQuery({
            type: settingsItem.type,
            name: '',
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
                                <SidebarMenuItem key={item.title}>
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
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => handleItemClick(graphItem)}
                                >
                                    <graphItem.icon className="w-4 h-4" />
                                    <span>{graphItem.title}</span>
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