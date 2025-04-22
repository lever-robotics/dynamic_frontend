import { useState, useEffect } from "react";
import { ConnectionStore } from "./ConnectionStore";
import { ConnectionDetail } from "./ConnectionDetail";
import { ConnectionManagement } from "./ConnectionManagement";
import gsIcon from "@/assets/gs.png";
import odooIcon from "@/assets/odoo.png";
import shopifyIcon from "@/assets/shopify.png";
import quickBooksIcon from "@/assets/quick_books.png";
import bigqueryIcon from "@/assets/bigquery.png";
import { useUserConfig } from "@/utils/UserConfigProvider";

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

        if (!connection.isExpanded && connection.entities.length > 0) {
            setSelectedEntity(connection.entities[0]);
        } else if (connection.isExpanded) {
            setSelectedEntity(null);
        }
    };

    const handleSelectEntity = (entity: Entity) => {
        setSelectedEntity(entity);
    };

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
        <div className="h-full">
            <ConnectionManagement
                connections={connections}
                selectedEntity={selectedEntity}
                isLoading={isLoading}
                onSelectConnection={handleSelectConnection}
                onSelectEntity={handleSelectEntity}
                onAddConnection={() => setShowConnectionStore(true)}
            />

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