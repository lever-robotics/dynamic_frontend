import { useState } from "react";
import { ChatInput } from "./Chat/ChatInput";
import { useToast } from "./ui/Toast/ToastProvider";

interface LaunchChatProps {
	onStartAnalysis: (message: string) => void;
}

export function LaunchChat({ onStartAnalysis }: LaunchChatProps) {
	const [isConnected] = useState(true); // Always connected in this context
	const { showToast } = useToast();

	const handleSubmit = async (message: string) => {
		console.log("[LaunchChat] Submitting message:", message);
		try {
			// Simulate an API call that might fail
			if (message.length < 10) {
				throw new Error("Message must be at least 10 characters long");
			}

			// If successful, show success toast
			showToast({
				type: "info",
				title: "Analysis Started",
				message: "Your analysis request is being processed",
				source: "client",
			});

			// Call the actual handler
			await onStartAnalysis(message);
		} catch (error) {
			console.error("[LaunchChat] Error:", error);
			showToast({
				type: "error",
				title: "Error Starting Analysis",
				message:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				source: "client",
				action: {
					label: "Try Again",
					onClick: () => handleSubmit(message),
				},
			});
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-full w-full bg-background">
			<div className="w-full max-w-2xl p-4">
				<div className="w-full">
					<ChatInput
						isConnected={isConnected}
						onSubmit={handleSubmit}
						isLaunchMode={true}
					/>
				</div>
			</div>
		</div>
	);
}
