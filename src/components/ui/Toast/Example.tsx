import * as React from "react";
import { useToast } from "./ToastProvider";

export function ToastExample() {
	const { showToast, showErrorToast, showInfoToast } = useToast();
	const handleShowError = () => {
		showErrorToast(new Error("Something went wrong!"), {
			title: "Operation Failed",
			retryFn: () => {
				console.log("Retrying...");
			},
		});
	};

	const handleShowWarning = () => {
		showToast({
			type: "warning",
			title: "Warning",
			message: "This action might have consequences",
		});
	};

	const handleShowInfo = () => {
		showInfoToast("Here's some information");
	};

	return (
		<div className="flex flex-col gap-4">
			<button
				type="button"
				className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
				onClick={handleShowError}
			>
				Show Error Toast
			</button>
			<button
				type="button"
				className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
				onClick={handleShowWarning}
			>
				Show Warning Toast
			</button>
			<button
				type="button"
				className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				onClick={handleShowInfo}
			>
				Show Info Toast
			</button>
		</div>
	);
}
