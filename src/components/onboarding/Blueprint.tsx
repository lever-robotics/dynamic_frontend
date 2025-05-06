import { ToolProvider } from "@/contexts/ToolContext";
import type { FlagChunk } from "@/types/chat";
import { useCallback, useState } from "react";
import { Modal } from "../common/Modal";
import { ConnectionDetail } from "./ConnectionDetail";
import { ConnectionStore } from "./ConnectionStore";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";

interface Connection {
	id: string;
	name: string;
	description: string;
	icon: string;
}

interface BlueprintProps {
	onClose: () => void;
}

export function Blueprint({ onClose }: BlueprintProps) {
	const [showConnectionStore, setShowConnectionStore] = useState(false);
	const [showConnectionDetail, setShowConnectionDetail] = useState(false);
	const [selectedConnection, setSelectedConnection] =
		useState<Connection | null>(null);

	const sendOnConnect = useCallback(() => {
		return {
			type: "flag",
			// flag: "blueprint",
			flag: "query",
			context: JSON.stringify({}),
		} as FlagChunk;
	}, []);

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
							<RightPanel sendOnConnect={sendOnConnect} />
						</div>
					)}
				</div>
			</Modal>
		</ToolProvider>
	);
}
