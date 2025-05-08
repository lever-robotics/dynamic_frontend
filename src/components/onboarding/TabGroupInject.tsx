import type * as React from "react";

export interface Tab {
	label: string;
	content: React.ReactNode;
}

interface TabGroupInjectProps {
	tabs: Tab[];
	activeTab: string;
}

export const TabGroupInject: React.FC<TabGroupInjectProps> = ({
	tabs,
	activeTab,
}) => {
	console.log("Tabs:", tabs);
	return (
		<nav
			role="tablist"
			className="inline-flex items-center h-10 rounded-lg bg-background p-3 text-muted-foreground"
		>
			{tabs.map((tab) => (
				<Tab
					key={tab.label}
					content={tab.content}
					isActive={tab.label === activeTab}
				/>
			))}
		</nav>
	);
};

interface TabProps {
	content: React.ReactNode;
	isActive: boolean;
}

export const Tab: React.FC<TabProps> = ({ content, isActive }) => {
	return (
		<button
			type="button"
			role="tab"
			aria-selected={isActive}
			className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-20 py-1.5 text-sm font-medium ring-offset-background transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50 text-gray-500
        ${
					isActive
						? "bg-white text-foreground shadow text-gray-900"
						: "hover:text-foreground hover:bg-muted/50"
				}
      `}
		>
			{content}
		</button>
	);
};
