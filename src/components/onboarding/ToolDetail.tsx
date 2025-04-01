import { useState } from "react";
import type { ToolExecutionBubble } from "@/types/chat";

interface ToolDetailProps {
    tool: ToolExecutionBubble;
    onClose?: () => void;
}

export function ToolDetail({ tool, onClose }: ToolDetailProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'arguments' | 'result'>('overview');
    const [copied, setCopied] = useState(false);

    const statusColors = {
        starting: "bg-blue-50 text-blue-700",
        running: "bg-yellow-50 text-yellow-700",
        complete: "bg-green-50 text-green-700",
        error: "bg-red-50 text-red-700",
    };

    const formatResult = (result: any) => {
        try {
            // If it's a string that looks like JSON, parse it first
            const parsed = typeof result === 'string' ? JSON.parse(result) : result;
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            // If it's not valid JSON, return as is
            return result;
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{tool.tool}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-sm ${statusColors[tool.status || 'starting']
                        }`}>
                        {tool.status || 'starting'}
                    </span>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ←
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b px-4">
                {(['overview', 'arguments', 'result'] as const).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 border-b-2 transition-colors ${activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Description</h3>
                            <p className="mt-1">{tool.tool} execution details</p>
                        </div>
                        {tool.error && (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="mt-1 text-sm text-red-700">{tool.error}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'arguments' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-700">Arguments</h3>
                            <button
                                onClick={() => copyToClipboard(JSON.stringify(tool.arguments, null, 2))}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <pre className="text-sm overflow-auto whitespace-pre-wrap">
                            {JSON.stringify(tool.arguments, null, 2)}
                        </pre>
                    </div>
                )}

                {activeTab === 'result' && tool.result && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-700">Result</h3>
                            <button
                                onClick={() => copyToClipboard(formatResult(tool.result))}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <pre className="text-sm overflow-auto whitespace-pre-wrap">
                            {formatResult(tool.result)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
} 