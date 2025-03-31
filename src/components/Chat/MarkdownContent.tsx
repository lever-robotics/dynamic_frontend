import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownContentProps {
	content: string;
	className?: string;
}

const markdownComponents = {
	// Code blocks with syntax highlighting
	code({
		node,
		inline,
		className,
		children,
		...props
	}: {
		node?: any;
		inline?: boolean;
		className?: string;
		children: React.ReactNode;
		[key: string]: any;
	}) {
		const match = /language-(\w+)/.exec(className || "");
		const language = match ? match[1] : "";

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
