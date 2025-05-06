import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./Chat/MarkdownContent";

export function DocumentEditor() {
	const {
		state: { artifacts },
	} = useWorkspace();
	const document = artifacts.documents[0] || "";

	return (
		<div
			className={cn(
				"w-full h-full overflow-auto",
				"bg-background",
				"flex flex-col items-center",
			)}
		>
			{/* Main content area with page-like appearance */}
			<div className="w-[8.5in] min-w-[8.5in] py-8 space-y-8">
				{/* Each "page" is a section with a white background and shadow */}
				<div
					className={cn(
						"bg-white",
						"border rounded-lg",
						"shadow-sm",
						"p-8",
						"min-h-[calc(100vh-4rem)]",
					)}
				>
					<MarkdownContent content={document} />
				</div>
				{/* Empty page at the bottom to create the "one more page" effect */}
				<div
					className={cn(
						"bg-white",
						"border rounded-lg",
						"shadow-sm",
						"p-8",
						"min-h-[calc(100vh-4rem)]",
						"opacity-50",
						"mb-8", // Extra margin at the bottom
					)}
				>
					{/* This creates the visual effect of another page */}
				</div>
			</div>
		</div>
	);
}
