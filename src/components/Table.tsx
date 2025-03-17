import React from 'react';
import Spreadsheet from 'react-spreadsheet';
import { SearchQuery } from './LeverApp';

interface TableProps {
    data: any[];
    tableName?: string;
    excludeFields?: string[];
    className?: string;
    updateSearchQuery?: (query: SearchQuery) => void;
}

interface SpreadsheetSelection {
    range: {
        start: {
            row: number;
            column: number;
        };
        end: {
            row: number;
            column: number;
        };
    };

    type?: string;
}

export const Table: React.FC<TableProps> = ({
    data,
    tableName,
    excludeFields = ['__typename', 'nodeId', 'id'],
    className = '',
    updateSearchQuery
}) => {
    if (!data || data.length === 0) {
        return <div>No data available</div>;
    }

    // Get headers (excluding specified fields)
    const headers = Array.from(new Set(
        data.flatMap(item => Object.keys(item))
    )).filter(key => !excludeFields.includes(key));

    // Create matrix of data
    const matrix = data.map(item =>
        headers.map(header => ({
            value: String(item[header] || ''),
            readOnly: true
        }))
    );

    const handleSelection = (selection) => {
        if (!selection || !updateSearchQuery) return;
        console.log('Selection:', selection);
        console.log('Type:', selection.type);

        //check if selection is of type EntireWorksheetSelection2, EntireColumnSelection2, EntireRowSelection2 then return
        // Ignore if range doesn't exist
        if (!selection.range) {
            console.log('Selection has no range - ignoring');
            return;
        }

        const rowIndex = selection.range.start.row;
        const rowData = data[rowIndex];

        console.log('Selected Row Index:', rowIndex);
        console.log('Selected Row Data:', rowData);

        if (rowData) {
            const newQuery: SearchQuery = {
                name: '',
                type: 'object',
                metadata: {
                    objectID: rowData.nodeId, // Using nodeId directly instead of falling back to id
                    objectType: tableName?.toLowerCase() || 'unknown' //change to typename in the future
                }
            };

            console.log('Generated Query:', newQuery);
            updateSearchQuery(newQuery);
        }
    };

    return (
        <div className={className}>
            {tableName && <div className="text-xl font-bold mb-4">{tableName}</div>}
            <Spreadsheet
                data={matrix}
                columnLabels={headers}
                onChange={() => { }}
                onSelect={handleSelection}
            />

            {/* Debug section showing raw data */}
            {/* <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="text-lg font-semibold mb-2">Debug Data:</h3>
                <pre className="whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(
                        {
                            tableName,
                            rawData: data,
                            headers,
                            excludedFields: excludeFields
                        },
                        null,
                        2
                    )}
                </pre>
            </div> */}
        </div>
    );
};

export default Table;