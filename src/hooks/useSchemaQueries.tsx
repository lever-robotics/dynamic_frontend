// src/hooks/useSchemaQueries.ts
import { useQuery } from '@apollo/client';
import { QueryBuilder } from '../utils/QueryBuilder';

export function useSchemaQueries() {
  const queries = QueryBuilder.getAllQueries();

  const results = queries.map(({ name, tableName, query }) => {
    const { data, loading, error } = useQuery(query);

    return {
      name,
      tableName,
      data: data ? data[`${tableName}Collection`]?.edges?.map(edge => edge.node) : null,
      loading,
      error
    };
  });

  return {
    results,
    isLoading: results.some(result => result.loading),
    errors: results.filter(result => result.error).map(result => ({
      table: result.tableName,
      error: result.error
    }))
  };
}