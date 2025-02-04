// src/utils/QueryBuilder.ts
import { gql } from '@apollo/client';
import schemaData from '../assets/commonGrounds_schema.json';

export class QueryBuilder {
  static getAllQueries() {
    console.log('Starting to build queries for all types');
    console.log('Found object types:', schemaData.object_types.length);

    // Generate a query for each object type in the schema
    return schemaData.object_types.map(type => {
      console.log('\n=== Processing type ===');
      console.log('Type name:', type.name);
      console.log('Table name:', type.table_name);
      
      const fields = type.metadata.fields.map(field => field.name);
      console.log('Fields found:', fields);
      
      const queryString = `
        query Get${type.name} {
          ${type.table_name}Collection {
            edges {
              node {
                ${fields.join('\n                ')}
              }
            }
          }
        }
      `;

      console.log('Generated query for', type.name, ':', queryString);

      return {
        name: type.name,
        tableName: type.table_name,
        query: gql(queryString)
      };
    });
  }

  static getQueryForTable(tableName: string) {
    console.log('\n=== Getting query for specific table ===');
    console.log('Looking for table:', tableName);

    const type = schemaData.object_types.find(t => t.table_name === tableName);
    if (!type) {
      console.warn(`Table ${tableName} not found in schema`);
      console.log('Available tables:', schemaData.object_types.map(t => t.table_name));
      return null;
    }

    console.log('Found type:', type.name);
    const fields = type.metadata.fields.map(field => field.name);
    console.log('Fields to query:', fields);
    
    const queryString = `
      query Get${type.name} {
        ${type.table_name}Collection {
          edges {
            node {
              ${fields.join('\n              ')}
            }
          }
        }
      }
    `;

    console.log('Generated query:', queryString);
    
    return gql(queryString);
  }
}

// Log the entire schema data when the file is loaded
console.log('\n=== Schema Data Overview ===');
console.log('Total object types:', schemaData.object_types.length);
console.log('Object types:', schemaData.object_types.map(t => ({
  name: t.name,
  tableName: t.table_name,
  fieldCount: t.metadata.fields.length
})));
console.log('Total relationships:', schemaData.relationships.length);