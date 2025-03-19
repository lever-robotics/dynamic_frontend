import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
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

interface DisplayState {
    streaming: boolean;
    llmResponse: string[];
    toolExecutions: {
        tool: string;
        arguments: any;
        result?: any;
        timestamp: number;
    }[];
    finalResponse?: {
        text: string;
        metadata: {
            tokensUsed: number;
            processingTime: number;
        };
    };
}

export const AIDisplay: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayState, setDisplayState] = useState<DisplayState>({
        streaming: false,
        llmResponse: [],
        toolExecutions: []
    });
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connectWebSocket = () => {
            console.log('Connecting to WebSocket...');
            const ws = new WebSocket('ws://localhost:4000/ai/ws');
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setError(null);
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                setTimeout(connectWebSocket, 5000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setError('Connection error');
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('Received message:', message);

                    switch (message.type) {
                        case 'llm-stream':
                            setDisplayState(prev => ({
                                ...prev,
                                streaming: true,
                                llmResponse: [...prev.llmResponse, message.data.text]
                            }));
                            break;

                        case 'tool-execution':
                            setDisplayState(prev => ({
                                ...prev,
                                toolExecutions: [...prev.toolExecutions, {
                                    tool: message.data.tool,
                                    arguments: message.data.arguments,
                                    timestamp: Date.now()
                                }]
                            }));
                            break;

                        case 'tool-result':
                            setDisplayState(prev => ({
                                ...prev,
                                toolExecutions: prev.toolExecutions.map(exec =>
                                    exec.tool === message.data.tool
                                        ? { ...exec, result: message.data.result }
                                        : exec
                                )
                            }));
                            break;

                        case 'complete':
                            setDisplayState(prev => ({
                                ...prev,
                                streaming: false,
                                finalResponse: message.data
                            }));
                            break;

                        case 'error':
                            setError(message.data.message);
                            setDisplayState(prev => ({
                                ...prev,
                                streaming: false
                            }));
                            break;
                    }
                } catch (err) {
                    console.error('Error processing message:', err);
                }
            };
        };

        connectWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const handleSearch = () => {
        if (!searchTerm.trim() || !isConnected || !wsRef.current) return;

        setError(null);
        setDisplayState({
            streaming: false,
            llmResponse: [],
            toolExecutions: []
        });

        wsRef.current.send(JSON.stringify({ task: searchTerm }));
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="mb-4 flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected' : 'Connecting...'}
                </span>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about Star Wars..."
                    className="w-full p-2 border rounded"
                />
            </div>

            {displayState.streaming && (
                <div className="mb-4 p-4 bg-gray-50 rounded">
                    <div className="font-mono whitespace-pre-wrap">
                        {displayState.llmResponse.join('')}
                    </div>
                </div>
            )}

            {displayState.toolExecutions.length > 0 && (
                <div className="mb-4">
                    <ToolStateDisplay toolStates={displayState.toolExecutions.map(exec => ({
                        tool: exec.tool,
                        status: exec.result ? 'completed' : 'in-progress',
                        parameters: exec.arguments,
                        result: exec.result
                    }))} />
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {displayState.finalResponse && (
                <div className="p-4 bg-white rounded shadow">
                    <pre className="whitespace-pre-wrap">{displayState.finalResponse.text}</pre>
                    {displayState.finalResponse.metadata && (
                        <div className="mt-4 text-sm text-gray-600">
                            <p>Processing Time: {displayState.finalResponse.metadata.processingTime}ms</p>
                            {displayState.finalResponse.metadata.tokensUsed > 0 && (
                                <p>Tokens Used: {displayState.finalResponse.metadata.tokensUsed}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIDisplay;