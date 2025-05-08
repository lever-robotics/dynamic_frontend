import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Register ChartJS components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
);

interface MarkdownContentProps {
	content: string;
	className?: string;
}

interface CodeProps {
	node?: unknown;
	inline?: boolean;
	className?: string;
	children: React.ReactNode;
	[key: string]: unknown;
}

interface ChartConfig {
	type: "line" | "bar" | "pie" | "doughnut";
	data: any;
	options?: any;
	height?: number;
}

const ChartRenderer = ({ config }: { config: ChartConfig }) => {
	if (!config || !config.type) {
		return <div className="text-red-500">Invalid chart configuration</div>;
	}

	const { type, data, options = {}, height = 300 } = config;
	const containerStyle = { height: `${height}px`, width: "100%" };

	// Chart renderer based on chart type
	switch (type) {
		case "line":
			return (
				<div
					className="my-4 p-4 bg-white rounded shadow"
					style={containerStyle}
				>
					<Line data={data} options={options} />
				</div>
			);
		case "bar":
			return (
				<div
					className="my-4 p-4 bg-white rounded shadow"
					style={containerStyle}
				>
					<Bar data={data} options={options} />
				</div>
			);
		case "pie":
			return (
				<div
					className="my-4 p-4 bg-white rounded shadow"
					style={containerStyle}
				>
					<Pie data={data} options={options} />
				</div>
			);
		case "doughnut":
			return (
				<div
					className="my-4 p-4 bg-white rounded shadow"
					style={containerStyle}
				>
					<Doughnut data={data} options={options} />
				</div>
			);
		default:
			return (
				<div className="bg-yellow-100 p-4 rounded">
					<p className="text-yellow-700">Unsupported chart type: {type}</p>
				</div>
			);
	}
};

const markdownComponents = {
	// Code blocks with syntax highlighting
	code({ node, inline, className, children, ...props }: CodeProps) {
		const match = /language-(\w+)/.exec(className || "");
		const language = match ? match[1] : "";
		// Handle chart code blocks
		if (language === "chart") {
			try {
				const chartConfig = JSON.parse(String(children).trim());
				return <ChartRenderer config={chartConfig} />;
			} catch (e) {
				return (
					<div className="bg-red-100 p-4 rounded">
						<p className="text-red-600">Error rendering chart: {e.message}</p>
						<SyntaxHighlighter
							style={oneDark}
							language="json"
							PreTag="div"
							{...props}
						>
							{String(children).replace(/\n$/, "")}
						</SyntaxHighlighter>
					</div>
				);
			}
		}

		if (!inline && language) {
			return (
				<SyntaxHighlighter
					style={oneDark}
					language={language}
					PreTag="div"
					{...props}
				>
					{String(children).replace(/\n$/, "")}
				</SyntaxHighlighter>
			);
		}

		return (
			<code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm" {...props}>
				{children}
			</code>
		);
	},
	// Headings
	h1: ({ children }) => (
		<h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
	),
	h2: ({ children }) => (
		<h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>
	),
	h3: ({ children }) => (
		<h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>
	),
	// Lists
	ul: ({ children }) => (
		<ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>
	),
	ol: ({ children }) => (
		<ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>
	),
	// Blockquotes
	blockquote: ({ children }) => (
		<blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic">
			{children}
		</blockquote>
	),
	// Tables
	table: ({ children }) => (
		<div className="overflow-x-auto my-6">
			<table className="min-w-full divide-y divide-gray-200">{children}</table>
		</div>
	),
	th: ({ children }) => (
		<th className="px-4 py-2 bg-gray-50 font-semibold text-left">{children}</th>
	),
	td: ({ children }) => <td className="px-4 py-2 border-t">{children}</td>,
	// Paragraphs
	p: ({ children }) => <p className="my-3 leading-relaxed">{children}</p>,
	// Emphasis
	em: ({ children }) => <em className="italic">{children}</em>,
	strong: ({ children }) => (
		<strong className="font-semibold">{children}</strong>
	),
	// Links
	a: ({ children, href, ...props }) => (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="text-blue-600 hover:text-blue-800 hover:underline"
			{...props}
		>
			{children}
		</a>
	),
	// Horizontal Rule
	hr: () => <hr className="my-6 border-gray-200" />,
};

export function MarkdownContent({
	content,
	className = "",
}: MarkdownContentProps) {
	return (
		<div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
			<ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
		</div>
	);
}

export function ChartMarkdownExample() {
	const sampleMarkdown = `
# Chart.js Markdown Example

Here's some regular markdown text that will be rendered normally.

## Line Chart Example

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

## Bar Chart Example

\`\`\`chart
{
	"type": "bar",
	"data": {
		"labels": ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
		"datasets": [
			{
				"label": "# of Votes",
				"data": [12, 19, 3, 5, 2, 3],
				"backgroundColor": [
					"rgba(255, 99, 132, 0.2)",
					"rgba(54, 162, 235, 0.2)",
					"rgba(255, 206, 86, 0.2)",
					"rgba(75, 192, 192, 0.2)",
					"rgba(153, 102, 255, 0.2)",
					"rgba(255, 159, 64, 0.2)"
				],
				"borderColor": [
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)",
					"rgba(75, 192, 192, 1)",
					"rgba(153, 102, 255, 1)",
					"rgba(255, 159, 64, 1)"
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

## Pie Chart Example

\`\`\`chart
{
	"type": "pie",
	"data": {
		"labels": ["Red", "Blue", "Yellow"],
		"datasets": [
			{
				"label": "Dataset 1",
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

This is a standard code block that won't be rendered as a chart:

\`\`\`javascript
function helloWorld() {
	console.log("Hello, world!");
}
\`\`\`
`;

	return (
		<div className="container mx-auto p-6 bg-gray-50 rounded-lg">
			<h1 className="text-3xl font-bold mb-6">Chart Markdown Renderer</h1>
			<MarkdownContent content={sampleMarkdown} />
		</div>
	);
}
