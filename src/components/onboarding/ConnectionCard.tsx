import type { Connection } from "@/types/connectors";
import { useState } from "react";

interface ConnectionCardProps {
	connection: Connection;
	onClick: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
	connection,
	onClick,
}) => {
	const [isHovering, setIsHovering] = useState<string | null>(null);

	return (
		<button
			type="button"
			className={`flex gap-4 items-center p-4 rounded-xl border cursor-pointer transition-all w-full ${
				!connection.isAvailable ? "opacity-50 cursor-not-allowed" : ""
			} ${connection.isConnected ? "border-primary-500 bg-primary-50" : ""}`}
			onMouseEnter={() =>
				connection.isAvailable && setIsHovering(connection.name)
			}
			onMouseLeave={() => setIsHovering(null)}
			onClick={() => connection.isAvailable && onClick()}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					connection.isAvailable && onClick();
				}
			}}
			style={{
				background:
					isHovering === connection.name
						? "rgb(var(--primary-200))"
						: connection.isConnected
							? "rgb(var(--primary-300))"
							: "white",
			}}
		>
			<img
				className={`w-10 h-10 ${!connection.isAvailable ? "grayscale" : ""}`}
				src={connection.icon}
				alt={`${connection.name} icon`}
			/>
			<div className="flex flex-col items-start">
				<h3 className="text-base font-medium text-neutral-900">
					{connection.name}
				</h3>
				<p className="text-sm text-stone-500">{connection.description}</p>
				{connection.isConnected && (
					<p className="text-xs text-primary-600 mt-1">Connected</p>
				)}
			</div>
		</button>
	);
};
