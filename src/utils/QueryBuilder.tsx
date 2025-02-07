// src/utils/QueryBuilder.ts
import { gql } from '@apollo/client';
import schemaData from '../assets/commonGrounds_schema.json';
import { compact } from '@apollo/client/utilities';

export class QueryBuilder {
  static getAllQueries() {
    return schemaData.object_types.map(type => {
      const fields = type.metadata.fields.map(field => field.name);

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

      return {
        name: type.name,
        tableName: type.table_name,
        query: gql(queryString)
      };
    });
  }

  static getQueryForTable(tableName: string) {
    const type = schemaData.object_types.find(t => t.table_name === tableName);
    if (!type) {
      return null;
    }

    const fields = type.metadata.fields.map(field => field.name);

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

    return gql(queryString);
  }

  static buildSearchQuery() {
    const searchQueries = schemaData.object_types.map(type => {
      const fields = type.metadata.fields.map(field => field.name);
      const hasName = fields.includes('name');
      const hasFirstName = fields.includes('first_name');

      if (!hasName && !hasFirstName) return null;

      return `
      ${type.table_name}Collection(filter: {
        ${hasName ? 'name: { ilike: $searchTerm }' : ''}
        ${hasFirstName ? 'first_name: { ilike: $searchTerm }' : ''}
      }) {
        edges {
          node {
            ${fields.join('\n              ')}
          }
        }
      }
    `;
    }).filter(Boolean);


    console.log(searchQueries);

    return gql`
    query SearchByName($searchTerm: String!) {
      ${searchQueries.join('\n')}
    }
  `;
  }

  static buildMetadataSearchQuery() {
    const searchQueries = schemaData.object_types.map(type => {
      // Get all fields except ID
      const searchableFields = type.metadata.fields.filter(field => field.name !== 'id');

      // Get the name field for display
      const nameField = type.metadata.fields.find(f => f.name === 'name' || f.name === 'first_name');
      if (!nameField) return null;

      // Create different filters based on field type
      const fieldFilters = searchableFields.map(field => {
        switch (field.type) {
          case 'integer':
            return `{ ${field.name}: { eq: $numberTerm } }`;
          case 'date':
            return `{ ${field.name}: { eq: $dateTerm } }`;
          default:
            return `{ ${field.name}: { ilike: $searchTerm } }`;
        }
      }).join(', ');

      return `
      ${type.table_name}Collection(filter: {
          or: [${fieldFilters}]
      }) {
          edges {
              node {
                  nodeId
                  __typename
                  ${nameField.name}
                  ${searchableFields.map(f => f.name).join('\n                  ')}
              }
          }
      }
    `;
    }).filter(Boolean);

    const queryString = `
    query SearchMetadata($searchTerm: String!, $numberTerm: Int, $dateTerm: Date) {
      ${searchQueries.join('\n')}
    }
  `;
    console.log(queryString);

    return gql(queryString);
  }

  // src/utils/QueryBuilder.ts
  static buildTableMetadataQuery(tableName: string) {
    // Find the type object for the specified table
    const typeObj = schemaData.object_types.find(t => t.table_name === tableName);
    if (!typeObj) {
      console.warn(`Type object not found for table: ${tableName}`);
      return null;
    }

    // Get all metadata fields
    const metadataFields = typeObj.metadata.fields.map(field => {
      return `${field.name}
        __typename
        nodeId`;
    }).join('\n        ');

    const queryString = `
      query Get${typeObj.name}WithMetadata {
        ${tableName}Collection {
          edges {
            node {
              ${metadataFields}
            }
          }
        }
      }
    `;

    return gql(queryString);
  }

  // src/utils/QueryBuilder.ts
  static buildConnectionsQuery(typeName: string) {
    // Find the type object to get its table_name and fields
    const typeObj = schemaData.object_types.find(t => t.table_name === typeName);
    if (!typeObj) {
      console.warn(`Type object not found for: ${typeName}`);
      return null;
    }
    const typeObjectName = typeObj.name;

    // Get all relationships where this type is a source or target, excluding self-referential relationships
    const relevantRelationships = schemaData.relationships.filter(rel => {
      const isSourceOrTarget = rel.source_types.includes(typeObjectName) || rel.target_types.includes(typeObjectName);
      const isSelfReferential = rel.source_types[0] === rel.target_types[0];
      return isSourceOrTarget && !isSelfReferential;
    });


    console.log('Found relevant relationships:', relevantRelationships.map(r => r.name));

    // Build connection queries
    const relationshipQueries = relevantRelationships.map(rel => {
      const isSource = rel.source_types.includes(typeObjectName);

      // Get the correct type object based on whether we're the source or target
      const relatedTypeName = isSource ? rel.target_types[0] : rel.source_types[0];
      const relatedTypeObj = schemaData.object_types.find(t => t.name === relatedTypeName);

      if (!relatedTypeObj) {
        console.warn(`Related type object not found for: ${relatedTypeName}`);
        return '';
      }

      const relatedFields = relatedTypeObj.metadata.fields
        .filter(f => f.name !== 'id')
        .map(f => f.name)
        .join('\n        ');

      // Build the query fragment based on whether we're the source or target
      const queryFragment = `
      ${rel.table_name.toLowerCase()}Collection {
        edges {
          node {
            ${isSource ? relatedTypeObj.table_name : relatedTypeObj.table_name} {
              ${relatedFields}
            }
          }
        }
      }`;

      return queryFragment;
    });

    // Get all fields for the main type
    const typeFields = typeObj.metadata.fields
      .map(f => f.name)
      .join('\n        ');

    const fullQueryString = `
    query GetNodeConnections($nodeId: ID!) {
      node(nodeId: $nodeId) {
        ... on ${typeName} {
          ${typeFields}
          ${relationshipQueries.join('\n')}
        }
      }
    }
  `;

    // console.log(fullQueryString);

    return gql(fullQueryString);
  }
}

