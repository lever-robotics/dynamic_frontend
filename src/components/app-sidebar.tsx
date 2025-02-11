// src/components/app-sidebar.tsx
import { Activity, Users, Calendar, FileText, Group, Box, Settings } from "lucide-react"
import schemaData from '../assets/odoo_schema.json';
import logoImg from "../assets/cgLogo.png";
import { AspectRatio } from "radix-ui";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

interface AppSidebarProps {
  onTableSelect: (tableName: string) => void;
}

export function AppSidebar({ onTableSelect }: AppSidebarProps) {
  const schemaItems = schemaData.object_types
    .filter(type => !type.name.includes('Mention'))
    .map(type => ({
      title: type.name,
      table_name: type.table_name,
      icon: getIconForType(type.name),
    }));
  
  const handleLogoClick = () => {
    // Pass empty string or null to clear table selection
    onTableSelect('logo-table');
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
                    onClick={() => onTableSelect(item.table_name)}
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

      {/* Settings Section */}
      <SidebarContent className="pb-4 ml-1 justify-end">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onTableSelect('settings')}
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
}