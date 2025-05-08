import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./Chat/MarkdownContent";

export function DocumentEditor() {
	const {
		state: { artifacts },
	} = useWorkspace();

	// Sample document with charts
	const sampleDocument = `
# Data Analysis Report

## Monthly Sales Overview

Here's a line chart showing our monthly sales performance:

\`\`\`chart
{
  "type": "line",
  "data": {
    "labels": ["January", "February", "March", "April", "May", "June"],
    "datasets": [
      {
        "label": "Sales",
        "data": [65, 59, 80, 81, 56, 55],
        "borderColor": "rgb(75, 192, 192)",
        "tension": 0.1
      }
    ]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "title": {
        "display": true,
        "text": "Monthly Sales Data"
      }
    }
  }
}
\`\`\`

## Product Distribution

Here's a pie chart showing our product distribution:

\`\`\`chart
{
  "type": "pie",
  "data": {
    "labels": ["Product A", "Product B", "Product C"],
    "datasets": [
      {
        "label": "Sales Distribution",
        "data": [300, 50, 100],
        "backgroundColor": [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)"
        ]
      }
    ]
  }
}
\`\`\`

## Regional Performance

Here's a bar chart showing our regional performance:

\`\`\`chart
{
  "type": "bar",
  "data": {
    "labels": ["North", "South", "East", "West", "Central"],
    "datasets": [
      {
        "label": "Revenue",
        "data": [12, 19, 3, 5, 2],
        "backgroundColor": [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)"
        ],
        "borderColor": [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)"
        ],
        "borderWidth": 1
      }
    ]
  },
  "options": {
    "scales": {
      "y": {
        "beginAtZero": true
      }
    }
  }
}
\`\`\`
`;

	const document = artifacts.documents[0] || sampleDocument;

	return (
		<div
			className={cn(
				"w-full h-full overflow-auto",
				"bg-background",
				"flex flex-col items-center",
			)}
		>
			{/* Main content area with page-like appearance */}
			<div className="w-[8.5in] min-w-[8.5in] py-8 space-y-8">
				{/* Each "page" is a section with a white background and shadow */}
				<div
					className={cn(
						"bg-white",
						"border rounded-lg",
						"shadow-sm",
						"p-8",
						"min-h-[calc(100vh-4rem)]",
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
						"min-h-[calc(100vh-4rem)]",
						"opacity-50",
						"mb-8", // Extra margin at the bottom
					)}
				>
					{/* This creates the visual effect of another page */}
				</div>
			</div>
		</div>
	);
}
