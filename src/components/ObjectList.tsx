// src/components/ObjectList.tsx
import React, { useEffect, useState } from 'react';
import { useObjectData } from '../hooks/useObjectData';
import Spreadsheet from 'react-spreadsheet';
import styles from './SpreadsheetStyles.module.css';

interface ObjectListProps {
    tableName: string;
}

export function ObjectList({ tableName }: ObjectListProps) {
    const { data, loading, error } = useObjectData(tableName);

    if (loading) return <div>Loading objects...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data) return <div>No data found</div>;

    // Get the collection name from the data
    const collectionName = `${tableName}Collection`;
    return <ObjectDataDisplay
        collectionName={collectionName}
        edges={data.edges}
    />;
}

interface ObjectDataDisplayProps {
    collectionName: string;
    edges: any[];
}

export default function ObjectDataDisplay({ collectionName, edges }: ObjectDataDisplayProps) {
    const [spreadsheetData, setSpreadsheetData] = useState<Array<Array<{ value: string; readOnly?: boolean }>>>([]);
    const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
    const [objectTypeName, setObjectTypeName] = useState<string>('');

    useEffect(() => {
        if (edges && edges.length > 0) {
            // Get all the fields from the first node, excluding internal fields and 'id'
            const firstNode = edges[0].node;
            const headers = Object.keys(firstNode).filter(key =>
                !['__typename', 'nodeId', 'id'].includes(key)
            );
            setColumnHeaders(headers);

            // Determine the object type name and capitalize it
            const rawObjectTypeName = collectionName.replace(/Collection$/, '');
            const capitalizedObjectTypeName = rawObjectTypeName.charAt(0).toUpperCase() + rawObjectTypeName.slice(1);
            setObjectTypeName(capitalizedObjectTypeName);

            // Create matrix of all entities
            const matrix = edges.map(edge => {
                return headers.map(fieldName => ({
                    value: String(edge.node[fieldName] || ''),
                    readOnly: true
                }));
            });

            setSpreadsheetData(matrix);
        }
    }, [edges, collectionName]);

    if (!edges || edges.length === 0) return null;

    return (
        <div className="flex flex-col items-center w-full"> {/* Container with margin */}
            <div className="max-w-3xl h-min overflow-y-hidden overflow-x-scroll">
                <h2 className="text-lg">{objectTypeName}</h2>
                {spreadsheetData.length > 0 ? (
                    <Spreadsheet
                        data={spreadsheetData}
                        onChange={setSpreadsheetData}
                        columnLabels={columnHeaders}
                    />
                ) : (
                    <div className="p-4 text-center">No data available</div>
                )}
            </div>
        </div>
    );
}