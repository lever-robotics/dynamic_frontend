import type React from "react";
import { useState } from "react";

type FieldState = "blank" | "ai" | "user";

interface TextareaFieldProps {
	label?: string;
	value: string;
	className?: string;
	state?: FieldState;
	onUpdate?: (newValue: string) => Promise<void>;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
	label,
	value,
	className = "",
	state = "blank",
	onUpdate,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [currentValue, setCurrentValue] = useState(value);

	const getStateClasses = () => {
		switch (state) {
			case "blank":
				return "border border-stone-300 bg-stone-50 text-stone-500";
			case "ai":
				return "border border-stone-200 bg-white text-stone-400";
			case "user":
				return "border border-stone-200 bg-white text-stone-900";
			default:
				return "border border-stone-200 bg-white";
		}
	};

	const handleBlur = async () => {
		setIsEditing(false);
		if (onUpdate && currentValue !== value) {
			await onUpdate(currentValue);
		}
	};

	return (
		<div className="w-full mb-4">
			{label && (
				<label
					htmlFor={label.toLowerCase()}
					className="self-start mt-3.5 text-sm font-medium text-stone-700"
				>
					{label}
				</label>
			)}
			<div
				className={`relative mt-2 rounded-md ${getStateClasses()} ${className}`}
			>
				<textarea
					id={label?.toLowerCase()}
					value={currentValue}
					onChange={(e) => setCurrentValue(e.target.value)}
					onFocus={() => setIsEditing(true)}
					onBlur={handleBlur}
					className="block w-full rounded-md py-2 px-3 text-sm leading-6 focus:outline-none resize-none min-h-[35px] bg-transparent"
					rows={3}
				/>
			</div>
		</div>
	);
};
