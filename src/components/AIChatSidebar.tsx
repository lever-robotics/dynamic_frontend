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

interface ToolExecution {
    tool: string;
    arguments: any;
    result?: any;
    timestamp: number;
    isExpanded: boolean;
    isResultExpanded: boolean;
    status: 'starting' | 'in-progress' | 'completed' | 'error';
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

                switch (message.type) {
                    case 'llm-stream':
                        setAccumulatedText(prev => prev + message.data.text);
                        setCurrentMessage(prev => ({
                            text: prev.text + message.data.text,
                            segments: [{
                                type: 'text',
                                content: prev.text + message.data.text
                            }]
                        }));
                        scrollToBottom();
                        break;

                    case 'tool-execution':
                        setCurrentMessage(prev => ({
                            ...prev,
                            segments: [...prev.segments.filter(s => s.type !== 'text'), {
                                type: 'tool',
                                content: '',
                                toolExecution: {
                                    tool: message.data.tool,
                                    arguments: message.data.arguments,
                                    timestamp: Date.now(),
                                    isExpanded: false,
                                    isResultExpanded: false,
                                    status: 'starting'
                                }
                            }, {
                                type: 'text',
                                content: accumulatedText
                            }]
                        }));
                        break;

                    case 'tool-result':
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
                                            status: 'completed' as const
                                        }
                                    };
                                }
                                return segment;
                            });

                            // Keep text segment at the end
                            const textSegment = updatedSegments.find(s => s.type === 'text');
                            const nonTextSegments = updatedSegments.filter(s => s.type !== 'text');

                            return {
                                ...prev,
                                segments: [...nonTextSegments, textSegment!]
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

    const toggleToolResult = (messageIndex: number, segmentIndex: number) => {
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
                                    isResultExpanded: !segment.toolExecution!.isResultExpanded
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
                const statusColor = getStatusColor(tool.status);
                const isCompleted = tool.status === 'completed';

                return (
                    <div key={segmentIndex} className="my-2">
                        <button
                            onClick={() => toggleToolExecution(messageIndex, segmentIndex)}
                            className={`w-full text-left p-2 rounded-lg border transition-colors duration-200 ${tool.isExpanded
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : `${statusColor} hover:bg-blue-100`
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Tool: {tool.tool}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${tool.isExpanded ? 'bg-blue-600' : ''
                                    }`}>
                                    {tool.status}
                                </span>
                            </div>
                        </button>

                        {tool.isExpanded && (
                            <div className="mt-2 text-sm border-l-4 border-blue-500 pl-4">
                                <div className="text-gray-700 font-medium">Command:</div>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={MarkdownComponents}
                                    >
                                        {`\`\`\`javascript\n${tool.tool}(${JSON.stringify(tool.arguments, null, 2)})\n\`\`\``}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {tool.result && (
                            <>
                                <button
                                    onClick={() => toggleToolResult(messageIndex, segmentIndex)}
                                    className={`w-full text-left p-2 mt-2 rounded-lg border transition-colors duration-200 ${tool.isResultExpanded
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-green-50 hover:bg-green-100 border-green-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Result: {tool.tool}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${tool.isResultExpanded ? 'bg-green-600' : 'text-green-600'
                                            }`}>
                                            completed
                                        </span>
                                    </div>
                                </button>

                                {tool.isResultExpanded && (
                                    <div className="mt-2 text-sm border-l-4 border-green-500 pl-4">
                                        <div className="text-gray-700 font-medium">Output:</div>
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={MarkdownComponents}
                                            >
                                                {typeof tool.result === 'string'
                                                    ? `\`\`\`\n${tool.result}\n\`\`\``
                                                    : `\`\`\`json\n${JSON.stringify(tool.result, null, 2)}\n\`\`\``}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </>
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