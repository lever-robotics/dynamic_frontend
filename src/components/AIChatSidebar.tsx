import React, { useState, useEffect, useRef } from 'react';
import { SearchQuery } from './LeverApp';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';

interface AIChatSidebarProps {
    searchQuery: SearchQuery;
}

interface Message {
    type: 'user' | 'assistant';
    content: string;
    segments: MessageSegment[];
}

interface MessageSegment {
    type: 'text' | 'tool';
    content: string;
    toolExecution?: ToolExecution;
}

type ToolExecutionStatus = 'starting' | 'in-progress' | 'completed' | 'error';

interface ToolExecution {
    tool: string;
    arguments: {
        query?: string | { query: string };
        [key: string]: any;
    };
    result?: any;
    error?: string;
    timestamp: number;
    isExpanded: boolean;
    status: ToolExecutionStatus;
}

// Primary color: bg-blue-500 hover:bg-blue-600
// Secondary color: bg-green-500 hover:bg-green-600

const getStatusColor = (status: ToolExecution['status']) => {
    switch (status) {
        case 'starting':
            return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'in-progress':
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'completed':
            return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'error':
            return 'text-red-600 bg-red-50 border-red-200';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200';
    }
};

// Custom components for ReactMarkdown
const MarkdownComponents = {
    // Add proper indentation for lists
    li: ({ children, ordered, index }: any) => (
        <li className="ml-4">
            {ordered ? `${index + 1}. ` : '• '}
            {children}
        </li>
    ),
    // Style code blocks
    code: ({ node, inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : 'text';

        if (!inline) {
            return (
                <Highlight
                    theme={themes.vsLight}
                    code={String(children).replace(/\n$/, '')}
                    language={language}
                >
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                        <pre className="p-4 rounded-lg bg-gray-50 overflow-x-auto">
                            <code className={className} style={style}>
                                {tokens.map((line, i) => (
                                    <div key={i} {...getLineProps({ line })}>
                                        {line.map((token, key) => (
                                            <span key={key} {...getTokenProps({ token })} />
                                        ))}
                                    </div>
                                ))}
                            </code>
                        </pre>
                    )}
                </Highlight>
            );
        }
        return (
            <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-sm">
                {children}
            </code>
        );
    },
    // Style paragraphs
    p: ({ children }: any) => (
        <p className="mb-2 leading-relaxed">{children}</p>
    ),
    // Style headings
    h1: ({ children }: any) => (
        <h1 className="text-2xl font-bold mb-4">{children}</h1>
    ),
    h2: ({ children }: any) => (
        <h2 className="text-xl font-bold mb-3">{children}</h2>
    ),
    h3: ({ children }: any) => (
        <h3 className="text-lg font-bold mb-2">{children}</h3>
    ),
};

