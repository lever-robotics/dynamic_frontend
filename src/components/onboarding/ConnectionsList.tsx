import type {
	CombinedConnection,
	DataConnector,
	Entity,
} from "@/types/connectors";
import { Connections } from "@/types/connectors";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { DataSourceItem } from "./DataSourceItem";

interface ConnectionsListProps {
	selectedEntityName: string | null;
	selectedConnection: DataConnector | null;
	onSelectEntity: (entity: Entity) => void;
	onSelectConnection: (connection: DataConnector) => void;
	onAddConnection: () => void;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({
	selectedEntityName,
	selectedConnection,
	onSelectEntity,
	onSelectConnection,
	onAddConnection,
}) => {
	const { userConfig, isLoading } = useUserConfig();
	const connections = userConfig?.data_connectors || [];

	const applicableConnections: CombinedConnection[] = connections.map(
		(dataConnector) => {
			return {
				dataConnector,
				connection: Connections.find(
					(conn) => conn.type === dataConnector.type,
				),
			};
		},
	);

	return (
		<div className="w-1/3 border-r border-gray-200 flex flex-col">
			<div className="p-4 border-b">
				<h2 className="text-lg font-semibold text-gray-800">Business Data</h2>
			</div>

			<div className="flex-1 overflow-auto p-4 space-y-2">
				{isLoading ? (
					<div className="text-gray-500">Loading Data Connectors...</div>
				) : connections.length > 0 ? (
					applicableConnections.map((connection) => (
						<div key={connection.dataConnector.type} className="space-y-1">
							<DataSourceItem
								key={connection.dataConnector.type}
								connection={connection.connection}
								dataConnector={connection.dataConnector}
								onSelectEntity={onSelectEntity}
								onSelectConnection={onSelectConnection}
								selectedEntityName={selectedEntityName}
								selectedConnection={selectedConnection}
							/>
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
