import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';

// This query fetches the entire schema
const INTROSPECTION_QUERY = gql`
  query IntrospectionQuery {
    __schema {
      types {
        name
        description
        fields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
          args {
            name
            description
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  }
`;

interface SchemaType {
  name: string;
  description: string | null;
  fields: Array<{
    name: string;
    description: string | null;
    type: {
      name: string | null;
      kind: string;
      ofType: {
        name: string | null;
        kind: string;
      } | null;
    };
  }> | null;
}

export function useSchemaIntrospection() {
  const [schemaTypes, setSchemaTypes] = useState<SchemaType[]>([]);
  const [queryableTypes, setQueryableTypes] = useState<SchemaType[]>([]);
  
  const { loading, error, data } = useQuery(INTROSPECTION_QUERY);

  useEffect(() => {
    if (data?.__schema?.types) {
      // Filter out internal GraphQL types (those starting with '__')
      const filteredTypes = data.__schema.types.filter(
        (type: SchemaType) => !type.name.startsWith('__')
      );

      setSchemaTypes(filteredTypes);

      // Filter for only object types that can be queried
      const queryTypes = filteredTypes.filter(
        (type: SchemaType) => 
          type.fields?.some(field => field.type.kind === 'OBJECT' || 
            (field.type.kind === 'LIST' && field.type.ofType?.kind === 'OBJECT'))
      );

      setQueryableTypes(queryTypes);
    }
  }, [data]);

  return {
    loading,
    error,
    schemaTypes,
    queryableTypes,
  };
}