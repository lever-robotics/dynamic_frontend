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
// import logoImg from '@/assets/cgLogo.png';
// import logoImg from '@/assets/hydrojug.png';
// import logoImg from '@/assets/ecommerce.png';
import logoImg from '@/assets/lever-nobg.png';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface SidebarProps {
    setShowSettings: (show: boolean) => void;
}

export const SidebarComp: React.FC<SidebarProps> = ({
    setShowSettings,
}) => {
    const { state: { threads, currentThreadId }, switchThread } = useWorkspace();

    const handleLogoClick = () => {
        // TODO: Add home page
    };

    const handleThreadClick = (threadId: string) => {
        switchThread(threadId);
    };

    const handleSettingsClick = () => {
        setShowSettings(true);
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
                            {threads.map((thread) => (
                                <SidebarMenuItem key={thread.id}>
                                    <SidebarMenuButton
                                        onClick={() => handleThreadClick(thread.id)}
                                        className={`w-full ${currentThreadId === thread.id ? 'bg-anakiwa-100' : ''}`}
                                    >
                                        <span className="truncate max-w-[180px]">
                                            {thread.name}
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Settings Section */}
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