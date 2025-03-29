// Core Message Types
export interface Message {
	id: string;
	type: "user" | "assistant";
	chunks: MessageChunk[];
	timestamp?: string; // Optional, for display purposes
}

export interface MessageChunk {
	type: "text" | "tool";
	content: string;
	toolExecution?: ToolExecution;
}

export interface ToolExecution {
	tool: string;
	arguments: Record<string, any>;
	status?: "starting" | "running" | "complete" | "error";
	result?: any;
	error?: string;
}

// WebSocket Message Types
export type WebSocketMessageType = "toLLM" | "chunk" | "result" | "error" | "context";

export interface WebSocketMessage {
	type: WebSocketMessageType;
	userId: string;
	payload:
		| { type: "chunk"; chunk: MessageChunk }
		| { type: "result"; tool: string; result: any }
		| { type: "error"; message: string }
		| { type: "toLLM"; text: string }
		| { type: "context"; context: string};
	timestamp: string;
}

// WebSocket Message Types
export interface ToolExecutionResponse {
	tool: string;
	arguments: Record<string, any>;
}

export interface ToolResultResponse {
	tool: string;
	result?: any;
	error?: string;
}

// Add type guards
export function isChunkPayload(
	payload: WebSocketMessage["payload"],
): payload is { type: "chunk"; chunk: MessageChunk } {
	return payload.type === "chunk";
}

export function isToolResultPayload(
	payload: WebSocketMessage["payload"],
): payload is { type: "result"; tool: string; result: any } {
	return payload.type === "result";
}

export function isErrorPayload(
	payload: WebSocketMessage["payload"],
): payload is { type: "error"; message: string } {
	return payload.type === "error";
}
