import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./Chat/MarkdownContent";

export function DocumentEditor() {
	const { artifacts } = useWorkspace();

	const document = artifacts.documents[0]?.content;

	return (
		<div className="w-full h-full">
			<div className="flex justify-center w-full">
				<div className="w-[8.5in] min-w-[8.5in] py-8 space-y-8">
					{/* Each "page" is a section with a white background and shadow */}
					<div
						className={cn(
							"bg-white",
							"border rounded-lg",
							"shadow-sm",
							"p-8",
							"min-h-[11in]", // Standard letter height
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
							"min-h-[11in]", // Standard letter height
							"opacity-50",
							"mb-8", // Extra margin at the bottom
						)}
					>
						{/* This creates the visual effect of another page */}
					</div>
				</div>
			</div>
		</div>
	);
}
