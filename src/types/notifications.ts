export interface BaseToast {
	type: "error" | "warning" | "info" | "success" | "loading";
	title: string;
	message: string;
	source?: "backend" | "ai" | "client";
	action?: {
		label: string;
		onClick: () => void;
	};
	duration?: number; // Override default duration
}

export interface Toast extends BaseToast {
	id: string;
	timestamp: number;
}

export interface ErrorDetails {
	code?: string;
	message: string;
	source: "backend" | "ai" | "client";
	originalError?: unknown;
	context?: Record<string, unknown>;
	retryable?: boolean;
}

export type ToastPosition =
	| "top-right"
	| "top-left"
	| "bottom-right"
	| "bottom-left";

export interface ToastConfig {
	position: ToastPosition;
	duration?: number; // in milliseconds
	maxVisible?: number;
}
