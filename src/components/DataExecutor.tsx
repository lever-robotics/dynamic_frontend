import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";
import { Connections } from "@/types/connectors";
import { useAuth } from "@/utils/AuthProvider";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { Copy, Download, FileSpreadsheet, FileText, Play } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { ConnectionCard } from "./onboarding/ConnectionCard";
import { type Tab, TabGroupInject } from "./onboarding/TabGroupInject";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface QueryResult {
	[key: string]: string | number | boolean | null;
}

export function DataExecutor() {
	const { currentArtifact, ws } = useWorkspace();

	const [TempQuery, setTempQuery] = useState(currentArtifact?.content || "");
	const [results, setResults] = useState<QueryResult[]>([]);
	const [columns, setColumns] = useState<string[]>([]);
	const [isExecuting, setIsExecuting] = useState(false);

	// Update TempQuery when currentArtifact changes
	useEffect(() => {
		if (currentArtifact?.content) {
			setTempQuery(currentArtifact.content);
		}
	}, [currentArtifact]); // Watch the entire currentArtifact object

	const { userConfig } = useUserConfig();
	const connectors = userConfig?.data_connectors || [];

	const availableConnections = Connections.filter((conn) =>
		connectors.some((connector) => connector.type === conn.type),
	);
	const [selectedConnector, setSelectedConnector] = useState<string>(
		availableConnections[0].type,
	);
	const { getValidToken } = useAuth();

	if (currentArtifact?.metadata?.data_source) {
		const dataSource = currentArtifact.metadata.data_source;
		// Find the matching connection type
		const matchingConnection = availableConnections.find(
			(conn) => conn.type.toLowerCase() === dataSource.toLowerCase(),
		);
		if (matchingConnection) {
			setSelectedConnector(matchingConnection.type);
		}
	}

	const connectionTabs: Tab[] = availableConnections.map((conn) => ({
		label: conn.type,
		content: (
			<ConnectionCard
				key={conn.type}
				connection={conn}
				onClick={() => setSelectedConnector(conn.type)}
			/>
		),
	}));

	const getPlaceholderText = () => {
		switch (selectedConnector.toLowerCase()) {
			case "shopify":
				return "Enter your GraphQL query here...";
			case "bigquery":
				return "Enter your SQL query here...";
			default:
				return "Enter your query here...";
		}
	};

	const handleExecute = async () => {
		if (isExecuting) return; // Prevent multiple executions
		setIsExecuting(true);
		try {
			const token = await getValidToken();
			const response = await fetch(
				`${API_BASE_URL}/v0/connectors/${selectedConnector}/query`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: TempQuery,
					}),
				},
			);

			const body = await response.json();
			const data = body.data;

			if (data && data.length > 0) {
				const exampleRow = data[0];
				setColumns(Object.keys(exampleRow));
				setResults(data);

				// Update the artifact with the new query and preserve metadata
				if (currentArtifact) {
					ws.updateArtifact({
						...currentArtifact,
						content: TempQuery,
					});
				}
			}
		} catch (error) {
			console.error("Error executing query:", error);
		} finally {
			setIsExecuting(false);
		}
	};

	const handleDownloadCSV = () => {
		if (!results.length) return;

		// Escape fields that contain commas or quotes
		const escapeCSV = (field: string | number | boolean | null) => {
			if (field === null || field === undefined) return "";
			const stringField = String(field);
			if (stringField.includes(",") || stringField.includes('"')) {
				return `"${stringField.replace(/"/g, '""')}"`;
			}
			return stringField;
		};

		const csvContent = [
			columns.map(escapeCSV).join(","),
			...results.map((row) =>
				columns.map((col) => escapeCSV(row[col])).join(","),
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "query_results.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleDownloadExcel = () => {
		if (!results.length) return;

		// Create a worksheet
		const worksheet = XLSX.utils.json_to_sheet(results);

		// Create a workbook
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Query Results");

		// Generate Excel file
		XLSX.writeFile(workbook, "query_results.xlsx");
	};

	const handleCopyResults = () => {
		const text = results
			.map((row) => columns.map((col) => row[col]).join("\t"))
			.join("\n");
		navigator.clipboard.writeText(text);
	};

	return (
		<div className="flex flex-col h-full w-full p-4 space-y-4">
			{/* Tab Group */}
			<div className="bg-transparent">
				<TabGroupInject
					tabs={connectionTabs}
					activeTab={selectedConnector}
					className="bg-transparent"
				/>
			</div>

			{/* SQL Editor Section */}
			<div className="h-[200px] flex justify-center">
				<div className="h-full relative w-full max-w-4xl">
					<Textarea
						value={TempQuery}
						onChange={(e) => setTempQuery(e.target.value)}
						placeholder={getPlaceholderText()}
						className={cn(
							"w-full h-full",
							"font-mono text-sm",
							"rounded-lg",
							"resize-none",
						)}
					/>
					<Button
						onClick={handleExecute}
						className="absolute bottom-4 right-4"
						size="icon"
						disabled={isExecuting}
					>
						<Play className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Results Table Section */}
			<div className="flex-1 flex flex-col min-h-[300px]">
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-lg font-semibold">Results</h2>
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">
							{results.length} rows
						</span>
						{results.length > 0 && (
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
									<DropdownMenuItem onClick={handleDownloadCSV}>
										<FileText className="h-4 w-4 mr-2" />
										Download CSV
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleDownloadExcel}>
										<FileSpreadsheet className="h-4 w-4 mr-2" />
										Download Excel
									</DropdownMenuItem>
									<DropdownMenuItem onClick={handleCopyResults}>
										<Copy className="h-4 w-4 mr-2" />
										Copy Results
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
				<div
					className={cn(
						"flex-1 overflow-auto",
						results.length > 0 ? "rounded-md border" : "",
					)}
				>
					<Table>
						<TableHeader className="sticky top-0 bg-background z-10">
							<TableRow>
								{columns.map((column) => (
									<TableHead key={column} className="whitespace-nowrap">
										{column}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{results.map((row, rowIndex) => (
								<TableRow key={`row-${rowIndex}-${JSON.stringify(row)}`}>
									{columns.map((column) => (
										<TableCell
											key={`${column}-${row[column]}`}
											className="whitespace-nowrap"
										>
											{row[column]}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}

export default DataExecutor;
