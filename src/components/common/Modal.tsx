import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    showCloseButton?: boolean;
    preventBackgroundClick?: boolean;
}

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
        [onClose]
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
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={preventBackgroundClick ? undefined : onClose}
            />

            {/* Modal */}
            <div
                className={"relative bg-white rounded-lg shadow-xl m-4"}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                {showCloseButton && onClose && (
                    <button
                        onClick={onClose}
                        type="button"
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>,
        document.body
    );
} 