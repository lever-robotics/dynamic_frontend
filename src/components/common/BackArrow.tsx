import type React from "react";

interface BackArrowProps {
	onClick: () => void;
}

export const BackArrow: React.FC<BackArrowProps> = ({ onClick }) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center text-gray-500 hover:text-gray-700"
		>
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
		</button>
	);
};
