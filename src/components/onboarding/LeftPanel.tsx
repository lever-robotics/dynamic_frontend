import { useState } from "react";
import { BusinessData } from "./BusinessData";
import { BusinessOverview } from "./BusinessOverview";
import { TabGroup } from "./TabGroup";

export function LeftPanel() {
	const [activeTab, setActiveTab] = useState(0);
	const tabs = ["Business Overview", "Business Data"];

	return (
		<div className="w-[800px] border-r border-gray-200 h-full flex flex-col">
			<div className="flex justify-center py-6">
				<TabGroup
					tabs={tabs}
					activeTab={tabs[activeTab]}
					onTabChange={(tab) => setActiveTab(tabs.indexOf(tab))}
				/>
			</div>
			<div className="flex-1 overflow-auto">
				{activeTab === 0 ? <BusinessOverview /> : <BusinessData />}
			</div>
		</div>
	);
}