// Function to process text for markdown formatting
const processText = (text: string) => {
    // First, join any broken numbered lists
    let processedText = text.replace(/(\d+)\.\s*\n+(\w)/g, '$1. $2');

    // Join broken code blocks
    let lines = processedText.split('\n');
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let resultLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isCodeFence = line.trim().startsWith('```');

        if (isCodeFence) {
            if (!inCodeBlock) {
                // Starting a code block
                inCodeBlock = true;
                codeBlockContent = [line];
            } else {
                // Ending a code block
                codeBlockContent.push(line);
                resultLines.push(codeBlockContent.join('\n'));
                codeBlockContent = [];
                inCodeBlock = false;
            }
        } else if (inCodeBlock) {
            codeBlockContent.push(line);
        } else {
            // Handle regular text
            // Join broken sentences that end with a colon
            if (i > 0 && lines[i - 1].trim().endsWith(':') && !line.trim().startsWith('-') && !line.trim().startsWith('*')) {
                resultLines[resultLines.length - 1] += ' ' + line;
            } else {
                resultLines.push(line);
            }
        }
    }

    // If we're still in a code block at the end, add what we have
    if (inCodeBlock && codeBlockContent.length > 0) {
        resultLines.push(codeBlockContent.join('\n'));
    }

    processedText = resultLines.join('\n');

    // Convert numbered lines into proper markdown list items
    processedText = processedText.replace(/^(\d+)[.)] /gm, '$1. ');

    // Ensure proper spacing around code blocks
    processedText = processedText.replace(/```(\w+)\n/g, '```$1\n\n');
    processedText = processedText.replace(/\n```/g, '\n\n```');

    return processedText;
};

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ searchQuery }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [currentInput, setCurrentInput] = useState('');
    const [currentMessage, setCurrentMessage] = useState<{
        text: string;
        segments: MessageSegment[];
    }>({ text: '', segments: [] });
    const [autoScroll, setAutoScroll] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [accumulatedText, setAccumulatedText] = useState('');

    const scrollToBottom = () => {
        if (autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handle manual scroll
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
            setAutoScroll(isAtBottom);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Reset auto-scroll when user sends a new message
    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].type === 'user') {
            setAutoScroll(true);
        }
    }, [messages]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4000/ai/ws');
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            const searchTerm = searchQuery.metadata?.searchTerm;
            if (searchTerm) {
                ws.send(JSON.stringify({ task: searchTerm }));
                setMessages(prev => [...prev, {
                    type: 'user',
                    content: searchTerm,
                    segments: [{ type: 'text', content: searchTerm }]
                }]);
                setCurrentMessage({ text: '', segments: [] });
                setAccumulatedText('');
            }
        };

        ws.onclose = () => setIsConnected(false);
        ws.onerror = (error) => console.error('WebSocket error:', error);

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('Received message:', message);

                switch (message.type) {
                    case 'llm-stream':
                        setAccumulatedText(prev => prev + message.data.text);
                        setCurrentMessage(prev => {
                            // Get the last segment
                            const lastSegment = prev.segments[prev.segments.length - 1];

                            // If the last segment is a text segment, append to it
                            if (lastSegment?.type === 'text') {
                                const updatedSegments = [...prev.segments];
                                updatedSegments[updatedSegments.length - 1] = {
                                    ...lastSegment,
                                    content: lastSegment.content + message.data.text
                                };

                                return {
                                    text: prev.text + message.data.text,
                                    segments: updatedSegments
                                };
                            }

                            // If not, create a new text segment
                            return {
                                text: prev.text + message.data.text,
                                segments: [
                                    ...prev.segments,
                                    {
                                        type: 'text',
                                        content: message.data.text
                                    }
                                ]
                            };
                        });
                        scrollToBottom();
                        break;

                    case 'tool-execution':
                        console.log('Tool execution:', message.data);
                        setCurrentMessage(prev => {
                            const toolExecution: ToolExecution = {
                                tool: message.data.tool,
                                arguments: message.data.arguments,
                                timestamp: Date.now(),
                                isExpanded: true,
                                status: 'starting' as ToolExecutionStatus
                            };

                            const toolSegment: MessageSegment = {
                                type: 'tool',
                                content: '',
                                toolExecution
                            };

                            return {
                                ...prev,
                                segments: [...prev.segments, toolSegment]
                            };
                        });
                        break;

                    case 'tool-result':
                        console.log('Tool result:', message.data);
                        setCurrentMessage(prev => {
                            const updatedSegments = prev.segments.map(segment => {
                                if (
                                    segment.type === 'tool' &&
                                    segment.toolExecution &&
                                    segment.toolExecution.tool === message.data.tool &&
                                    !segment.toolExecution.result
                                ) {
                                    return {
                                        ...segment,
                                        toolExecution: {
                                            ...segment.toolExecution,
                                            result: message.data.result,
                                            error: message.data.error,
                                            status: message.data.error ? 'error' as ToolExecutionStatus : 'completed' as ToolExecutionStatus
                                        }
                                    };
                                }
                                return segment;
                            });

                            return {
                                ...prev,
                                segments: updatedSegments
                            };
                        });
                        break;

                    case 'complete':
                        if (currentMessage.text || currentMessage.segments.length > 0) {
                            setMessages(prev => [...prev, {
                                type: 'assistant',
                                content: currentMessage.text,
                                segments: currentMessage.segments
                            }]);
                            setCurrentMessage({ text: '', segments: [] });
                            setAccumulatedText('');
                        }
                        break;

                    case 'error':
                        console.error('Error from server:', message.data);
                        // Add error message to the chat
                        setMessages(prev => [...prev, {
                            type: 'assistant',
                            content: `Error: ${message.data.message}`,
                            segments: [{
                                type: 'text',
                                content: `Error: ${message.data.message}${message.data.details ? `\n\nDetails: ${message.data.details}` : ''}`
                            }]
                        }]);
                        setCurrentMessage({ text: '', segments: [] });
                        setAccumulatedText('');
                        break;
                }
            } catch (err) {
                console.error('Error processing message:', err);
            }
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [searchQuery.metadata?.searchTerm]);

    const handleSendMessage = () => {
        if (!currentInput.trim() || !isConnected || !wsRef.current) return;

        wsRef.current.send(JSON.stringify({ task: currentInput }));
        setMessages(prev => [...prev, {
            type: 'user',
            content: currentInput,
            segments: [{ type: 'text', content: currentInput }]
        }]);
        setCurrentMessage({ text: '', segments: [] });
        setCurrentInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleToolExecution = (messageIndex: number, segmentIndex: number) => {
        setMessages(prev => prev.map((msg, mIdx) =>
            mIdx === messageIndex
                ? {
                    ...msg,
                    segments: msg.segments.map((segment, sIdx) =>
                        sIdx === segmentIndex && segment.type === 'tool'
                            ? {
                                ...segment,
                                toolExecution: {
                                    ...segment.toolExecution!,
                                    isExpanded: !segment.toolExecution!.isExpanded
                                }
                            }
                            : segment
                    )
                }
                : msg
        ));
    };

    const renderMessageContent = (message: Message, messageIndex: number) => {
        return message.segments.map((segment, segmentIndex) => {
            if (segment.type === 'text') {
                return (
                    <div key={segmentIndex} className="prose prose-sm max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={MarkdownComponents}
                        >
                            {processText(segment.content)}
                        </ReactMarkdown>
                    </div>
                );
            } else if (segment.type === 'tool' && segment.toolExecution) {
                const tool = segment.toolExecution;
                const isGraphQL = tool.tool === 'graphql';
                const hasQuery = isGraphQL && tool.arguments?.query;
                const hasResult = tool.result !== undefined || tool.error !== undefined;
                const statusColor = getStatusColor(tool.status);

                return (
                    <div key={segmentIndex} className="my-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        {/* Tool Status Header */}
                        <div className={`px-4 py-2 ${statusColor} flex justify-between items-center`}>
                            <span className="font-medium">Tool: {tool.tool}</span>
                            <span className="text-sm">{tool.status}</span>
                        </div>

                        {/* Query Section */}
                        {tool.arguments?.query && (
                            <div className="bg-blue-50 p-4">
                                <div className="font-medium text-blue-700 mb-2">GraphQL Query</div>
                                <pre className="bg-white p-3 rounded overflow-x-auto border border-blue-100">
                                    <code className="text-sm text-blue-800 whitespace-pre-wrap">
                                        {typeof tool.arguments.query === 'string'
                                            ? tool.arguments.query
                                            : tool.arguments.query.query}
                                    </code>
                                </pre>
                            </div>
                        )}

                        {/* Result/Error Section */}
                        {hasResult && (
                            <div className={`${tool.error ? 'bg-red-50' : 'bg-green-50'} p-4 border-t border-gray-200`}>
                                <div className={`font-medium ${tool.error ? 'text-red-700' : 'text-green-700'} mb-2`}>
                                    {tool.error ? 'Error' : 'Response'}
                                </div>
                                <pre className={`bg-white p-3 rounded overflow-x-auto border ${tool.error ? 'border-red-100' : 'border-green-100'}`}>
                                    <code className={`text-sm ${tool.error ? 'text-red-800' : 'text-green-800'} whitespace-pre-wrap`}>
                                        {tool.error || JSON.stringify(tool.result, null, 2)}
                                    </code>
                                </pre>
                            </div>
                        )}
                    </div>
                );
            }
            return null;
        });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b">
                <div className={`flex items-center ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`} />
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>
            </div>

            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4"
            >
                {messages.map((msg, msgIndex) => (
                    <div key={msgIndex} className="mb-4 border-t border-gray-200 pt-4 first:border-t-0">
                        {msg.type === 'user' ? (
                            <div className="text-right mb-2">
                                <div className="inline-block p-2 rounded-lg bg-blue-100">
                                    {msg.content}
                                </div>
                            </div>
                        ) : (
                            <div className="text-left space-y-2">
                                {renderMessageContent(msg, msgIndex)}
                            </div>
                        )}
                    </div>
                ))}

                {currentMessage.text && (
                    <div className="text-left space-y-2">
                        {renderMessageContent({
                            type: 'assistant',
                            content: currentMessage.text,
                            segments: currentMessage.segments
                        }, messages.length)}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
                <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full p-2 border rounded-lg resize-none"
                    rows={3}
                />
                <button
                    onClick={handleSendMessage}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600"
                    disabled={!isConnected}
                >
                    Send
                </button>
            </div>
        </div>
    );
}; 