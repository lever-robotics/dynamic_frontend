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
import { useState } from "react";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import ReactMarkdown, { type Components } from "react-markdown";
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
	children?: React.ReactNode;
	[key: string]: any;
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

// Add ImageModal component
function ImageModal({
	src,
	alt,
	onClose,
}: { src: string; alt: string; onClose: () => void }) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
			onClick={onClose}
		>
			<div className="relative max-w-[90vw] max-h-[90vh]">
				<img
					src={src}
					alt={alt || "Image content"}
					className="max-w-full max-h-[90vh] object-contain rounded-lg"
				/>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors"
				>
					✕
				</button>
			</div>
		</div>
	);
}

const markdownComponents: Components = {
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
	// Images
	img: ({ src, alt, ...props }) => {
		const [isExpanded, setIsExpanded] = useState(false);

		return (
			<>
				<img
					{...props}
					src={src}
					alt={alt || "Image content"}
					aria-label={alt || "Image content"}
					className="max-w-full h-auto my-4 rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
					onClick={() => setIsExpanded(true)}
				/>
				{isExpanded && (
					<ImageModal
						src={src}
						alt={alt || "Image content"}
						onClose={() => setIsExpanded(false)}
					/>
				)}
			</>
		);
	},
};

export function MarkdownContent({
	content,
	className = "",
}: MarkdownContentProps) {
	return (
		<div
			className={`prose prose-sm max-w-none dark:prose-invert overflow-visible ${className}`}
		>
			<ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
		</div>
	);
}

const sampleMarkdown = `
This is a sample markdown with a chart:

\`\`\`chart
{
	"type": "line",
	"data": {
		"labels": ["Jan", "Feb", "Mar", "Apr", "May"],
		"datasets": [{
			"label": "Sales",
			"data": [12, 19, 3, 5, 2]
		}]
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

export function ChartMarkdownExample() {
	return (
		<div className="container mx-auto p-6 bg-gray-50 rounded-lg">
			<h1 className="text-3xl font-bold mb-6">Chart Markdown Renderer</h1>
			<MarkdownContent content={sampleMarkdown} />
		</div>
	);
}
