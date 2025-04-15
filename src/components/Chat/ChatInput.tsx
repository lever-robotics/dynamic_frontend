import type React from "react";
import { useState } from "react";

interface ChatInputProps {
	isConnected: boolean;
	onSubmit: (message: string) => void;
	error?: string | null;
}

export function ChatInput({ isConnected, onSubmit, error }: ChatInputProps) {
	const [inputValue, setInputValue] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputValue.trim() || !isConnected) return;

		onSubmit(inputValue.trim());
		setInputValue("");
	};

	return (
		<form onSubmit={handleSubmit} className="p-4">
			<div className="relative flex items-center">
				<textarea
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder="Type a message..."
					className="w-full resize-none rounded-full border border-input bg-background px-4 py-3 pr-12 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] max-h-[132px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] leading-relaxed"
					disabled={isConnected}
					rows={1}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && e.ctrlKey) {
							e.preventDefault();
							handleSubmit(e);
						}
					}}
				/>
				<button
					type="submit"
					disabled={isConnected || !inputValue.trim()}
					className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors hover:bg-accent/20 disabled:pointer-events-none disabled:opacity-50"
					aria-label="Send message"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-4 w-4"
						aria-hidden="true"
					>
						<path d="M12 19V5" />
						<path d="m5 12 7-7 7 7" />
					</svg>
				</button>
			</div>
			{error && <p className="mt-2 text-sm text-red-500">{error}</p>}
		</form>
	);
} 