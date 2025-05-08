import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Download } from "lucide-react";
import { useState } from "react";
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
	const [activeTab, setActiveTab] = useState<string>("");

	// Create tabs from artifacts
	const tabs = [
		...artifacts.documents.map((_, index) => `Document ${index + 1}`),
		...artifacts.images.map((_, index) => `Image ${index + 1}`),
		...artifacts.queries.map((_, index) => `Query ${index + 1}`),
	];
	console.log("Tabs:", tabs);
	console.log("Active Tab:", activeTab);

	const handleDownloadPDF = () => {
		// TODO: Implement PDF download functionality
		console.log("Downloading PDF...");
	};

	const handleTabChange = (tab: string) => {
		const index = tabs.findIndex((t) => t === tab);
		setActiveTab(tab);
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
				return <DocumentEditor />;
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
