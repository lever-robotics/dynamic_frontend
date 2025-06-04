import * as React from "react";
import { useToast } from "./ToastProvider";

export function ToastExample() {
	const { showToast } = useToast();

	const handleShowError = () => {
		showToast({
			type: "error",
			title: "Error",
			message: "Something went wrong!",
			source: "client",
			action: {
				label: "Retry",
				onClick: () => {
					console.log("Retrying...");
				},
			},
		});
	};

	const handleShowWarning = () => {
		showToast({
			type: "warning",
			title: "Warning",
			message: "This action might have consequences",
			source: "client",
		});
	};

	const handleShowInfo = () => {
		showToast({
			type: "info",
			title: "Info",
			message: "Your request is being processed",
			source: "client",
		});
	};

	return (
		<div className="flex gap-4">
			<button
				type="button"
				onClick={handleShowError}
				className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
			>
				Show Error
			</button>
			<button
				type="button"
				onClick={handleShowWarning}
				className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
			>
				Show Warning
			</button>
			<button
				type="button"
				onClick={handleShowInfo}
				className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
				Show Info
			</button>
		</div>
	);
}
