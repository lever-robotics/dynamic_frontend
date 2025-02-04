import React from 'react';
import { useSchemaIntrospection } from './fetchSchema';

export function SchemaExplorer() {
  const { loading, error, schemaTypes, queryableTypes } = useSchemaIntrospection();

  if (loading) return <div>Loading schema...</div>;
  if (error) return <div>Error loading schema: {error.message}</div>;

  return (
    <div>
      <h2>Available Types</h2>
      <div>
        {queryableTypes.map((type) => (
          <div key={type.name} className="p-4 border rounded mb-2">
            <h3>{type.name}</h3>
            {type.description && <p>{type.description}</p>}
            <div>
              <h4>Fields:</h4>
              <ul>
                {type.fields?.map((field) => (
                  <li key={field.name}>
                    {field.name}: {field.type.name || field.type.ofType?.name}
                    {field.description && <p className="text-sm">{field.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}