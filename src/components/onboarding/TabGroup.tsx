import * as React from "react";

interface TabGroupProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      role="tablist"
      className="inline-flex items-center h-10 rounded-lg bg-background p-3 text-muted-foreground"
    >
      {tabs.map((tab, index) => (
        <Tab
          key={tab}
          label={tab}
          isActive={index === activeTab}
          onClick={() => onTabChange(index)}
        />
      ))}
    </nav>
  );
};

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-20 py-1.5 text-sm font-medium ring-offset-background transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50 text-gray-500
        ${isActive 
          ? "bg-white text-foreground shadow text-gray-900" 
          : "hover:text-foreground hover:bg-muted/50"
        }
      `}
    >
      {label}
    </button>
  );
}; 