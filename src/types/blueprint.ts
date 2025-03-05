import { z } from "zod";
// Define the Zod schema for the Blueprint
export const blueprintSchema = z.object({
	version: z.string(),
	entities: z.array(
		z.object({
			name: z.string(),
			displayName: z.string(),
			description: z.string(),
			fields: z.array(
				z.object({
					name: z.string(),
					// displayName: z.string(),
					type: z.enum([
						"string",
						"float",
						"text",
						"number",
						"boolean",
						"date",
						"datetime",
						"time",
						"array",
						"object",
						"enum",
						"relationship",
						"entity",
						"url",
					]),
					description: z.string(),
				}),
			),
		}),
	),
	relationships: z.array(
		z.object({
			name: z.string(),
			type: z.literal("relationship"),
			displayName: z.string(),
			description: z.string(),
		}),
	),
});

// Use Zod's infer type instead of a separate interface
export type Blueprint = z.infer<typeof blueprintSchema>;