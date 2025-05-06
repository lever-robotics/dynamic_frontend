import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
	isOpen: boolean;
	onClose?: () => void;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
	showCloseButton?: boolean;
	preventBackgroundClick?: boolean;
}

const sizeClasses = {
	sm: "w-[400px] h-[500px]",
	md: "w-[600px] h-[700px]",
	lg: "w-[800px] h-[800px]",
	xl: "w-[1400px] h-[900px]",
};

export function Modal({
	isOpen,
	onClose,
	children,
	size = "md",
	showCloseButton = true,
	preventBackgroundClick = false,
}: ModalProps) {
	// Handle ESC key press
	const handleEscapeKey = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape" && onClose) {
				onClose();
			}
		},
		[onClose],
	);

	// Add/remove event listeners and handle body scroll
	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleEscapeKey);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, handleEscapeKey]);

	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-md"
				onClick={preventBackgroundClick ? undefined : onClose}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						onClose?.();
					}
				}}
				role="button"
				tabIndex={0}
			/>

			{/* Modal */}
			<div
				className={`relative bg-white rounded-3xl shadow-xl ${sizeClasses[size]} flex flex-col`}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{/* Close button */}
				{showCloseButton && onClose && (
					<button
						onClick={onClose}
						type="button"
						className="absolute top-5 right-6 text-gray-400 hover:text-gray-600"
						aria-label="Close modal"
					>
						✕
					</button>
				)}

				{/* Content */}
				<div className="flex-1 overflow-hidden flex flex-col">
					<div className="flex-1 overflow-auto p-6">{children}</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
