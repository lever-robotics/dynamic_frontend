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
		<form onSubmit={handleSubmit} className="border-t p-4">
			<div className="flex gap-2">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder="Type a message..."
					className="flex-1 rounded-lg border p-2"
					disabled={!isConnected}
				/>
				<button
					type="submit"
					disabled={!isConnected || !inputValue.trim()}
					className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
				>
					Send
				</button>
			</div>
			{error && <p className="mt-2 text-sm text-red-500">{error}</p>}
		</form>
	);
} 