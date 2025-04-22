import { DataSourceItem } from "./DataSourceItem";

interface Connection {
    id: string;
    name: string;
    description: string;
    entities: Array<{
        name: string;
        displayName: string;
        description: string;
    }>;
    isExpanded: boolean;
    icon?: string;
}

interface ConnectionsListProps {
    connections: Connection[];
    selectedEntityName: string | null;
    isLoading: boolean;
    onSelectConnection: (connection: Connection) => void;
    onSelectEntity: (entity: { name: string; displayName: string; description: string }) => void;
    onAddConnection: () => void;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({
    connections,
    selectedEntityName,
    isLoading,
    onSelectConnection,
    onSelectEntity,
    onAddConnection,
}) => {
    return (
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Business Data</h2>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-2">
                {isLoading ? (
                    <div className="text-gray-500">Loading Data Connectors...</div>
                ) : connections.length > 0 ? (
                    connections.map((connection) => (
                        <div key={connection.id} className="space-y-1">
                            <DataSourceItem
                                icon={connection.icon}
                                label={connection.name}
                                isActive={connection.isExpanded}
                                onClick={() => onSelectConnection(connection)}
                            />
                            {connection.isExpanded && connection.entities.map((entity) => (
                                <div 
                                    key={entity.name} 
                                    className="pl-4"
                                    onClick={() => onSelectEntity(entity)}
                                >
                                    <div 
                                        className={`px-3 py-1.5 text-sm rounded-md cursor-pointer ${
                                            selectedEntityName === entity.name 
                                                ? 'bg-stone-100 text-stone-900' 
                                                : 'text-stone-600 hover:bg-stone-50'
                                        }`}
                                    >
                                        {entity.displayName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500">No data connectors configured.</div>
                )}
                
                <div 
                    className="mt-4 flex items-center justify-between px-3 py-2 text-sm text-stone-600 bg-stone-50 rounded-md cursor-pointer hover:bg-stone-100"
                    onClick={onAddConnection}
                >
                    <span>Add Connection</span>
                    <span className="text-stone-400">+</span>
                </div>
            </div>
        </div>
    );
}; 