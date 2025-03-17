import React from 'react';

interface MainEntityDataProps {
    data: any;
}

const MainEntityData: React.FC<MainEntityDataProps> = ({ data }) => {
    const mainData = Object.entries(data).filter(
        ([key, value]) => !key.endsWith("Collection") && !key.startsWith("__") && value !== null
    );

    return (
        <div className="bg-white border-anakiwa-950/10 border rounded-xl shadow p-6">
            <div className="grid gap-3">
                {mainData.map(([key, value]) => (
                    <div
                        key={key}
                        className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-0"
                    >
                        <span className="text-gray-600 font-medium">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="col-span-2 text-gray-800">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>

    );
};

export default MainEntityData;