// src/hooks/useObjectData.ts
import { useQuery } from '@apollo/client';
import { QueryBuilder } from '../utils/QueryBuilder';

export function useObjectData(tableName: string) {
    const tableQuery = QueryBuilder.buildTableMetadataQuery(tableName);

    const { data, loading, error } = useQuery(tableQuery!, {
        skip: !tableName || !tableQuery
    });

    // console.log('Raw GraphQL Response:', data);

    return {
        data: data?.[`${tableName}Collection`],
        loading,
        error
    };
}