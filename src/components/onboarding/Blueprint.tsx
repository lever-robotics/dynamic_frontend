import { useCallback } from "react";
import { Modal } from "../common/Modal";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { ToolProvider } from "@/contexts/ToolContext";
import type { FlagChunk } from "@/types/chat";

interface BlueprintProps {
    onClose: () => void;
    businessInfo?: {
        name: string;
        url: string;
    };
}

export function Blueprint({ onClose, businessInfo }: BlueprintProps) {
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

    return (
        <ToolProvider>
            <Modal isOpen={true} onClose={onClose} size="xl">
                <div className="flex h-[90vh]">
                    <LeftPanel />
                    <RightPanel sendOnConnect={sendOnConnect} />
                </div>
            </Modal>
        </ToolProvider>
    );
} 