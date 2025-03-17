import { z } from "zod";

export type GraphQLResponse = {
    data: Record<string, Entity[]> | null;
    loading: boolean;
    error: Error | undefined;
}

// Define the Zod schema for the Blueprint
export type DataType = z.infer<typeof dataTypeSchema>;
export const dataTypeSchema = z.enum([
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
]);

export type Field = z.infer<typeof fieldSchema>;
export const fieldSchema = z.object({
	name: z.string(),
	displayName: z.string(),
	type: dataTypeSchema,
	description: z.string(),
});

// export type ReturnedField = z.infer<typeof returnedFieldSchema>;
// export const returnedFieldSchema = z.object({
// 	name: z.string(),
// 	displayName: z.string(),
// 	type: dataTypeSchema,
// });

export type Entity = z.infer<typeof entitySchema>;
export const entitySchema = z.object({
	name: z.string(),
	displayName: z.string(),
	description: z.string(),
	fields: z.array(fieldSchema),
});

// export type ReturnedEntity = z.infer<typeof returnedEntitySchema>;
// export const returnedEntitySchema = z.object({
// 	name: z.string(),
// 	displayName: z.string(),
// 	description: z.string(),
// 	fields: z.array(returnedFieldSchema),
// });

export type Relationship = z.infer<typeof relationshipSchema>;
export const relationshipSchema = z.object({
	name: z.string(),
	type: z.literal("relationship"),
	displayName: z.string(),
	description: z.string(),
});	


export type Blueprint = z.infer<typeof blueprintSchema>;
export const blueprintSchema = z.object({
	version: z.string(),
	entities: z.array(entitySchema),
	relationships: z.array(relationshipSchema),
});

export const sheetsMapSchema = z.object({
    spreadsheetId: z.string(),
	sheetId: z.string(),
	column: z.string(),
});

export type SheetsMap = z.infer<typeof sheetsMapSchema>;

// Define the operation schema
export const operationSchema = z.object({
    fieldName: z.string(),
    source: z.string(),
    map: z.record(z.unknown()),
});

export type Operation = z.infer<typeof operationSchema>;

/**
 * Operation type for data operations
 */
// export interface Operation {
//   fieldName: string;
//   source: string;
//   map: Record<string, unknown>;
// }

export const entityMapSchema = z.object({
    entityName: z.string(),
    operations: z.array(operationSchema),
});

export type EntityMap = z.infer<typeof entityMapSchema>;

export const mappingsSchema = z.array(entityMapSchema);

export type Mappings = z.infer<typeof mappingsSchema>;