import type * as React from "react";
import { useState } from "react";
import gsIcon from "@/assets/gs.png";
import odooIcon from "@/assets/odoo.png";
import shopifyIcon from "@/assets/shopify.png";
import quickBooksIcon from "@/assets/quick_books.png";
import bigqueryIcon from "@/assets/bigquery.png";
import { BackArrow } from '../common/BackArrow';
import { Modal } from '../common/Modal';

interface Connection {
    id: string;
    name: string;
    description: string;
    icon: string;
    isAvailable: boolean;
    isConnected?: boolean;
}

interface ConnectionStoreProps {
    onClose: () => void;
    onBack: () => void;
    onSelectConnection: (connection: Connection) => void;
}

interface ConnectionCardProps {
    connection: Connection;
    isHovering: string | null;
    setIsHovering: (value: string | null) => void;
    onClick: () => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
    connection,
    isHovering,
    setIsHovering,
    onClick,
}) => {
    return (
        <button
            type="button"
            className={`flex gap-4 items-center p-4 rounded-xl border cursor-pointer transition-all w-full ${
                !connection.isAvailable ? "opacity-50 cursor-not-allowed" : ""
            } ${connection.isConnected ? "border-primary-500 bg-primary-50" : ""}`}
            onMouseEnter={() => connection.isAvailable && setIsHovering(connection.name)}
            onMouseLeave={() => setIsHovering(null)}
            onClick={() => connection.isAvailable && onClick()}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    connection.isAvailable && onClick();
                }
            }}
            style={{
                background:
                    isHovering === connection.name
                        ? "rgb(var(--primary-200))"
                        : connection.isConnected
                        ? "rgb(var(--primary-300))"
                        : "white",
            }}
        >
            <img
                className={`w-10 h-10 ${!connection.isAvailable ? "grayscale" : ""}`}
                src={connection.icon}
                alt={`${connection.name} icon`}
            />
            <div className="flex flex-col items-start">
                <h3 className="text-base font-medium text-neutral-900">
                    {connection.name}
                </h3>
                <p className="text-sm text-stone-500">{connection.description}</p>
                {connection.isConnected && (
                    <p className="text-xs text-primary-600 mt-1">Connected</p>
                )}
            </div>
        </button>
    );
};

const mockConnections: Connection[] = [
    {
        id: '1',
        name: 'Google Sheets',
        description: 'Connect your spreadsheets',
        icon: gsIcon,
        isAvailable: true
    },
    {
        id: '2',
        name: 'BigQuery',
        description: 'Google BigQuery integration',
        icon: bigqueryIcon,
        isAvailable: true
    },
    {
        id: '3',
        name: 'Odoo',
        description: 'ERP integration',
        icon: odooIcon,
        isAvailable: true
    },
    {
        id: '4',
        name: 'Shopify',
        description: 'E-commerce platform',
        icon: shopifyIcon,
        isAvailable: true
    },
    {
        id: '5',
        name: 'QuickBooks',
        description: 'Accounting software',
        icon: quickBooksIcon,
        isAvailable: false
    }
];

export const ConnectionStore: React.FC<ConnectionStoreProps> = ({ onClose, onBack, onSelectConnection }) => {
    const [isHovering, setIsHovering] = useState<string | null>(null);

    const availableConnections = mockConnections.filter(conn => conn.isAvailable);
    const futureConnections = mockConnections.filter(conn => !conn.isAvailable);

    return (
        <Modal isOpen={true} onClose={onClose} size="xl" showCloseButton={false}>
            <div className="flex flex-col h-full">
                <div className="flex items-center p-4 border-b">
                    <BackArrow onClick={onBack} />
                    <h2 className="text-xl font-semibold ml-4">Connection Store</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col gap-6">
                            <section className="flex flex-col gap-4">
                                <h3 className="text-sm font-medium text-zinc-800">
                                    Available Connections
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {availableConnections.map((connection) => (
                                        <ConnectionCard
                                            key={connection.id}
                                            connection={connection}
                                            isHovering={isHovering}
                                            setIsHovering={setIsHovering}
                                            onClick={() => onSelectConnection(connection)}
                                        />
                                    ))}
                                </div>
                            </section>

                            {futureConnections.length > 0 && (
                                <section className="flex flex-col gap-4">
                                    <h3 className="text-sm font-medium text-zinc-800">
                                        Coming Soon
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {futureConnections.map((connection) => (
                                            <ConnectionCard
                                                key={connection.id}
                                                connection={connection}
                                                isHovering={isHovering}
                                                setIsHovering={setIsHovering}
                                                onClick={() => onSelectConnection(connection)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}; 