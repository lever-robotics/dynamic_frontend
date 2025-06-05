import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";

export function GraphViewer() {
	const { artifacts, currentArtifact } = useWorkspace();
	return (
		<div
			className={cn(
				"w-full h-full overflow-auto",
				"bg-background",
				"flex flex-col items-center justify-center",
			)}
		>
			<div className="w-full max-w-4xl p-8">
				<div className="bg-white rounded-lg shadow-lg p-6">
					<div className="h-[500px] border rounded-lg bg-gray-50 flex items-center justify-center">
						{currentArtifact?.artifact_type === "image" ? (
							<img
								src={currentArtifact.content}
								alt="Graph visualization"
								className="max-w-full max-h-full object-contain"
							/>
						) : (
							<p className="text-gray-500">No graph image available</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
