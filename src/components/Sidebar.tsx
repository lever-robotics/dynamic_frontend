import type React from 'react';
import {
    Settings,
} from 'lucide-react';
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

export const SidebarComp: React.FC = () => {

    const handleLogoClick = () => {
        // TODO: Add home page
    };

    const handleItemClick = () => {
        // TODO: Add item click
    };

    const handleSettingsClick = () => {
        // TODO: Add settings click
    };

    return (
        <Sidebar className="flex flex-col justify-between h-screen">
            {/* Logo Section */}
            <div
                className="p-6 pl-4 cursor-pointer hover:bg-anakiwa-50 transition-colors"
                onClick={handleLogoClick}
                onKeyDown={handleLogoClick}
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
                          {/* TODO: Add menu items */}
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
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
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