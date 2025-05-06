import type { Connection, Entity } from "@/types/connectors";
import type { DataConnector } from "@/types/connectors";
import { useState } from "react";

interface DataSourceItemProps {
	isImage?: boolean;
	connection: Connection;
	dataConnector: DataConnector;
	onSelectEntity: (entity: Entity) => void;
	onSelectConnection: (connection: DataConnector) => void;
	selectedEntityName: string;
	selectedConnection: DataConnector | null;
}

export const DataSourceItem: React.FC<DataSourceItemProps> = ({
	connection,
	dataConnector,
	onSelectEntity,
	onSelectConnection,
	selectedEntityName,
	selectedConnection,
}) => {
	const isSelected = selectedConnection?.id === dataConnector.id;
	const baseClasses =
		"flex gap-3.5 px-6 py-5 whitespace-nowrap rounded-xl border border-solid max-md:px-5 cursor-pointer";
	const activeClasses = isSelected
		? "bg-stone-300 border-white"
		: "bg-white border text-neutral-900";

	return (
		<div className="space-y-1">
			<article
				className={`${baseClasses} ${activeClasses}`}
				onClick={() => onSelectConnection(dataConnector)}
			>
				<img
					src={connection.icon}
					alt=""
					className="object-contain shrink-0 self-start aspect-square stroke-[2px] stroke-stone-300 w-[18px]"
				/>
				<p
					className={`grow shrink ${isSelected ? "my-auto w-[143px]" : "self-start w-36"}`}
				>
					{connection.name}
				</p>
			</article>
			{isSelected &&
				dataConnector.meta.entities.length > 0 &&
				dataConnector.meta.entities.map((entity) => (
					<div
						key={entity.name}
						className="pl-4"
						onClick={() => onSelectEntity(entity)}
					>
						<div
							className={`px-3 py-1.5 text-sm rounded-md cursor-pointer ${
								selectedEntityName === entity.name
									? "bg-stone-100 text-stone-900"
									: "text-stone-600 hover:bg-stone-50"
							}`}
						>
							{entity.displayName}
						</div>
					</div>
				))}
		</div>
	);
};

//isImage ? (
//<div className="flex shrink-0 bg-white border border-solid h-[30px] w-[30px]" />
//)
