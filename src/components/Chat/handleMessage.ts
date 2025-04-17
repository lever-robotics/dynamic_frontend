import type {
    WebSocketMessage,
    MessageBubble,
    MessageChunkBubble,
    AgentChunk,
    ToolChunk,
    MessageChunk,
} from "@/types/chat";

interface HandleMessageParams {
    addArtifact?: (type: 'image' | 'document' | 'query', content: string) => Promise<void>;
    isLaunchMode?: boolean;
    createThread?: (title: string) => Promise<void>;
    onLaunchComplete?: (threadId: string) => void;
}

export const handleMessage = (
    wsMessage: WebSocketMessage,
    setLocalMessages: React.Dispatch<React.SetStateAction<MessageBubble[]>>,
    params: HandleMessageParams
) => {
    console.log('[ChatDisplay] Received WebSocket message:', wsMessage.type);
    const { payload, messageId } = wsMessage;
    const { addArtifact, isLaunchMode, createThread, onLaunchComplete } = params;

    switch (payload.type) {
        case "text": {
            console.log('[ChatDisplay] Processing text message');
            setLocalMessages((prev) => {
                const messageIndex = prev.length - 1;
                const newChunk: MessageChunkBubble = {
                    content: (payload as MessageChunk).content,
                };

                if (prev[messageIndex]?.type === "assistant") {
                    const lastChunkIndex = prev[messageIndex].chunks.length - 1;

                    if (lastChunkIndex >= 0) {
                        const updatedChunks = [...prev[messageIndex].chunks];
                        updatedChunks[lastChunkIndex] = {
                            ...updatedChunks[lastChunkIndex],
                            content: updatedChunks[lastChunkIndex].content + newChunk.content,
                        };

                        const updatedMessage = {
                            ...prev[messageIndex],
                            chunks: updatedChunks,
                        };
                        return [
                            ...prev.slice(0, messageIndex),
                            updatedMessage,
                            ...prev.slice(messageIndex + 1),
                        ];
                    }

                    const updatedMessage = {
                        ...prev[messageIndex],
                        chunks: [...prev[messageIndex].chunks, newChunk],
                    };
                    return [
                        ...prev.slice(0, messageIndex),
                        updatedMessage,
                        ...prev.slice(messageIndex + 1),
                    ];
                }

                const newMessage: MessageBubble = {
                    id: messageId,
                    type: "assistant",
                    chunks: [newChunk],
                };
                return [...prev, newMessage];
            });
            break;
        }
        case "agent": {
            console.log('[ChatDisplay] Processing agent message');
            setLocalMessages((prev) => {
                const messageIndex = prev.findIndex(
                    (m) => m.agentName === (payload as AgentChunk).name,
                );
                if (messageIndex === -1) {
                    const newMessage: MessageBubble = {
                        id: messageId,
                        type: "agent",
                        agentName: (payload as AgentChunk).name,
                        status: (payload as AgentChunk).status,
                        chunks: [],
                    };
                    return [...prev, newMessage];
                }

                const updatedMessage = {
                    ...prev[messageIndex],
                    status: (payload as AgentChunk).status,
                };
                return [
                    ...prev.slice(0, messageIndex),
                    updatedMessage,
                    ...prev.slice(messageIndex + 1),
                ];
            });
            break;
        }
        case "tool": {
            console.log('[ChatDisplay] Processing tool message');
            setLocalMessages((prev) => {
                const messageIndex = prev.findIndex(
                    (m) => m.agentName === (payload as ToolChunk).agentName,
                );
                if (messageIndex === -1) {
                    const newMessage: MessageBubble = {
                        id: messageId,
                        type: "agent",
                        agentName: (payload as ToolChunk).agentName,
                        status: (payload as ToolChunk).status,
                        chunks: [
                            {
                                toolCall: {
                                    tool: (payload as ToolChunk).tool,
                                    status: (payload as ToolChunk).status,
                                    agentName: (payload as ToolChunk).agentName,
                                    arguments: (payload as ToolChunk).arguments,
                                    result: (payload as ToolChunk).result,
                                    error: (payload as ToolChunk).error,
                                },
                            },
                        ],
                    };
                    return [...prev, newMessage];
                }

                if ((payload as ToolChunk).status === "running") {
                    return [
                        ...prev.slice(0, messageIndex),
                        {
                            ...prev[messageIndex],
                            chunks: [
                                ...prev[messageIndex].chunks,
                                {
                                    toolCall: {
                                        tool: (payload as ToolChunk).tool,
                                        status: (payload as ToolChunk).status,
                                        agentName: (payload as ToolChunk).agentName,
                                        arguments: (payload as ToolChunk).arguments,
                                        result: (payload as ToolChunk).result,
                                        error: (payload as ToolChunk).error,
                                    },
                                },
                            ],
                        },
                        ...prev.slice(messageIndex + 1),
                    ];
                }

                if ((payload as ToolChunk).status === "complete") {
                    console.log('[ChatDisplay] Tool execution complete');
                    const updatedChunk = prev[messageIndex].chunks.pop();
                    if (!updatedChunk) return [...prev];
                    updatedChunk.toolCall.status = (payload as ToolChunk).status;
                    updatedChunk.toolCall.result = (payload as ToolChunk).result;
                    updatedChunk.toolCall.error = (payload as ToolChunk).error;

                    const tool = (payload as ToolChunk).tool;
                    const result = (payload as ToolChunk).result;
                    const image = (payload as ToolChunk).image;

                    switch (tool) {
                        case "agent_read_business_json":
                            if (result) {
                                addArtifact?.('document', result);
                            }
                            break;
                        case "agent_execute_python_code":
                            if (image) {
                                addArtifact?.('image', image);
                            }
                            break;
                        case "agent_execute_sql_query":
                            if (result) {
                                addArtifact?.('query', result);
                            }
                            break;
                        default:
                            console.log(`Unhandled tool type: ${tool}`);
                    }

                    if (isLaunchMode && prev.length === 1 && createThread) {
                        console.log('[ChatDisplay] Creating thread from tool result');
                        createThread(result || "New Analysis").then(() => {
                            console.log('[ChatDisplay] Thread created');
                            onLaunchComplete?.("");
                        });
                    }

                    const updatedMessage = {
                        ...prev[messageIndex],
                        chunks: [...prev[messageIndex].chunks, updatedChunk],
                    };
                    return [
                        ...prev.slice(0, messageIndex),
                        updatedMessage,
                        ...prev.slice(messageIndex + 1),
                    ];
                }

                if ((payload as ToolChunk).status === "error") {
                    const updatedChunk = prev[messageIndex].chunks.pop();
                    if (!updatedChunk) return [...prev];
                    updatedChunk.toolCall.status = (payload as ToolChunk).status;
                    updatedChunk.toolCall.error = (payload as ToolChunk).error;
                    const updatedMessage = {
                        ...prev[messageIndex],
                        chunks: [...prev[messageIndex].chunks, updatedChunk],
                    };
                    return [
                        ...prev.slice(0, messageIndex),
                        ...prev.slice(messageIndex + 1),
                        updatedMessage,
                    ];
                }

                return prev;
            });
            break;
        }
    }
}; 