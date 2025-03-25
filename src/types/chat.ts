// Message Types
// export interface Message {
// 	type: "user" | "assistant";
// 	content: string;
// 	segments: MessageSegment[];
// }

// export interface MessageSegment {
// 	type: "text" | "tool";
// 	content: string;
// 	toolExecution?: ToolExecution;
// }


// WebSocket Message Types
export interface WebSocketMessage {
	type: WebSocketMessageType;
	userId: string;
	payload: any;
	timestamp: string;
	error?: string;
}

export type WebSocketMessageType =
	| "toLLM"
	| "toUser"
	| "error"
	| "streamStart"
	| "streamChunk"
	| "streamEnd"
	| "error"
	| "toolStart"
	| "toolEnd"
	| "toolResult"
	| "toolError";


export interface ToolExecutionResponse {
	tool: string;
	arguments: Record<string, any>;
}

export interface ToolResultResponse {
	tool: string;
	result?: any;
	error?: string;
}

export interface LLMStreamResponse {
	text: string;
	isComplete: boolean;
}

export interface CompleteResponse {
	response: string;
	metadata?: Record<string, any>;
}

export interface ErrorResponse {
	message: string;
	details?: string;
}

// UI State Types
// export interface ChatState {
// 	messages: Message[];
// 	isConnected: boolean;
// 	currentMessage: {
// 		text: string;
// 		segments: MessageSegment[];
// 	};
// 	autoScroll: boolean;
// 	userHasScrolled: boolean;
// 	connectionError: string | null;
// 	accumulatedText: string;
// }
