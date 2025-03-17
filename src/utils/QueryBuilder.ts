import type { Blueprint, Entity } from '@/types/blueprint';
import { gql } from '@apollo/client';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class QueryBuilder {

  static getQueryForTable(entity: Entity) {

    const fields = entity.fields.filter(f => f.type !== 'relationship').map(field => field.name);

    const queryString = `
      query Get${entity.name} {
        ${entity.name} {
          __typename
          ${fields.join('\n\t\t  ')}
        }
      }
    `;

    // console.log(queryString);
    return gql(queryString);
  }

  static buildMetadataSearchQuery(blueprint: Blueprint) {
    const searchQueries = blueprint.entities.map(entity => {
      // Get all fields except ID
      const searchableFields = entity.fields.filter(f => f.type !== 'relationship').filter(field => field.name !== 'id');

      // Get the name field for display
   

      // Create different filters based on field type
      const fieldFilters = searchableFields.map(field => {
        switch (field.type) {
          case 'number':
            return `{ ${field.name}: { eq: $numberTerm } }`;
          case 'date':
            return `{ ${field.name}: { eq: $dateTerm } }`;
          default:
            return `{ ${field.name}: { ilike: $searchTerm } }`;
        }
      }).join(', ');

      return `
      ${entity.name}(filter: {
          or: [${fieldFilters}]
      }) {
            __typename
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

  static buildConnectionsQuery(blueprint: Blueprint, typeName: string) {
    // Find the type object to get its name and fields
    const typeObj = blueprint.entities.find(t => t.name === typeName);
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
        const relatedTypeObj = blueprint.entities.find(t => t.name === relField.name);
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
        ${typeName} (filter: { nodeId: { eq: $nodeId } }) {
          ${typeFields}
          ${relationshipQueries.join('\n')}
        }
      }
      `;

  //   const fullQueryString = `
  //   query GetNodeConnections($nodeId: ID!) {
  //     node(nodeId: $nodeId) {
  //       ... on ${typeName} {
  //         ${typeFields}
  //         ${relationshipQueries.join('\n')}
  //       }
  //     }
  //   }
  // `;

    console.log(fullQueryString);

    return gql(fullQueryString);
  }
}

