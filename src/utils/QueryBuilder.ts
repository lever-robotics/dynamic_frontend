import { gql } from '@apollo/client';

export class QueryBuilder {

  static getQueryForTable(schema: any, tableName: string) {
    const type = schema.entities.find(t => t.name === tableName);
    if (!type) {
      return null;
    }

    const fields = type.fields.filter(f => f.type !== 'relationship').map(field => field.name);

    const queryString = `
      query Get${type.name} {
        ${type.name} {
          __typename
          ${fields.join('\n\t\t  ')}
        }
      }
    `;

    console.log(queryString);
    return gql(queryString);
  }

  static buildMetadataSearchQuery(schema: any) {
    const searchQueries = schema.entities.map(type => {
      // Get all fields except ID
      const searchableFields = type.fields.filter(f => f.type !== 'relationship').filter(field => field.name !== 'id');

      // Get the name field for display
      const nameField = type.fields.find(f => f.name === 'name' || f.name === 'first_name');
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
      ${type.name}(filter: {
          or: [${fieldFilters}]
      }) {
            __typename
            ${nameField.name}
            ${searchableFields.map(f => f.name).join('\n                  ')}
        }
    `;
    }).filter(Boolean);

    const queryString = `
    query SearchMetadata($searchTerm: String!, $numberTerm: Int, $dateTerm: Date) {
      ${searchQueries.join('\n')}
    }
  `;
    // console.log(queryString);

    return gql(queryString);
  }

  static buildConnectionsQuery(schema: any, typeName: string) {
    // Find the type object to get its name and fields
    const typeObj = schema.entities.find(t => t.name === typeName);
    if (!typeObj) {
      console.warn(`Type object not found for: ${typeName}`);
      return null;
    }

    // Get all fields for the main type
    const typeFields = typeObj.fields
      .filter(f => f.type !== 'relationship')
      .map(f => f.name)
      .join('\n        ');

    // Build connection queries by iterating over fields of type relationship
    const relationshipQueries = typeObj.fields
      .filter(f => f.type === 'relationship')
      .map(relField => {
        const relatedTypeObj = schema.entities.find(t => t.name === relField.name);
        if (!relatedTypeObj) {
          console.warn(`Related type object not found for: ${relField.name}`);
          return '';
        }

        const relatedFields = relatedTypeObj.fields
          .filter(f => f.type !== 'relationship')
          .map(f => f.name)
          .join('\n        ');

        return `
        ${relField.name} {
          ${relatedFields}
        }`;
      });

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

