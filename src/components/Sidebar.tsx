// import logoImg from '@/assets/cgLogo.png';
// import logoImg from '@/assets/hydrojug.png';
// import logoImg from '@/assets/ecommerce.png';
import logoImg from "@/assets/lever-nobg.png";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";
import { Database, LayoutTemplate, PlusCircle, Settings } from "lucide-react";
import { AspectRatio } from "radix-ui";
import type React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../components/ui/sidebar";

interface SidebarProps {
	setShowSettings: (show: boolean) => void;
	setShowLaunchChat: (show: boolean) => void;
	setShowBlueprint: (show: boolean) => void;
	setIsLaunchMode: (isLaunchMode: boolean) => void;
	handleQueryDataClick: () => Promise<void>;
}

export const SidebarComp: React.FC<SidebarProps> = ({
	setShowSettings,
	setShowLaunchChat,
	setShowBlueprint,
	setIsLaunchMode,
	handleQueryDataClick,
}) => {
	const {
		state: { threads, currentThreadId },
		switchThread,
		addArtifact,
		setView,
	} = useWorkspace();

	const handleLogoClick = () => {
		// TODO: Add home page
	};

	const handleThreadClick = (threadId: string) => {
		switchThread(threadId);
		setShowLaunchChat(false);
		setView("DocViewer");
		setIsLaunchMode(false);
	};

	const handleSettingsClick = () => {
		setShowSettings(true);
	};

	const handleNewAnalysisClick = () => {
		switchThread("");
		setShowLaunchChat(true);
	};

	const handleBlueprintClick = () => {
		setShowBlueprint(true);
	};

	return (
		<Sidebar className="flex flex-col justify-between h-screen">
			{/* Logo Section */}
			<div
				className="p-6 pl-4"
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
			<SidebarContent className="flex-1 ml-1 flex flex-col">
				<SidebarGroup className="flex flex-col h-full">
					<SidebarGroupContent className="flex flex-col h-full">
						{/* Fixed top divider */}
						<div className="px-4 py-2 flex-shrink-0">
							<hr className="border-t border-gray-200" />
						</div>

						{/* Scrollable threads list */}
						<div className="flex-1 overflow-y-auto scrollbar-hide">
							<SidebarMenu>
								{threads.map((thread) => (
									<SidebarMenuItem key={thread.id}>
										<SidebarMenuButton
											onClick={() => handleThreadClick(thread.id)}
											className={`w-full ${currentThreadId === thread.id ? "bg-anakiwa-100" : ""}`}
										>
											<span className="truncate max-w-[180px]">
												{thread.name}
											</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</div>

						{/* Fixed bottom button */}
						<div className="px-4 py-2 mt-4 flex-shrink-0">
							<Button
								onClick={handleNewAnalysisClick}
								className={cn(
									"bg-primary-600 hover:bg-primary-700",
									"text-white",
									"flex items-center justify-between",
									"border-0",
								)}
							>
								<PlusCircle className="h-4 w-4" />
								<span>Start New Analysis</span>
							</Button>
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* Settings Section */}
			<SidebarContent className="pb-4 ml-1 justify-end">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton onClick={handleQueryDataClick}>
									<Database className="w-4 h-4" />
									<span>Query Data</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton onClick={handleBlueprintClick}>
									<LayoutTemplate className="w-4 h-4" />
									<span>Blueprint</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton onClick={handleSettingsClick}>
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
