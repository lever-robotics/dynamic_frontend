export interface ErrorNotification {
	id: string;
	type: "error" | "warning" | "info";
	title: string;
	message: string;
	source?: "backend" | "ai" | "client";
	timestamp: number;
	action?: {
		label: string;
		onClick: () => void;
	};
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
