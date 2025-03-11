import React, { useState, useEffect, useRef } from 'react';
import { SearchQuery } from './LeverApp';
import { ToolStateDisplay } from './ToolStateDisplay';

interface QueryMetadata {
    rowCount: number;
    executionTime: number;
}

interface AIResponseMetadata {
    tokensUsed: number;
    processingTime: number;
    queryMetadata?: QueryMetadata;
}

interface AIResponse {
    response: string;
    status: 'completed' | 'error';
    metadata?: AIResponseMetadata;
}

interface ToolState {
    tool: string;
    status: 'starting' | 'in-progress' | 'completed' | 'error';
    query?: string;
    result?: any;
    error?: string;
    type?: string;
    thought?: string;
    content?: string;
    summary?: string;
    parameters?: any;
}

interface DisplayDataProps {
    schema: any;
    searchQuery: SearchQuery | null;
    updateSearchQuery: (query: SearchQuery) => void;
}

export const AIDisplay: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [toolStates, setToolStates] = useState<ToolState[]>([]);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        console.log('Setting up SSE connection...');
        const connectSSE = () => {
            console.log('Attempting to connect to SSE...');
            const eventSource = new EventSource('http://localhost:4000/ai/stream');
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('SSE Connection established successfully');
                setIsConnected(true);
                setError(null);
            };

            eventSource.onmessage = (event) => {
                console.log('Received SSE message:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    console.log('Parsed SSE data:', data);
                    handleToolState(data);
                } catch (err) {
                    console.error('Error parsing SSE message:', err);
                }
            };

            eventSource.onerror = (err) => {
                console.error('SSE Connection error:', err);
                setIsConnected(false);
                setError('SSE Connection failed');
                eventSource.close();
                setTimeout(connectSSE, 5000);
            };
        };

        connectSSE();
        return () => {
            console.log('Cleaning up SSE connection...');
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const handleToolState = (state: ToolState) => {
        console.log('Handling tool state:', state);
        setToolStates(prev => {
            // For thinking/analysis states
            if (state.type === 'thinking' || state.type === 'analysis') {
                console.log('Processing thinking/analysis state:', state);
                return [...prev, {
                    tool: state.type,
                    status: 'in-progress',
                    thought: state.thought || state.content
                }];
            }

            // For SWAPI tool states
            if (state.tool === 'swapi-graphql') {
                console.log('Processing SWAPI tool state:', state);
                const existingIndex = prev.findIndex(s => s.tool === 'swapi-graphql');
                if (existingIndex >= 0) {
                    const newStates = [...prev];
                    newStates[existingIndex] = state;
                    return newStates;
                }
                return [...prev, state];
            }

            // For conclusion state
            if (state.type === 'conclusion') {
                console.log('Processing conclusion state:', state);
                setResponse(state.summary || '');
                return prev;
            }

            console.log('Unhandled tool state type:', state);
            return prev;
        });
    };

    const makeAIRequest = async () => {
        if (!searchTerm.trim()) return;
        console.log('Making AI request with search term:', searchTerm);

        setLoading(true);
        setError(null);
        setResponse('');
        setToolStates([]);

        try {
            console.log('Sending fetch request to backend...');
            const response = await fetch('http://localhost:4000/ai/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: searchTerm }),
            });

            console.log('Received response from backend:', response);
            if (!response.ok) {
                throw new Error('Failed to process request');
            }

            const data = await response.json();
            console.log('Parsed response data:', data);
            if (data.error) {
                console.error('Error in response data:', data.error);
                setError(data.error);
            }
        } catch (err) {
            console.error('Error making AI request:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="mb-4 flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected' : 'Connecting...'}
                </span>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ask about Star Wars..."
                    className="w-full p-2 border rounded"
                />
                <button
                    onClick={makeAIRequest}
                    disabled={loading || !isConnected}
                    className={`mt-2 px-4 py-2 bg-blue-500 text-white rounded ${(loading || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? 'Processing...' : 'Send'}
                </button>
            </div>

            {toolStates.length > 0 && (
                <div className="mb-4">
                    <ToolStateDisplay toolStates={toolStates} />
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {response && (
                <div className="p-4 bg-white rounded shadow">
                    <pre className="whitespace-pre-wrap">{response}</pre>
                </div>
            )}
        </div>
    );
};

export default AIDisplay;