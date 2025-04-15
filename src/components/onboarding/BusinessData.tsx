import { useUserConfig } from "@/utils/UserConfigProvider";

export function BusinessData() {
    const { userConfig, isLoading } = useUserConfig();

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Business Data</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {isLoading ? (
                    <div className="bg-gray-50 p-6 rounded-lg">
                        Loading Data Connectors...
                    </div>
                ) : userConfig?.data_connectors && userConfig.data_connectors.length > 0 ? (
                    <div className="space-y-4">
                        {userConfig.data_connectors.map((connector) => (
                            <div key={connector.name} className="bg-white p-6 rounded-lg shadow-sm border">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{connector.name}</h3>
                                        <p className="text-sm text-gray-500">{connector.type}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            connector.status === 'connected' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {connector.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 p-6 rounded-lg">
                        No data connectors configured.
                    </div>
                )}
            </div>
        </div>
    );
} 