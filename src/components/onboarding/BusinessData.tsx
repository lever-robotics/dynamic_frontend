import { useUserConfig } from "@/utils/UserConfigProvider";
import { useState, useEffect } from "react";
import { ConnectionStore } from "./ConnectionStore";
import { ConnectionDetail } from "./ConnectionDetail";
import { DataSourceItem } from "./DataSourceItem";
import { TextareaField } from "./TextareaField";
import gsIcon from "@/assets/gs.png";
import odooIcon from "@/assets/odoo.png";
import shopifyIcon from "@/assets/shopify.png";
import quickBooksIcon from "@/assets/quick_books.png";
import bigqueryIcon from "@/assets/bigquery.png";

interface Entity {
    name: string;
    displayName: string;
    description: string;
    fields: Array<{
        name: string;
        type: string;
        description: string;
        displayName: string;
    }>;
}

interface Connection {
    id: string;
    name: string;
    description: string;
    entities: Entity[];
    isExpanded: boolean;
    icon?: string;
}

const getConnectionIcon = (name: string): string | undefined => {
    switch (name.toLowerCase()) {
        case 'google sheets':
            return gsIcon;
        case 'odoo':
            return odooIcon;
        case 'shopify':
            return shopifyIcon;
        case 'quickbooks':
            return quickBooksIcon;
        case 'bigquery':
            return bigqueryIcon;
        default:
            return undefined;
    }
};

export function BusinessData() {
    const { userConfig, isLoading } = useUserConfig();
    const [showConnectionStore, setShowConnectionStore] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [showConnectionDetail, setShowConnectionDetail] = useState(false);

    const handleSelectConnection = (connection: Connection) => {
        setConnections(prev => 
            prev.map(conn => ({
                ...conn,
                isExpanded: conn.id === connection.id ? !conn.isExpanded : false
            }))
        );

        // If expanding, select the first entity
        if (!connection.isExpanded && connection.entities.length > 0) {
            setSelectedEntity(connection.entities[0]);
        } else if (connection.isExpanded) {
            setSelectedEntity(null);
        }
    };

    const handleSelectEntity = (entity: Entity) => {
        setSelectedEntity(entity);
    };

    // Update connections when userConfig changes
    useEffect(() => {
        if (userConfig?.data_connectors) {
            setConnections(userConfig.data_connectors.map(connector => ({
                id: connector.id,
                name: connector.connection_type,
                description: `Version: ${connector.meta.version}`,
                entities: connector.meta.entities,
                isExpanded: false,
                icon: getConnectionIcon(connector.connection_type)
            })));
        }
    }, [userConfig]);

    return (
        <div className="h-full flex bg-white">
            {/* Left Side - Connections and Entities List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Business Data</h2>
                </div>
                
                <div className="flex-1 overflow-auto p-4 space-y-2">
                    {isLoading ? (
                        <div className="text-gray-500">Loading Data Connectors...</div>
                    ) : connections.length > 0 ? (
                        connections.map((connection) => (
                            <div key={connection.id} className="space-y-2">
                                <DataSourceItem
                                    icon={connection.icon}
                                    label={connection.name}
                                    isActive={connection.isExpanded}
                                    onClick={() => handleSelectConnection(connection)}
                                />
                                {connection.isExpanded && connection.entities.map((entity) => (
                                    <div key={entity.name} className="pl-4">
                                        <DataSourceItem
                                            label={entity.displayName}
                                            isActive={selectedEntity?.name === entity.name}
                                            onClick={() => handleSelectEntity(entity)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500">No data connectors configured.</div>
                    )}
                    
                    <div className="mt-4">
                        <DataSourceItem
                            label="Add Connection"
                            isImage={true}
                            onClick={() => setShowConnectionStore(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Entity Details */}
            <div className="w-2/3 flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {selectedEntity ? selectedEntity.displayName : "Select an Entity"}
                    </h2>
                </div>
                
                <div className="flex-1 overflow-auto p-6">
                    {selectedEntity ? (
                        <section className="flex flex-col -mt-2 leading-relaxed">
                            <h1 className="self-start text-2xl">{selectedEntity.displayName}</h1>

                            <div className="flex flex-col pl-3.5 mt-8 w-full text-sm">
                                <div className="overflow-hidden px-3.5 pt-2.5 pb-6 leading-5 bg-white rounded-md min-h-[71px] text-zinc-500">
                                    {selectedEntity.description}
                                </div>

                                <hr className="shrink-0 mt-3.5 border border-solid bg-stone-300 border-stone-300 h-[3px]" />

                                {selectedEntity.fields.map((field) => (
                                    <TextareaField
                                        key={field.name}
                                        label={field.displayName}
                                        value={field.description}
                                        className="text-zinc-500"
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

            {/* Connection Store Modal */}
            {showConnectionStore && !showConnectionDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <ConnectionStore
                        onClose={() => setShowConnectionStore(false)}
                        onBack={() => setShowConnectionStore(false)}
                        onSelectConnection={(connection) => {
                            setSelectedConnection({
                                id: connection.id,
                                name: connection.name,
                                description: connection.description,
                                entities: [],
                                isExpanded: false,
                                icon: getConnectionIcon(connection.name)
                            });
                            setShowConnectionDetail(true);
                            setShowConnectionStore(false);
                        }}
                    />
                </div>
            )}

            {/* Connection Detail Modal */}
            {showConnectionDetail && selectedConnection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <ConnectionDetail
                        connection={selectedConnection}
                        onClose={() => {
                            setShowConnectionDetail(false);
                            setShowConnectionStore(false);
                        }}
                        onBack={() => setShowConnectionDetail(false)}
                    />
                </div>
            )}
        </div>
    );
} 