import type React from "react";
import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import type { SearchQuery } from "./LeverApp";
import { QueryBuilder } from "../utils/QueryBuilder";
import { Table } from "./Table";
import type { Blueprint, Entity } from "@/types/blueprint";
export const AllDisplay: React.FC<{
	blueprint: Blueprint;
	searchQuery: SearchQuery | null;
	updateSearchQuery: (query: SearchQuery) => void;
}> = ({ blueprint, updateSearchQuery }) => {
	// Prepare queries for all tables using useMemo to avoid recreating on every render
	const tableQueries = useMemo(() => {
		return blueprint.entities
			.map((entity: Entity) => ({
				tableName: entity.displayName,
				query: QueryBuilder.getQueryForTable(entity),
			}))
			.filter((item) => item.query);
	}, [blueprint]);

	// Use useQuery for each table query
	const tableQueryResults = tableQueries.map(({ tableName, query }) => {
		const { data, loading, error } = useQuery(query, { fetchPolicy: "no-cache" });
		if (loading) {
			return {
				tableName,
				data: null,
				loading,
				error,
			};
		}
		console.log("data", data);
		return {
			tableName,
			data: data ? data[tableName.toLowerCase()] : null,
			loading,
			error,
		};
	});

	// Check for loading state
	const isLoading = tableQueryResults.some((result) => result.loading);

	// Check for errors
	const errors = tableQueryResults.filter((result) => result.error);

	// Render loading state
	console.log("isLoading", isLoading);
	if (isLoading) {
		return (
			<div className="flex flex-col items-center w-full p-4">
				Loading objects...
			</div>
		);
	}

	// Render errors if any
	if (errors.length > 0) {
		return (
			<div className="p-4 text-red-600">
				<h2 className="text-xl font-bold mb-4">Errors</h2>
				{errors.map((error) => (
					<div key={error.tableName}>
						<strong>{error.tableName}:</strong> {error.error?.message}
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center w-full">
			<div className="max-w-3xl w-full h-min overflow-y-hidden overflow-x-scroll no-scrollbar">
				<h2 className="text-2xl font-heading mb-4">All Objects</h2>
				{tableQueryResults.map((result) => {
					console.log("result", result);
					return (
						result.data && (
							<Table
								key={result.tableName}
								data={result.data}
								tableName={result.tableName}
								updateSearchQuery={updateSearchQuery}
							/>
						)
					);
				})}
			</div>
		</div>
	);
};

export default AllDisplay;
