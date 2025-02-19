import React, { useState, useEffect } from 'react';
import Spreadsheet from 'react-spreadsheet';
import schemaData from '../assets/commonGrounds_schema.json';

interface ConnectionSpreadsheetProps {
    collectionName: string;
    edges: any[];
}

const ConnectionSpreadsheet: React.FC<ConnectionSpreadsheetProps> = ({ collectionName, edges }) => {
    const [spreadsheetData, setSpreadsheetData] = useState<Array<Array<{ value: string; readOnly?: boolean }>>>([]);
    const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
    const [objectTypeName, setObjectTypeName] = useState<string>('');

    useEffect(() => {
        if (edges && edges.length > 0) {
            // Get the connected entity type
            const firstNode = edges[0].node;
            const connectedEntityKey = Object.keys(firstNode).find(key =>
                !['__typename'].includes(key)
            );

            if (connectedEntityKey) {
                // Get all fields from the first connected entity
                const firstEntity = firstNode[connectedEntityKey];
                const headers = Object.keys(firstEntity).filter(key => key !== '__typename');
                setColumnHeaders(headers);

                // Determine the object type name and capitalize it
                const rawObjectTypeName = connectedEntityKey.replace(/Collection$/, '');
                const capitalizedObjectTypeName = rawObjectTypeName.charAt(0).toUpperCase() + rawObjectTypeName.slice(1);
                setObjectTypeName(capitalizedObjectTypeName);

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
        <div className="max-w-3xl h-min">
            <h2 className="text-2xl font-heading text-portage-950">{objectTypeName}</h2>
            <div className="overflow-y-hidden overflow-x-scroll no-scrollbar">
                {spreadsheetData.length > 0 ? (
                    <Spreadsheet
                        data={spreadsheetData}
                        onChange={setSpreadsheetData}
                        columnLabels={columnHeaders}
                        className="w-full"
                    />
                ) : (
                    <div className="p-4 text-center">No data available</div>
                )}
            </div>
        </div>
    );
};

export default ConnectionSpreadsheet;