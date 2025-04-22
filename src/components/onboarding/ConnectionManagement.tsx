import { DataSourceItem } from "./DataSourceItem";
import { TextareaField } from "./TextareaField";
import { useUserConfig } from "@/utils/UserConfigProvider";

interface Connection {
    id: string;
    name: string;
    description: string;
    entities: Array<{
        name: string;
        displayName: string;
        description: string;
        fields: Array<{
            name: string;
            type: string;
            description: string;
            displayName: string;
        }>;
    }>;
    isExpanded: boolean;
    icon?: string;
}

interface ConnectionManagementProps {
    connections: Connection[];
    selectedEntity: {
        name: string;
        displayName: string;
        description: string;
        fields: Array<{
            name: string;
            type: string;
            description: string;
            displayName: string;
        }>;
    } | null;
    isLoading: boolean;
    onSelectConnection: (connection: Connection) => void;
    onSelectEntity: (entity: { name: string; displayName: string; description: string }) => void;
    onAddConnection: () => void;
}

export const ConnectionManagement: React.FC<ConnectionManagementProps> = ({
    connections,
    selectedEntity,
    isLoading,
    onSelectConnection,
    onSelectEntity,
    onAddConnection,
}) => {
    const { updateConnectionMeta } = useUserConfig();

    const handleFieldUpdate = async (connectionId: string, entityName: string, fieldName: string, newValue: string) => {
        const connection = connections.find(conn => conn.id === connectionId);
        if (!connection) return;

        const updatedEntities = connection.entities.map(entity => {
            if (entity.name === entityName) {
                return {
                    ...entity,
                    fields: entity.fields.map(field => 
                        field.name === fieldName 
                            ? { ...field, description: newValue }
                            : field
                    )
                };
            }
            return entity;
        });

        try {
            await updateConnectionMeta(connectionId, {
                version: '1.0',
                entities: updatedEntities
            });
        } catch (error) {
            console.error('Failed to update field description:', error);
        }
    };

    return (
        <div className="h-full flex bg-white">
            {/* Left Side - Connections List */}
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
                                        onKeyDown={(e) => e.key === 'Enter' && onSelectEntity(entity)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div 
                                            className={`px-3 py-1.5 text-sm rounded-md cursor-pointer ${
                                                selectedEntity?.name === entity.name 
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
                        onKeyDown={(e) => e.key === 'Enter' && onAddConnection()}
                        role="button"
                        tabIndex={0}
                    >
                        <span>Add Connection</span>
                        <span className="text-stone-400">+</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Entity Details */}
            <div className="w-2/3 flex flex-col">
                <div className="flex-1 overflow-auto p-6">
                    {selectedEntity ? (
                        <section className="flex flex-col -mt-2 leading-relaxed">
                            <h1 className="self-start text-2xl">{selectedEntity.displayName}</h1>

                            <div className="flex flex-col pl-3.5 mt-8 w-full text-sm">
                                <TextareaField
                                    label=""
                                    value={selectedEntity.description}
                                    state="user"
                                    onUpdate={async (newValue) => {
                                        const connection = connections.find(conn => 
                                            conn.entities.some(entity => entity.name === selectedEntity.name)
                                        );
                                        if (connection) {
                                            await handleFieldUpdate(connection.id, selectedEntity.name, 'description', newValue);
                                        }
                                    }}
                                />

                                <hr className="shrink-0 mb-4 border border-solid bg-stone-300 border-stone-300 h-[1px]" />

                                {selectedEntity.fields.map((field) => (
                                    <TextareaField
                                        key={field.name}
                                        label={field.displayName}
                                        value={field.description}
                                        state={field.description ? 'user' : 'blank'}
                                        onUpdate={async (newValue) => {
                                            const connection = connections.find(conn => 
                                                conn.entities.some(entity => entity.name === selectedEntity.name)
                                            );
                                            if (connection) {
                                                await handleFieldUpdate(connection.id, selectedEntity.name, field.name, newValue);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </section>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select an entity to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 