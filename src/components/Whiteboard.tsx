import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import html2pdf from "html2pdf.js";
import { Download } from "lucide-react";
import { useRef, useState } from "react";
import { DataExecutor } from "./DataExecutor";
import { DocumentEditor } from "./DocumentEditor";
import { GraphViewer } from "./GraphViewer";
import { TabGroup } from "./onboarding/TabGroup";

export function Whiteboard() {
	const {
		state: { currentArtifact, artifacts },
		setCurrentArtifact,
	} = useWorkspace();
	const [activeTab, setActiveTab] = useState(0);
	const documentRef = useRef<HTMLDivElement>(null);

	if (!currentArtifact || !artifacts.documents.length) return;

	const artifactExists = [
		...artifacts.documents,
		...artifacts.images,
		...artifacts.queries,
	].some((artifact) => artifact.id === currentArtifact.id);

	if (!artifactExists) {
		setCurrentArtifact(artifacts.documents[0]);
		setActiveTab(0);
	}

	// Create tabs from artifacts
	const tabs = [
		...artifacts.documents.map((_, index) => `Document ${index + 1}`),
		...artifacts.images.map((_, index) => `Image ${index + 1}`),
		...artifacts.queries.map((_, index) => `Query ${index + 1}`),
	];
	console.log("Tabs:", tabs);
	console.log("Active Tab:", activeTab);

	const handleTabChange = (tab: string) => {
		const index = tabs.findIndex((t) => t === tab);
		setActiveTab(index);

		// Determine the type of artifact based on the index
		const documentCount = artifacts.documents.length;
		const imageCount = artifacts.images.length;

		if (index < documentCount) {
			// Document tab
			setCurrentArtifact(artifacts.documents[index]);
		} else if (index < documentCount + imageCount) {
			// Image tab
			const imageIndex = index - documentCount;
			setCurrentArtifact(artifacts.images[imageIndex]);
		} else {
			// Query tab
			const queryIndex = index - documentCount - imageCount;
			setCurrentArtifact(artifacts.queries[queryIndex]);
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
				<div className="flex-none bg-white border-t border-gray-200">
					<TabGroup
						tabs={tabs}
						activeTab={tabs[activeTab]}
						onTabChange={(tab) => handleTabChange(tab)}
					/>
				</div>
			)}
		</div>
	);
}
