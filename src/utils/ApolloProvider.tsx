import {
	ApolloClient,
	ApolloLink,
	ApolloProvider,
	InMemoryCache,
	Observable,
	createHttpLink,
	gql,
	from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth } from "./AuthProvider";
import { buildSchema, graphql, type GraphQLSchema } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createContext, useContext, useState } from "react";
import { supabase } from "./SupabaseClient";
import { useEffect } from "react";
import type { Blueprint } from "@/types/blueprint";

const typeDefs = gql`# GraphQL Schema
      type Query {
        me: User
      }
      type User {
        userId: ID!
        email: String
        name: String
      }
    `;

const initialSchema = makeExecutableSchema({ typeDefs });

interface ValidationProviderContextType {
	fetchUserSchema: (userId: string) => Promise<void>;
	schema: GraphQLSchema;
	blueprint: any | null;
}

const ValidationProviderContext = createContext<
	ValidationProviderContextType | undefined
>(undefined);

const AuthApolloProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [schema, setSchema] = useState<GraphQLSchema>(initialSchema);
	const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
	const { getValidToken, userId } = useAuth();

	const updateSchema = (schema: string) => {
		const newSchema = buildSchema(schema);
		setSchema(newSchema);
	};

	useEffect(() => {
		if (userId) {
			console.log('User ID login, fetching schema:', userId);
			fetchUserSchema(userId);
		}
	}, [userId]);

	const fetchUserSchema = async (userId: string) => {
		try {
			// Fetch both schemas in parallel
			const [blueprintResponse] = await Promise.all([
				// supabase
				// 	.from('user_configs')
				// 	.select('schema')
				// 	.eq('user_id', userId)
				// 	.single(),
				supabase
					.from('user_configs')
					.select('blueprint')
					.eq('user_id', userId)
					.single()
			]);

			// Handle GraphQL schema
			// if (schemaResponse.error) {
			// 	console.error("Error fetching GraphQL schema:", schemaResponse.error);
			// } else if (schemaResponse.data) {
			// 	updateSchema(JSON.parse(schemaResponse.data as unknown as string));
			// }

			// Handle JSON schema
			if (blueprintResponse.error) {
				console.error("Error fetching blueprint:", blueprintResponse.error);
			} else if (blueprintResponse.data) {
				const newBlueprint = blueprintResponse.data.blueprint;
				console.log('Blueprint:', newBlueprint);
				setBlueprint(newBlueprint)
			}
		} catch (error) {
			console.error("Error fetching schemas:", error);
		}
	};

	const authLink = createAuthLink(getValidToken);
	const httpLink = createHttpLink({
		uri: "http://localhost:4000/graphql",
	});

	const client = new ApolloClient({
		link: from([
			// createValidationLink(schema),
			authLink.concat(httpLink),
		]),
		cache: new InMemoryCache(),
	});

	return (
		<ValidationProviderContext.Provider value={{ fetchUserSchema, schema, blueprint }}>
			<ApolloProvider client={client}>{children}</ApolloProvider>
		</ValidationProviderContext.Provider>
	);
};

export function useAuthApollo() {
	const context = useContext(ValidationProviderContext);
	if (!context) {
		throw new Error("useAuthApollo must be used within a CustomApolloProvider");
	}
	return context;
}


function createAuthLink(getValidToken: () => Promise<string | null | undefined>) {
	return setContext(async (_, { headers }) => {
		const validToken = await getValidToken();
		return {
			headers: {
				...headers,
				authorization: validToken ? `Bearer ${validToken}` : "",
			},
		}
	});
}

// function createValidationLink(schema: GraphQLSchema) {
// 	return new ApolloLink((operation, forward) => {
// 		return new Observable((observer) => {
// 			const query = operation.query.loc?.source.body || "";

// 			graphql({ schema, source: query })
// 				.then((result) => {
// 					if (result.errors && result.errors.length > 0) {
// 						console.error("GraphQL Query Validation Errors:", result.errors);
// 						observer.error(
// 							new Error(result.errors.map((e) => e.message).join(", ")),
// 						);
// 					} else {
// 						forward(operation).subscribe({
// 							next: observer.next.bind(observer),
// 							error: observer.error.bind(observer),
// 							complete: observer.complete.bind(observer),
// 						});
// 					}
// 				})
// 				.catch((err) => observer.error(err));
// 		});
// 	});
// }

export default AuthApolloProvider;