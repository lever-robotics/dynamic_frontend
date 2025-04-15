import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export function DataExecutor() {
  const [sqlQuery, setSqlQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const handleExecute = () => {
    // TODO: Implement SQL execution
    console.log("Executing SQL:", sqlQuery);
    // Test with a larger dataset
    setColumns([
      "id",
      "customer_name",
      "order_date",
      "product_name",
      "quantity",
      "unit_price",
      "total_amount",
      "status",
      "shipping_address",
      "payment_method",
      "discount_applied",
      "tax_amount"
    ]);
    
    // Generate 50 rows of test data
    const testData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      customer_name: `Customer ${i + 1}`,
      order_date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      product_name: `Product ${(i % 5) + 1}`,
      quantity: Math.floor(Math.random() * 10) + 1,
      unit_price: (Math.random() * 100).toFixed(2),
      total_amount: (Math.random() * 1000).toFixed(2),
      status: ['Pending', 'Processing', 'Shipped', 'Delivered'][Math.floor(Math.random() * 4)],
      shipping_address: `${Math.floor(Math.random() * 1000)} Main St, City ${i + 1}`,
      payment_method: ['Credit Card', 'PayPal', 'Bank Transfer'][Math.floor(Math.random() * 3)],
      discount_applied: (Math.random() * 20).toFixed(2),
      tax_amount: (Math.random() * 50).toFixed(2)
    }));
    
    setResults(testData);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* SQL Editor Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <Textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="Enter your SQL query here..."
            className={cn(
              "w-full h-full min-h-[200px]",
              "font-mono text-sm",
              "rounded-lg",
              "resize-none"
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
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Results</h2>
          <span className="text-sm text-muted-foreground">
            {results.length} rows
          </span>
        </div>
        <div className="flex-1 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="whitespace-nowrap">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column}`} className="whitespace-nowrap">
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