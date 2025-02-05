import React, { useState, useEffect } from 'react';
import Spreadsheet from 'react-spreadsheet';
import styles from './SpreadsheetStyles.module.css';
import schemaData from '../assets/commonGrounds_schema.json';

interface DataSpreadsheetProps {
    title: string;
    data: any;
}

const DataSpreadsheet: React.FC<DataSpreadsheetProps> = ({ title, data }) => {
    const [spreadsheetData, setSpreadsheetData] = useState<Array<Array<{ value: string; readOnly?: boolean }>>>([]);
    const [columnHeaders, setColumnHeaders] = useState<string[]>([]);

    useEffect(() => {
        if (data) {
            // Find the corresponding schema type
            const schemaType = schemaData.object_types.find(type =>
                type.name === title || type.table_name === title.toLowerCase()
            );

            if (schemaType) {
                // Get field names for column headers, excluding 'id' and '__typename'
                const headers = schemaType.metadata.fields
                    .map(field => field.name)
                    .filter(name => !['id', '__typename'].includes(name));
                setColumnHeaders(headers);

                // For main data, create a single row
                const mainDataRow = headers.map(fieldName => ({
                    value: String(data[fieldName] || ''),
                    readOnly: true
                }));

                setSpreadsheetData([mainDataRow]);
            }
        }
    }, [data, title]);

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
                        className="w-full"
                    />
                ) : (
                    <div>No data available</div>
                )}
            </div>
        </div>
    );
};

const ConnectionSpreadsheet: React.FC<{ collectionName: string; edges: any[] }> = ({ collectionName, edges }) => {
    const [spreadsheetData, setSpreadsheetData] = useState<Array<Array<{ value: string; readOnly?: boolean }>>>([]);
    const [columnHeaders, setColumnHeaders] = useState<string[]>([]);

    useEffect(() => {
        if (edges && edges.length > 0) {
            // Get the connected entity type (e.g., "groups", "event", etc.)
            const firstNode = edges[0].node;
            const connectedEntityKey = Object.keys(firstNode).find(key =>
                !['__typename'].includes(key)
            );

            if (connectedEntityKey) {
                // Get all fields from the first connected entity
                const firstEntity = firstNode[connectedEntityKey];
                const headers = Object.keys(firstEntity).filter(key => key !== '__typename');
                setColumnHeaders(headers);

                // Create matrix of all connected entities
                const matrix = edges.map(edge => {
                    const entity = edge.node[connectedEntityKey];
                    return headers.map(fieldName => ({
                        value: String(entity[fieldName] || ''),
                        readOnly: true
                    }));
                });

                setSpreadsheetData(matrix);
            }
        }
    }, [edges, collectionName]);

    if (!edges || edges.length === 0) return null;

    return (
        <div className="w-full max-w-6xl mx-auto p-4 border rounded-lg shadow-lg mb-8">
            <div className="mb-4">
                <h2 className="text-2xl font-bold">{collectionName}</h2>
            </div>
            <div className={styles['spreadsheet-container']}>
                {spreadsheetData.length > 0 ? (
                    <Spreadsheet
                        data={spreadsheetData}
                        onChange={setSpreadsheetData}
                        columnLabels={columnHeaders}
                        className="w-full"
                    />
                ) : (
                    <div>No connections available</div>
                )}
            </div>
        </div>
    );
};

const NodeDataDisplay = ({ nodeData }) => {
    if (!nodeData) return null;

    // Get collections from the data
    const collections = Object.entries(nodeData)
        .filter(([key]) => key.endsWith('Collection'));

    return (
        <div className="p-4">
            {/* Main entity data */}
            <DataSpreadsheet
                title={nodeData.__typename}
                data={nodeData}
            />

            {/* Connection data */}
            {collections.map(([collectionName, collection]: [string, any]) => (
                <ConnectionSpreadsheet
                    key={collectionName}
                    collectionName={collectionName}
                    edges={collection.edges}
                />
            ))}
        </div>
    );
};

export default NodeDataDisplay;