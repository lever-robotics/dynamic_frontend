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
import { useAuth } from "@/utils/AuthProvider";
import { Copy, Download, FileSpreadsheet, FileText, Play } from "lucide-react";
import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface DataExecutorProps {
	initialQuery?: string | null;
}

export function DataExecutor({ initialQuery }: DataExecutorProps) {
	const [query, setQuery] = useState(initialQuery || "");
	const [results, setResults] = useState<any[]>([]);
	const [isExecuting, setIsExecuting] = useState(false);
	const [columns, setColumns] = useState<string[]>([]);
	const { addArtifact } = useWorkspace();
	const { getValidToken } = useAuth();
	const handleExecute = async () => {
		// TODO: Implement SQL execution
		console.log("Executing SQL:", query);

		const token = await getValidToken();
		const response = await fetch(
			`${API_BASE_URL}/v0/connectors/bigquery/query`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					sql: query,
				}),
			},
		);

		const body = await response.json();
		const data = body.data;
		console.log("Query results:", data);

		const exampleRow = data[0];

		setColumns(Object.keys(exampleRow));
		setResults(data);

		addArtifact("query", query);

		// setResults(data);
		// // Test with a larger dataset
		// setColumns([
		// 	"id",
		// 	"customer_name",
		// 	"order_date",
		// 	"product_name",
		// 	"quantity",
		// 	"unit_price",
		// 	"total_amount",
		// 	"status",
		// 	"shipping_address",
		// 	"payment_method",
		// 	"discount_applied",
		// 	"tax_amount",
		// ]);

		// // Generate 50 rows of test data
		// const testData = Array.from({ length: 50 }, (_, i) => ({
		// 	id: i + 1,
		// 	customer_name: `Customer ${i + 1}`,
		// 	order_date: new Date(2024, 0, i + 1).toISOString().split("T")[0],
		// 	product_name: `Product ${(i % 5) + 1}`,
		// 	quantity: Math.floor(Math.random() * 10) + 1,
		// 	unit_price: (Math.random() * 100).toFixed(2),
		// 	total_amount: (Math.random() * 1000).toFixed(2),
		// 	status: ["Pending", "Processing", "Shipped", "Delivered"][
		// 		Math.floor(Math.random() * 4)
		// 	],
		// 	shipping_address: `${Math.floor(Math.random() * 1000)} Main St, City ${i + 1}`,
		// 	payment_method: ["Credit Card", "PayPal", "Bank Transfer"][
		// 		Math.floor(Math.random() * 3)
		// 	],
		// 	discount_applied: (Math.random() * 20).toFixed(2),
		// 	tax_amount: (Math.random() * 50).toFixed(2),
		// }));

		// setResults(testData);
	};

	const handleDownloadCSV = () => {
		const csvContent = [
			columns.join(","),
			...results.map((row) => columns.map((col) => row[col]).join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "query_results.csv";
		link.click();
	};

	const handleDownloadExcel = () => {
		// TODO: Implement Excel download
		console.log("Downloading Excel...");
	};

	const handleCopyResults = () => {
		const text = results
			.map((row) => columns.map((col) => row[col]).join("\t"))
			.join("\n");
		navigator.clipboard.writeText(text);
	};

	return (
		<div className="flex flex-col h-full w-full p-4 space-y-4">
			{/* SQL Editor Section */}
			<div className="h-[200px] flex justify-center">
				<div className="h-full relative w-full max-w-4xl">
					<Textarea
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Enter your SQL query here..."
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
							{results.map((row, index) => (
								<TableRow key={index}>
									{columns.map((column, index) => (
										<TableCell
											key={`${index}-${column}`}
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
