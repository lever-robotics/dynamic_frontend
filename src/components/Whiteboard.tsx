import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { workspaceStore } from "@/stores/WorkspaceStore";
import html2pdf from "html2pdf.js";
import { Download } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { DataExecutor } from "./DataExecutor";
import { DocumentEditor } from "./DocumentEditor";
import { GraphViewer } from "./GraphViewer";
import { TabGroup } from "./onboarding/TabGroup";

// interface WhiteboardProps {}

export function Whiteboard() {
	const documentRef = useRef<HTMLDivElement>(null);
	const { artifacts, currentArtifact } = workspaceStore;

	// Create tabs from artifacts with their IDs
	const tabs = [
		...artifacts.documents.map((doc) => ({ label: "Document", id: doc.id })),
		...artifacts.images.map((img, index) => ({
			label: `Image ${index + 1}`,
			id: img.id,
		})),
		...artifacts.queries.map((query, index) => ({
			label: `Query ${index + 1}`,
			id: query.id,
		})),
	];

	const handleTabChange = (tab: string) => {
		const selectedTab = tabs.find((t) => t.label === tab);
		if (!selectedTab) return;

		// Find the artifact with the matching ID
		const allArtifacts = [
			...artifacts.documents,
			...artifacts.images,
			...artifacts.queries,
		];
		const artifact = allArtifacts.find((a) => a.id === selectedTab.id);
		if (artifact) {
			workspaceStore.currentArtifact = artifact;
		}
	};

	const handleDownloadPDF = async () => {
		if (!documentRef.current) return;

		// Get all page elements
		const pages = documentRef.current.querySelectorAll(
			".bg-white.border.rounded-lg",
		);
		if (!pages.length) return;

		// Configure PDF options
		const opt = {
			margin: [0.5, 0.5, 0.5, 0.5], // [top, right, bottom, left] in inches
			filename: "document.pdf",
			image: { type: "jpeg", quality: 0.98 },
			html2canvas: {
				scale: 2,
				useCORS: true,
				letterRendering: true,
				windowWidth: 816, // 8.5 inches at 96 DPI
				windowHeight: 1056, // 11 inches at 96 DPI
				scrollY: 0,
				scrollX: 0,
			},
			jsPDF: {
				unit: "in",
				format: "letter",
				orientation: "portrait",
				compress: true,
			},
			pagebreak: { mode: ["avoid-all", "css", "legacy"] },
		};

		try {
			// Create a worker for PDF generation
			const worker = html2pdf().set(opt);

			// Process each page
			for (let i = 0; i < pages.length; i++) {
				const page = pages[i];
				if (i === 0) {
					// First page
					await worker.from(page).save();
				} else {
					// Additional pages
					await worker
						.from(page)
						.toPdf()
						.get("pdf")
						.then((pdf: { addPage: () => void }) => {
							pdf.addPage();
						})
						.save();
				}
			}
		} catch (error) {
			console.error("Error generating PDF:", error);
		}
	};

	const renderView = () => {
		if (!currentArtifact) return null;

		switch (currentArtifact.artifact_type) {
			case "document":
				return (
					<div ref={documentRef} className="w-full h-full">
						<DocumentEditor />
					</div>
				);
			case "image":
				return <GraphViewer />;
			case "query":
				return <DataExecutor />;
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* Content area with download button and scrollable content */}
			<div className="flex-1 relative min-h-0">
				{/* Floating download button */}
				{currentArtifact?.artifact_type === "document" && (
					<div className="absolute top-4 right-8 z-50">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="rounded-md shadow-md hover:shadow-lg transition-shadow"
								>
									<Download className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={handleDownloadPDF}>
									Download PDF
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}

				{/* Scrollable content */}
				<div className="h-full overflow-auto bg-background">{renderView()}</div>
			</div>

			{/* Fixed tab section */}
			{tabs.length > 0 && (
				<div className="flex-none overflow-auto bg-white border-t border-gray-200 p-2">
					<TabGroup
						tabs={tabs.map((t) => t.label)}
						activeTab={
							tabs.find((t) => t.id === currentArtifact?.id)?.label ||
							tabs[0].label
						}
						onTabChange={handleTabChange}
					/>
				</div>
			)}
		</div>
	);
}

export default observer(Whiteboard);
