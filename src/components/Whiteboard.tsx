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
		state: { currentView, artifacts, document, image, query },
		setView,
		setDocument,
		setImage,
		setQuery,
	} = useWorkspace();
	const [activeTab, setActiveTab] = useState(0);
	const documentRef = useRef<HTMLDivElement>(null);

	// Create tabs from artifacts
	const tabs = [
		...artifacts.documents.map((_, index) => `Document ${index + 1}`),
		...artifacts.images.map((_, index) => `Image ${index + 1}`),
		...artifacts.queries.map((_, index) => `Query ${index + 1}`),
	];

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
						.then((pdf: any) => {
							pdf.addPage();
						})
						.save();
				}
			}
		} catch (error) {
			console.error("Error generating PDF:", error);
		}
	};

	const handleTabChange = (index: number) => {
		setActiveTab(index);
		// Determine the type of artifact based on the index
		const documentCount = artifacts.documents.length;
		const imageCount = artifacts.images.length;

		if (index < documentCount) {
			// Document tab
			setDocument(artifacts.documents[index]);
			setView("DocViewer");
		} else if (index < documentCount + imageCount) {
			// Image tab
			const imageIndex = index - documentCount;
			setImage(artifacts.images[imageIndex]);
			setView("GraphViewer");
		} else {
			// Query tab
			const queryIndex = index - documentCount - imageCount;
			setQuery(artifacts.queries[queryIndex]);
			setView("DataExecutor");
		}
	};

	const renderView = () => {
		switch (currentView) {
			case "DocViewer":
				return (
					<div ref={documentRef} className="w-full">
						<DocumentEditor />
					</div>
				);
			case "GraphViewer":
				return <GraphViewer />;
			default:
				return <DataExecutor initialQuery={query} />;
		}
	};

	return (
		<div className="flex-1 flex flex-col items-center h-full overflow-auto relative">
			{currentView === "DocViewer" && (
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

			{renderView()}

			{/* Artifact Tabs */}
			{tabs.length > 0 && (
				<div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
					<TabGroup
						tabs={tabs}
						activeTab={activeTab}
						onTabChange={handleTabChange}
					/>
				</div>
			)}
		</div>
	);
}
