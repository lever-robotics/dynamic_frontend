import { cn } from "@/lib/utils";
import type * as React from "react";

export interface Tab {
	label: string;
	content: React.ReactNode;
}

export interface TabGroupInjectProps {
	tabs: Tab[];
	activeTab: string;
	className?: string;
}

export const TabGroupInject: React.FC<TabGroupInjectProps> = ({
	tabs,
	activeTab,
	className,
}) => {
	return (
		<nav
			role="tablist"
			className={cn("inline-flex items-center gap-2", className)}
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

const Tab: React.FC<TabProps> = ({ content, isActive }) => {
	return (
		<button
			type="button"
			role="tab"
			aria-selected={isActive}
			tabIndex={isActive ? 0 : -1}
			className={cn(
				"transition-all",
				isActive ? "opacity-100" : "opacity-50 hover:opacity-75",
			)}
		>
			{content}
		</button>
	);
};
