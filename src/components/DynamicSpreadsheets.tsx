import React, { useState, useEffect } from 'react';
import Spreadsheet from 'react-spreadsheet';
import styles from './SpreadsheetStyles.module.css';
import schemaData from '../assets/commonGrounds_schema.json';

interface DataSpreadsheetProps {
    title: string;
    data: any[];
}

const DataSpreadsheet: React.FC<DataSpreadsheetProps> = ({ title, data }) => {
    const [spreadsheetData, setSpreadsheetData] = useState<Array<Array<{ value: string; readOnly?: boolean }>>>([]);
    const [columnHeaders, setColumnHeaders] = useState<string[]>([]);

    useEffect(() => {
        if (data && data.length > 0) {
            // Find the corresponding schema type
            const schemaType = schemaData.object_types.find(type =>
                type.name === title || type.table_name === title.toLowerCase()
            );

            if (schemaType) {
                // Get field names for column headers, excluding 'id'
                const headers = schemaType.metadata.fields
                    .map(field => field.name)
                    .filter(name => name !== 'id');
                setColumnHeaders(headers);

                // Create data matrix without the id column
                const matrix = data.map(item =>
                    headers.map(fieldName => ({
                        value: String(item[fieldName] || ''),
                        readOnly: true
                    }))
                );

                setSpreadsheetData(matrix);
            }
        }
    }, [data, title]);

    // Create row labels from the IDs
    const rowLabels = data.map(item => String(item.id));

    return (
        <div className="w-full max-w-6xl mx-auto p-4 border rounded-lg shadow-lg mb-8">
            <div className="mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            <div className={styles['spreadsheet-container']}>
                {spreadsheetData.length > 0 ? (
                    <Spreadsheet
                        data={spreadsheetData}
                        onChange={setSpreadsheetData}
                        columnLabels={columnHeaders}
                        rowLabels={rowLabels} // Using IDs as row labels
                        className="w-full"
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
        <div className="p-4">
            {queryResults.map(({ name, data }) => (
                <DataSpreadsheet
                    key={name}
                    title={name}
                    data={data || []}
                />
            ))}
        </div>
    );
};

export default DynamicSpreadsheets;