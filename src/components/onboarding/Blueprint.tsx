import { useCallback, useState } from "react";
import { Modal } from "../common/Modal";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { ToolProvider } from "@/contexts/ToolContext";
import type { FlagChunk } from "@/types/chat";
import { ConnectionStore } from "./ConnectionStore";
import { ConnectionDetail } from "./ConnectionDetail";

interface Connection {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface BlueprintProps {
    onClose: () => void;
    businessInfo?: {
        name: string;
        url: string;
    };
}

export function Blueprint({ onClose, businessInfo }: BlueprintProps) {
    const [showConnectionStore, setShowConnectionStore] = useState(false);
    const [showConnectionDetail, setShowConnectionDetail] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

    const sendOnConnect = useCallback(() => {
        if (businessInfo) {
            return {
                type: "flag",
                flag: "blueprint",
                context: JSON.stringify(businessInfo),
            } as FlagChunk;
        }
        return null;
    }, [businessInfo]);

    const handleSelectConnection = (connection: Connection) => {
        setSelectedConnection(connection);
        setShowConnectionDetail(true);
    };

    const handleClose = () => {
        // Reset all states
        setShowConnectionStore(false);
        setShowConnectionDetail(false);
        setSelectedConnection(null);
        // Close the modal
        onClose();
    };

    return (
        <ToolProvider>
            <Modal isOpen={true} onClose={handleClose} size="xl">
                <div className="relative h-[93vh] w-full">
                    {!showConnectionStore && !showConnectionDetail && (
                        <div className="flex h-full">
                            <LeftPanel />
                            <RightPanel 
                                sendOnConnect={sendOnConnect}
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </ToolProvider>
    );
} 