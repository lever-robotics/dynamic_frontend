import type { BaseToast, Toast, ToastPosition } from "@/types/notifications";
import { cn } from "@/utils/styles";
import * as ToastPrimitive from "@radix-ui/react-toast";
import * as React from "react";

interface ToastContextType {
	showToast: (toast: BaseToast) => void;
	showErrorToast: (
		error: Error | string,
		options?: { retryFn?: () => void; title?: string },
	) => void;
	showSuccessToast: (message: string, title?: string) => void;
	showLoadingToast: (message: string, title?: string) => void;
	showInfoToast: (message: string, title?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
	undefined,
);

interface ToastProviderProps {
	children: React.ReactNode;
	position?: ToastPosition;
	duration?: number;
}

export function ToastProvider({
	children,
	position = "bottom-right",
	duration = 5000,
}: ToastProviderProps) {
	const [toasts, setToasts] = React.useState<Toast[]>([]);

	// Toast helpers
	const showToast = React.useCallback((toast: BaseToast) => {
		const id = crypto.randomUUID();
		const timestamp = Date.now();
		setToasts((prev) => [...prev, { ...toast, id, timestamp }]);
	}, []);

	const showErrorToast = React.useCallback(
		(
			error: Error | string,
			options?: { retryFn?: () => void; title?: string },
		) => {
			const message = error instanceof Error ? error.message : error;
			const toast: BaseToast = {
				type: "error",
				title: options?.title ?? "Error",
				message,
			};
			if (options?.retryFn) {
				toast.action = {
					label: "Try Again",
					onClick: options.retryFn,
				};
			}
			showToast(toast);
		},
		[showToast],
	);

	const showSuccessToast = React.useCallback(
		(message: string, title = "Success") => {
			showToast({
				type: "success",
				title,
				message,
			});
		},
		[showToast],
	);

	const showLoadingToast = React.useCallback(
		(message: string, title = "Loading") => {
			showToast({
				type: "loading",
				title,
				message,
			});
		},
		[showToast],
	);

	const showInfoToast = React.useCallback(
		(message: string, title = "Info") => {
			showToast({
				type: "info",
				title,
				message,
			});
		},
		[showToast],
	);

	const removeToast = React.useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const getPositionStyles = (position: ToastPosition): string => {
		switch (position) {
			case "top-right":
				return "top-0 right-0";
			case "top-left":
				return "top-0 left-0";
			case "bottom-right":
				return "bottom-0 right-0";
			case "bottom-left":
				return "bottom-0 left-0";
			default:
				return "bottom-0 right-0";
		}
	};

	const contextValue = React.useMemo(
		() => ({
			showToast,
			showErrorToast,
			showSuccessToast,
			showLoadingToast,
			showInfoToast,
		}),
		[
			showToast,
			showErrorToast,
			showSuccessToast,
			showLoadingToast,
			showInfoToast,
		],
	);

	return (
		<ToastContext.Provider value={contextValue}>
			<ToastPrimitive.Provider>
				{children}
				<div
					className={cn(
						"fixed flex flex-col gap-2 p-4 w-full sm:max-w-sm z-50",
						getPositionStyles(position),
					)}
					aria-live="polite"
				>
					{toasts.map((toast) => (
						<ToastPrimitive.Root
							key={toast.id}
							duration={toast.duration ?? duration}
							className={cn(
								"bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4",
								"border border-gray-200 dark:border-gray-700",
								"data-[state=open]:animate-in data-[state=closed]:animate-out",
								"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
								"data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
								"data-[swipe=cancel]:translate-x-0",
								"data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
								"data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
							)}
							onOpenChange={(open) => {
								if (!open) {
									setTimeout(() => {
										removeToast(toast.id);
									}, 100);
								}
							}}
						>
							<div className="flex justify-between items-start gap-4">
								<div className="flex-1">
									<ToastPrimitive.Title className="font-semibold text-gray-900 dark:text-white">
										{toast.title}
									</ToastPrimitive.Title>
									<ToastPrimitive.Description className="mt-1 text-sm text-gray-600 dark:text-gray-300">
										{toast.message}
									</ToastPrimitive.Description>
									{toast.action && (
										<button
											type="button"
											onClick={toast.action.onClick}
											className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
										>
											{toast.action.label}
										</button>
									)}
								</div>
								<ToastPrimitive.Close
									className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
									aria-label="Close"
								>
									<svg
										className="h-5 w-5"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</ToastPrimitive.Close>
							</div>
						</ToastPrimitive.Root>
					))}
				</div>
			</ToastPrimitive.Provider>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const ctx = React.useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within a ToastProvider");
	return ctx;
}
