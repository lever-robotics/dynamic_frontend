import type { DataConnector, Entity } from "@/types/connectors";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { useEffect, useState } from "react";
import { ConnectionDetail } from "./ConnectionDetail";
import { ConnectionStore } from "./ConnectionStore";
import { ConnectionsList } from "./ConnectionsList";
import { EntityDetails } from "./EntityDetails";

export function BusinessData() {
	const [showConnectionStore, setShowConnectionStore] = useState(false);

	const [selectedConnection, setSelectedConnection] =
		useState<DataConnector | null>(null);
	const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

	const onSelectEntity = (entity: Entity) => {
		setSelectedEntity(entity);
	};

	const onSelectConnection = (connection: DataConnector) => {
		setSelectedConnection(connection);
	};

	const onAddConnection = () => {
		setShowConnectionStore(true);
	};

	return (
		<div className="h-full flex bg-white">
			{/* Left Side - Connections List */}
			<ConnectionsList
				selectedEntityName={selectedEntity?.name}
				onSelectEntity={onSelectEntity}
				selectedConnection={selectedConnection}
				onSelectConnection={onSelectConnection}
				onAddConnection={onAddConnection}
			/>

			{/* Right Side - Entity Details */}
			<EntityDetails entity={selectedEntity} connection={selectedConnection} />

			{/* Connection Store Modal */}
			{showConnectionStore && (
				<ConnectionStore
					onClose={() => setShowConnectionStore(false)}
					onBack={() => setShowConnectionStore(false)}
				/>
			)}
		</div>
	);
}
