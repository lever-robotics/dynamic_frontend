import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';
import { useAuth } from '../utils/AuthProvider';
const API_BASE_URL = import.meta.env.VITE_API_URL;

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

export const AIChatSidebar: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<{
        text: string;
        segments: MessageSegment[];
    }>({ text: '', segments: [] });
    const [autoScroll, setAutoScroll] = useState(true);
    const [userHasScrolled, setUserHasScrolled] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [accumulatedText, setAccumulatedText] = useState('');
    const lastScrollPosition = useRef(0);
    const { getValidToken, isAuthenticated } = useAuth();
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const isConnectingRef = useRef(false);
    const hasSentInitialMessageRef = useRef(false);
    const clientIdRef = useRef<string | null>(null);

    const scrollToBottom = () => {
        if (autoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handle manual scroll
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

            // Only update autoScroll if we're at the bottom
            if (isAtBottom) {
                setAutoScroll(true);
            } else {
                setAutoScroll(false);
            }

            // Track if user has manually scrolled
            if (!userHasScrolled) {
                setUserHasScrolled(true);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [userHasScrolled]);

    // Reset auto-scroll when user sends a new message
    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].type === 'user') {
            setAutoScroll(true);
            setUserHasScrolled(false);
        }
    }, [messages]);

    const connectWebSocket = async () => {
        // Prevent multiple simultaneous connection attempts
        if (isConnectingRef.current) {
            console.log('🔄 Connection attempt already in progress, skipping...');
            return;
        }

        console.log('🔄 Attempting to connect to WebSocket...');
        isConnectingRef.current = true;

        if (!isAuthenticated) {
            console.log('❌ WebSocket connection failed: User not authenticated');
            setConnectionError('Please authenticate to connect to AI chat');
            isConnectingRef.current = false;
            return;
        }

        try {
            const token = await getValidToken();
            if (!token) {
                console.log('❌ WebSocket connection failed: No valid token');
                setConnectionError('Authentication token not available');
                isConnectingRef.current = false;
                return;
            }

            // Close existing connection if any
            if (wsRef.current) {
                console.log('🔌 Closing existing connection...');
                wsRef.current.close();
            }

            console.log('🔑 Got valid token, creating WebSocket connection...');
            const wsUrl = `${API_BASE_URL}/ai/ws?token=${token}`;
            console.log('🔗 Connecting to:', wsUrl);

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ WebSocket connection established');
                setIsConnected(true);
                isConnectingRef.current = false;
                hasSentInitialMessageRef.current = false;
                console.log('🔍 Ready to send initial message:', {
                    hasSearchTerm: !!searchQuery.metadata?.searchTerm,
                    hasSentInitialMessage: hasSentInitialMessageRef.current
                });
            };

            ws.onclose = (event) => {
                console.log('🔌 WebSocket connection closed:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean,
                    clientId: clientIdRef.current
                });
                setIsConnected(false);
                isConnectingRef.current = false;
                clientIdRef.current = null;
            };

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', {
                    error,
                    readyState: ws.readyState,
                    url: ws.url,
                    clientId: clientIdRef.current
                });
                setConnectionError('Connection error occurred');
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('📥 WebSocket message received:', {
                        type: message.type,
                        clientId: message.clientId,
                        data: message.data,
                        timestamp: new Date().toISOString(),
                        readyState: ws.readyState
                    });

                    switch (message.type) {
                        case 'auth_response':
                            if (message.status === 'success') {
                                console.log('✅ Authentication successful:', {
                                    clientId: message.clientId,
                                    timestamp: new Date().toISOString()
                                });
                                setIsConnected(true);
                                setConnectionError(null);
                                clientIdRef.current = message.clientId;
                                console.log('📝 Client ID received:', message.clientId);

                                // Send initial search term only once after successful authentication
                                const searchTerm = searchQuery.metadata?.searchTerm;
                                if (searchTerm && !hasSentInitialMessageRef.current) {
                                    console.log('📤 Sending initial search term:', {
                                        searchTerm,
                                        clientId: clientIdRef.current,
                                        wsReadyState: ws.readyState,
                                        timestamp: new Date().toISOString()
                                    });
                                    ws.send(JSON.stringify({ task: searchTerm }));
                                    setMessages(prev => [...prev, {
                                        type: 'user',
                                        content: searchTerm,
                                        segments: [{ type: 'text', content: searchTerm }]
                                    }]);
                                    setCurrentMessage({ text: '', segments: [] });
                                    setAccumulatedText('');
                                    hasSentInitialMessageRef.current = true;
                                }
                            } else {
                                console.error('❌ Authentication failed:', {
                                    error: message.error,
                                    timestamp: new Date().toISOString()
                                });
                                setConnectionError(message.error);
                                setIsConnected(false);
                                clientIdRef.current = null;
                            }
                            break;

                        case 'message_received':
                            console.log('✅ Backend acknowledged message receipt:', {
                                clientId: message.clientId,
                                task: message.task,
                                timestamp: new Date().toISOString()
                            });
                            break;

                        case 'tool-execution':
                            console.log('🛠️ Tool execution received:', {
                                clientId: clientIdRef.current,
                                tool: message.data.tool,
                                arguments: message.data.arguments,
                                timestamp: new Date().toISOString()
                            });
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
                            console.log('✅ Tool result received:', {
                                clientId: clientIdRef.current,
                                tool: message.data.tool,
                                result: message.data.result,
                                timestamp: new Date().toISOString()
                            });
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

                        case 'llm-stream':
                            console.log('📥 LLM stream received:', {
                                clientId: clientIdRef.current,
                                text: message.data.text,
                                isComplete: message.data.isComplete,
                                timestamp: new Date().toISOString()
                            });
                            if (message.data.text) {
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
                            }
                            break;

                        case 'complete':
                            console.log('✅ Message complete received:', {
                                clientId: clientIdRef.current,
                                response: message.data.response,
                                metadata: message.data.metadata,
                                timestamp: new Date().toISOString()
                            });
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
                            console.error('❌ Error received:', {
                                clientId: clientIdRef.current,
                                error: message.data.message,
                                details: message.data.details,
                                timestamp: new Date().toISOString()
                            });
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
                    console.error('❌ Error processing message:', {
                        error: err instanceof Error ? err.message : 'Unknown error',
                        timestamp: new Date().toISOString()
                    });
                }
            };
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            setConnectionError('Failed to establish connection');
            isConnectingRef.current = false;
        }
    };

    // Clean up WebSocket connection when component unmounts or closes
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                console.log('🔌 Cleaning up WebSocket connection...');
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    // Connect WebSocket when component mounts and is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            connectWebSocket();
        }
    }, [isAuthenticated]);

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

                return (
                    <div key={segmentIndex} className="my-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        {/* Tool Status Header */}
                        <div
                            className={`px-4 py-2 ${statusColor} flex justify-between items-center cursor-pointer`}
                            onClick={() => toggleToolExecution(messageIndex, segmentIndex)}
                        >
                            <span className="font-medium">Tool: {tool.tool}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">{tool.status}</span>
                                <span className="text-sm">
                                    {tool.isExpanded ? '▼' : '▶'}
                                </span>
                            </div>
                        </div>

                        {/* Query Section */}
                        {tool.isExpanded && tool.arguments?.query && (
                            <div className="bg-blue-50 p-4">
                                <div className="font-medium text-blue-700 mb-2">GraphQL Query</div>
                                <pre className="bg-white p-3 rounded overflow-x-auto border border-blue-100">
                                    <code className="text-sm text-blue-800 whitespace-pre-wrap">
                                        {(() => {
                                            const queryText = typeof tool.arguments.query === 'string'
                                                ? tool.arguments.query
                                                : tool.arguments.query.query;
                                            return queryText.length > 200
                                                ? queryText.substring(0, 200) + '...'
                                                : queryText;
                                        })()}
                                    </code>
                                </pre>
                            </div>
                        )}

                        {/* Result/Error Section */}
                        {tool.isExpanded && (tool.result !== undefined || tool.error) && (
                            <div className={`${tool.error ? 'bg-red-50' : 'bg-green-50'} p-4 border-t border-gray-200`}>
                                <div className={`font-medium ${tool.error ? 'text-red-700' : 'text-green-700'} mb-2`}>
                                    {tool.error ? 'Error' : 'Response'}
                                </div>
                                <pre className={`bg-white p-3 rounded overflow-x-auto border ${tool.error ? 'border-red-100' : 'border-green-100'}`}>
                                    <code className={`text-sm ${tool.error ? 'text-red-800' : 'text-green-800'} whitespace-pre-wrap`}>
                                        {(() => {
                                            const responseText = tool.error || JSON.stringify(tool.result, null, 2);
                                            return responseText.length > 150
                                                ? responseText.substring(0, 150) + '...'
                                                : responseText;
                                        })()}
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

    const toggleToolExecution = (messageIndex: number, segmentIndex: number) => {
        // Store current scroll position before update
        const container = messagesContainerRef.current;
        if (container) {
            lastScrollPosition.current = container.scrollTop;
        }

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

        // Restore scroll position after state update
        requestAnimationFrame(() => {
            if (container) {
                container.scrollTop = lastScrollPosition.current;
            }
        });
    };

    return (
        <div className="h-full flex flex-col ai-chat-sidebar">
            <div className="p-2 border-b flex justify-between items-center">
                <div className={`flex items-center ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`} />
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                {connectionError && (
                    <div className="text-red-600 text-sm mt-1">
                        {connectionError}
                    </div>
                )}
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
                    disabled
                    placeholder="Use the search bar to ask questions..."
                    className="w-full p-2 border rounded-lg resize-none bg-gray-50"
                    rows={3}
                />
                <button
                    disabled
                    className="mt-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg w-full cursor-not-allowed"
                >
                    Send
                </button>
            </div>
        </div>
    );
}; 