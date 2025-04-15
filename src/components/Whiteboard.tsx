import { useWorkspace } from "@/contexts/WorkspaceContext";
import { DocumentEditor } from "./DocumentEditor";
import { DataExecutor } from "./DataExecutor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Whiteboard() {
    const { state: { currentView } } = useWorkspace();

    const handleDownloadPDF = () => {
        // TODO: Implement PDF download functionality
        console.log('Downloading PDF...');
    };

    return (
        <div className="flex-1 flex flex-col items-center h-full overflow-auto relative">
            {currentView === 'DocViewer' && (
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

            {currentView === 'DocViewer' ? (
                <DocumentEditor />
            ) : (
                <DataExecutor />
            )}
        </div>
    );
}