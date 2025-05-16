import type { DataConnector, Entity } from "@/types/connectors";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { TextareaField } from "./TextareaField";

interface EntityDetailsProps {
	entity: Entity;
	connection: DataConnector;
}

export const EntityDetails: React.FC<EntityDetailsProps> = ({
	entity,
	connection,
}) => {
	const { connections, updateConnectionMeta } = useUserConfig();

	const handleEntityDescriptionUpdate = async (
		connection: DataConnector,
		entityName: string,
		newValue: string,
	) => {
		const updatedEntities = connection.meta.entities.map((entity) => {
			if (entity.name === entityName) {
				return {
					...entity,
					description: newValue,
				};
			}
			return entity;
		});

		try {
			await updateConnectionMeta(connection.id, {
				version: connection.meta.version,
				entities: updatedEntities,
			});
		} catch (error) {
			console.error("Failed to update entity description:", error);
		}
	};

	const handleFieldUpdate = async (
		connection: DataConnector,
		entityName: string,
		fieldName: string,
		newValue: string,
	) => {
		const updatedEntities = connection.meta.entities.map((entity) => {
			if (entity.name === entityName) {
				return {
					...entity,
					fields: entity.fields.map((field) =>
						field.name === fieldName
							? { ...field, description: newValue }
							: field,
					),
				};
			}
			return entity;
		});

		try {
			await updateConnectionMeta(connection.id, {
				version: connection.meta.version,
				entities: updatedEntities,
			});
		} catch (error) {
			console.error("Failed to update field description:", error);
		}
	};

	return (
		<div className="w-2/3 flex flex-col">
			<div className="flex-1 overflow-auto p-6">
				{!entity ? (
					<div className="flex items-center justify-center h-full text-gray-500">
						Select an entity to view details
					</div>
				) : (
					<section className="flex flex-col -mt-2 leading-relaxed">
						<h1 className="self-start text-2xl">{entity.name}</h1>

						<div className="flex flex-col pl-3.5 mt-8 w-full text-sm">
							<TextareaField
								label=""
								value={entity.description}
								state="user"
								onUpdate={(newValue) =>
									handleEntityDescriptionUpdate(
										connection,
										entity.name,
										newValue,
									)
								}
							/>

							<hr className="shrink-0 mb-4 border border-solid bg-stone-300 border-stone-300 h-[1px]" />

							{entity.fields.map((field) => (
								<TextareaField
									key={field.name}
									label={field.name}
									value={field.description}
									state={field.description ? "user" : "blank"}
									onUpdate={(newValue) =>
										handleFieldUpdate(
											connection,
											entity.name,
											field.name,
											newValue,
										)
									}
								/>
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
};
