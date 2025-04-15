import { useState } from 'react';
import { TabGroup } from './TabGroup';
import { BusinessOverview } from './BusinessOverview';
import { BusinessData } from './BusinessData';

export function LeftPanel() {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ["Business Overview", "Business Data"];

    return (
        <div className="w-[800px] border-r border-gray-200 h-full flex flex-col">
            <div className="flex justify-center py-6">
                <TabGroup 
                    tabs={tabs} 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                />
            </div>
            <div className="flex-1 overflow-auto">
                {activeTab === 0 ? (
                    <BusinessOverview />
                ) : (
                    <BusinessData />
                )}
            </div>
        </div>
    );
} 