// src/hooks/useTypeQuery.ts
import { useQuery } from '@apollo/client';
import { QueryBuilder } from '../utils/queryBuilder';

export function useTypeQuery(type: SchemaType) {
  const query = QueryBuilder.buildQuery(type);
  
  // Handle case where type isn't in our schema
  if (!query) {
    return { data: null, loading: false, error: new Error('Type not found in schema') };
  }

  // The data structure will now be different
  const { data, loading, error } = useQuery(query);

  // Transform the data to make it easier to work with
  const transformedData = data 
    ? data[`${type.name.toLowerCase()}Collection`].edges.map(edge => edge.node)
    : null;

  return { 
    data: transformedData, 
    loading, 
    error 
  };
}