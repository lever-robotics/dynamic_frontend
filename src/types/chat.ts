// Core Message Types
export interface MessageBubble {
	id: string;
	type: "user" | "assistant" | "agent";
	chunks: MessageChunkBubble[];
	status?: AgentStatus;
	agentName?: string;
	error?: string;
	timestamp?: string; // Optional, for display purposes
}

export interface MessageChunkBubble {
	content?: string;
	toolCall?: ToolExecutionBubble;
}

// Agent Types
export type AgentStatus = "starting" | "running" | "complete" | "error";

// export interface AgentExecutionBubble {
// 	name: string;
// 	status: AgentStatus;
// 	toolCalls: ToolExecutionBubble[];
// 	error?: string;
// }

export interface ToolExecutionBubble {
	tool: string;
	agentName: string;
	arguments: Record<string, any>;
	status?: ToolStatus;
	result?: any;
	error?: string;
}

export interface Payload {
	type: WebSocketMessageType;
}

export interface MessageChunk extends Payload {
	type: "text";
	content: string;
}

export interface AgentChunk extends Payload {
	type: "agent";
	name: string;
	status: AgentStatus;
	error?: string;
}

export interface ToolChunk extends Payload {
	type: "tool";
	tool: string;
	agentName: string;
	arguments: Record<string, any>;
	status: ToolStatus;
	result?: any;
	error?: string;
}

export interface ResultChunk extends Payload {
	type: "result";
	result: any;
	error?: string;
}

export interface ErrorChunk extends Payload {
	type: "error";
	error: string;
}

export interface ContextChunk extends Payload {
	type: "context";
	context: string;
}

export interface ToLLMMessage extends Payload {
	type: "toLLM";
	text: string;
}

// Tool Types
export type ToolStatus = "running" | "complete" | "error";

// WebSocket Message Types
export type WebSocketMessageType =
	| "toLLM"
	| "text"
	| "tool"
	| "agent"
	| "result"
	| "error"
	| "context";

// Send these Messages
export interface WebSocketMessage {
	type: WebSocketMessageType;
	messageId: string;
	userId: string;
	payload: Payload;
	timestamp: string;
}

// WebSocket Response Types
// export interface AgentExecutionResponse {
// 	name: string;
// 	status: AgentStatus;
// 	error?: string;
// }

// export interface ToolExecutionResponse {
// 	tool: string;
// 	agentName: string;
// 	arguments: Record<string, any>;
// 	status: ToolStatus;
// 	result?: any;
// 	error?: string;
// }

// export interface ToolResultResponse { // Not sure how to use the result type yet
// 	tool: string;
// 	result?: any;
// 	error?: string;
// }

// // Type Guards
// export function isChunkPayload(
// 	payload: WebSocketMessage["payload"],
// ): payload is { type: "chunk"; chunk: MessageChunk } {
// 	return payload.type === "chunk";
// }

// export function isToolResultPayload( // Not sure how to use the result type yet
// 	payload: WebSocketMessage["payload"],
// ): payload is { type: "result"; tool: string; result: any; name: string } {
// 	return payload.type === "result";
// }

// export function isErrorPayload(
// 	payload: WebSocketMessage["payload"],
// ): payload is { type: "error"; message: string } {
// 	return payload.type === "error";
// }
