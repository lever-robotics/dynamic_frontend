import React, { useState, useEffect } from "react";
import Spreadsheet from "react-spreadsheet";
import styles from "./SpreadsheetStyles.module.css";
import schemaData from "../assets/commonGrounds_schema.json";
import "./react-spreadsheet-overrides.css";

interface DataSpreadsheetProps {
	title: string;
	data: any[];
}

const DataSpreadsheet: React.FC<DataSpreadsheetProps> = ({ title, data }) => {
	const [spreadsheetData, setSpreadsheetData] = useState<
		Array<Array<{ value: string; readOnly?: boolean }>>
	>([]);
	const [columnHeaders, setColumnHeaders] = useState<string[]>([]);

	useEffect(() => {
		if (data && data.length > 0) {
			// Find the corresponding schema type
			const schemaType = schemaData.object_types.find(
				(type) =>
					type.name === title || type.table_name === title.toLowerCase(),
			);

			if (schemaType) {
				// Get field names for column headers, excluding 'id'
				const headers = schemaType.metadata.fields
					.map((field) => field.name)
					.filter((name) => name !== "id");
				setColumnHeaders(headers);

				// Create data matrix without the id column
				const matrix = data.map((item) =>
					headers.map((fieldName) => ({
						value: String(item[fieldName] || ""),
						readOnly: true,
					})),
				);

				setSpreadsheetData(matrix);
			}
		}
	}, [data, title]);

	// Create row labels from the IDs
	const rowLabels = data.map((item) => String(item.id));

	return (
		<div className="max-w-3xl h-mi">
			<h2 className="text-2xl font-heading">{title}</h2>
            <div className="overflow-y-hidden overflow-x-scroll no-scrollbar">
			{spreadsheetData.length > 0 ? (
				<Spreadsheet
					data={spreadsheetData}
					onChange={setSpreadsheetData}
					columnLabels={columnHeaders}
					rowLabels={rowLabels} // Using IDs as row labels
					// className="w-11"
					className="text-sm"
				/>
			) : (
				<div>No data available</div>
			)}
            </div>
		</div>
	);
};

const DynamicSpreadsheets = ({ queryResults }) => {
	return (
		<div className="flex flex-col items-center w-full">
			<div className="flex flex-col justify-start gap-10">
				{queryResults.map(({ name, data }) => (
					<DataSpreadsheet key={name} title={name} data={data || []} />
				))}
			</div>
		</div>
	);
};

export default DynamicSpreadsheets;
