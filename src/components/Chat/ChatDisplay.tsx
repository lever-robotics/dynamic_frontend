import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import type {
	AgentChunk,
	MessageBubble,
	MessageChunk,
	MessageChunkBubble,
	Payload,
	ToLLMMessage,
	ToolChunk,
	ToolExecutionBubble,
	WebSocketMessage,
} from "@/types/chat";
import { memo, useCallback, useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface ChatDisplayProps {
	onClose?: () => void;
	sendOnConnect?: () => Payload;
	isLaunchMode?: boolean;
}

export const ChatDisplay = memo(function ChatDisplay({
	onClose,
	sendOnConnect,
	isLaunchMode = false,
}: ChatDisplayProps) {
	const [localMessages, setLocalMessages] = useState<MessageBubble[]>([]);
	const [isInitializing, setIsInitializing] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);
	const [potentialResponses, setPotentialResponses] = useState<string[]>([]);
	const {
		state: { currentThreadId, launchChatMessage, artifacts },
		addMessage,
		addArtifact,
		setCurrentArtifactById,
		updateArtifact,
		fetchThreadMessages,
	} = useWorkspace();

	// Handle incoming WebSocket messages
	const handleMessage = useCallback(
		async (wsMessage: WebSocketMessage) => {
			const { payload, messageId } = wsMessage;

			// Check if this is the final message and if so then save Agent output to the database.
			if (
				payload.type === "agent" &&
				(payload as AgentChunk).status === "complete"
			) {
				console.log("[ChatDisplay] Final message received:", payload);

				// Use a timeout to ensure all messages are processed
				setTimeout(() => {
					// Find the index of the last user message
					const lastUserMessageIndex =
						localMessages.length -
						1 -
						[...localMessages]
							.reverse()
							.findIndex((msg) => msg.type === "user");

					if (lastUserMessageIndex !== -1) {
						// Get all messages from the last user message
						const messagesToSave = localMessages.slice(lastUserMessageIndex);

						console.log("[ChatDisplay] Saving messages:", messagesToSave);

						// Track which messages we've already saved
						const savedMessageIds = new Set<string>();

						// Save messages in chronological order (oldest to newest)
						for (let i = 0; i < messagesToSave.length; i++) {
							const message = messagesToSave[i];
							// Only save if we haven't saved this message before
							if (!savedMessageIds.has(message.id)) {
								addMessage(message);
								savedMessageIds.add(message.id);
							}
						}
					}
				}, 1000); // Wait 1 second to ensure all messages are processed
			}

			console.log("[ChatDisplay] Received message:", payload);

			switch (payload.type) {
				case "text": {
					setLocalMessages((prev) => {
						const messageIndex = prev.length - 1;
						const newChunk: MessageChunkBubble = {
							content: (payload as MessageChunk).content,
						};

						// Append new text chunk to current message
						if (prev[messageIndex]?.type === "assistant") {
							const lastChunkIndex = prev[messageIndex].chunks.length - 1;

							// Merge with the last chunk if it exists
							if (lastChunkIndex >= 0) {
								const updatedChunks = [...prev[messageIndex].chunks];
								updatedChunks[lastChunkIndex] = {
									...updatedChunks[lastChunkIndex],
									content:
										updatedChunks[lastChunkIndex].content + newChunk.content,
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

							// If no chunks exist, add the new chunk
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

						// Create new message
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
					// Keep agent logic for tracking purposes but don't display
					const agentChunk = payload as AgentChunk;
					console.log(
						"[ChatDisplay] Agent status update:",
						agentChunk.name,
						agentChunk.status,
					);
					break;
				}
				case "tool": {
					setLocalMessages((prev) => {
						const toolChunk = payload as ToolChunk;
						const newChunk: MessageChunkBubble = {
							toolCall: {
								tool: toolChunk.tool,
								arguments:
									typeof toolChunk.arguments === "string"
										? JSON.parse(toolChunk.arguments)
										: toolChunk.arguments,
								status: toolChunk.status,
								result: toolChunk.result,
								error: toolChunk.error,
							},
						};

						// Handle different types of tool results
						const tool = toolChunk.tool;
						const result = toolChunk.result;
						const image = toolChunk.image;
						const toolArgs =
							typeof toolChunk.arguments === "string"
								? JSON.parse(toolChunk.arguments)
								: toolChunk.arguments;
						console.log("[ChatDisplay] Tool result:", toolChunk);

						// Create an async function to handle the tool processing
						const processTool = async () => {
							switch (tool) {
								case "agent_user_potential_responses": {
									try {
										if (
											toolArgs &&
											typeof toolArgs === "object" &&
											"potential_responses" in toolArgs
										) {
											setPotentialResponses(toolArgs.potential_responses);
										}
									} catch (error) {
										console.error(
											"[ChatDisplay] Error handling potential responses:",
											error,
										);
									}
									break;
								}
								case "write_bi_report": {
									const report = toolArgs.report;
									// Only Show tool when it's complete
									if (toolChunk.status === "complete") {
										if (report) {
											console.log(
												"[ChatDisplay] Updating first document:",
												report,
											);
											const firstDocument = artifacts.documents[0];
											if (firstDocument) {
												updateArtifact({
													...firstDocument,
													content: report,
												});
												artifacts.documents[0] = {
													...firstDocument,
													content: report,
												};
												newChunk.toolCall.artifactId = firstDocument.id;
											} else {
												// Create new document and get its ID
												const artifactId = await addArtifact(
													"document",
													report,
												);
												if (artifactId) {
													newChunk.toolCall.artifactId = artifactId;
												}
											}
										}
										const newMessage: MessageBubble = {
											id: messageId,
											type: "tool",
											chunks: [newChunk],
										};
										return [...prev, newMessage];
									}
									break;
								}
								case "agent_execute_bigquery": {
									const query = toolArgs.query;
									// Only Show tool when it's complete
									if (toolChunk.status === "complete") {
										if (query) {
											//log query on complete
											console.log("[ChatDisplay] Adding query:", query);
											// Create new query and get its ID
											const artifactId = await addArtifact("query", query);
											if (artifactId) {
												newChunk.toolCall.artifactId = artifactId;
											}
										}
										const newMessage: MessageBubble = {
											id: messageId,
											type: "tool",
											chunks: [newChunk],
										};
										return [...prev, newMessage];
									}
									break;
								}
								default: {
									console.log(`Unhandled tool type: ${tool}`);
									break;
								}
							}
							return prev;
						};

						// Execute the async function
						processTool().catch(console.error);
						return prev;
					});
					break;
				}
			}
		},
		[localMessages, addMessage, addArtifact, updateArtifact, artifacts],
	);

	// WebSocket connection with message handling
	const { isConnected, error, sendMessage } = useWebSocket({
		onMessage: handleMessage,
	});

	// Initialize launch mode setup
	const initializeChat = useCallback(async () => {
		// Prevent multiple initializations
		if (hasInitialized || isInitializing) {
			console.log(
				"[ChatDisplay] Already initialized or initializing, skipping",
			);
			return;
		}

		console.log("[ChatDisplay] Starting initialization");
		setIsInitializing(true);

		try {
			// Send initial connection message in both modes
			const msg = sendOnConnect();
			console.log("[ChatDisplay] Sending initial connection message:", msg);
			await sendMessage(msg.type, msg);

			if (isLaunchMode) {
				// Create and send the launch message
				const userMessageId = crypto.randomUUID();
				const userMessage: MessageBubble = {
					id: userMessageId,
					type: "user",
					chunks: [{ content: launchChatMessage }],
				};

				// In launch mode, start fresh with just this message
				setLocalMessages([userMessage]);
				// await addMessage(userMessage); Actually save the user message after the assistnat has repsponsed

				// Send message to LLM
				await sendMessage("toLLM", {
					type: "toLLM",
					text: launchChatMessage,
				} as ToLLMMessage);
			} else if (currentThreadId) {
				// Normal mode: fetch messages using the workspace context function
				const messages = await fetchThreadMessages(currentThreadId);
				setLocalMessages(messages);
			}

			// Mark as initialized
			setHasInitialized(true);
			console.log("[ChatDisplay] Initialization complete");
		} catch (error) {
			console.error("[ChatDisplay] Error during initialization:", error);
			setHasInitialized(false); // Allow retry on error
		} finally {
			setIsInitializing(false);
		}
	}, [
		currentThreadId,
		isLaunchMode,
		launchChatMessage,
		isInitializing,
		hasInitialized,
		sendOnConnect,
		sendMessage,
		fetchThreadMessages,
	]);

	// Initialize when all conditions are met
	useEffect(() => {
		if (isConnected) {
			console.log("[ChatDisplay] Conditions met, attempting initialization");
			initializeChat();
		}
	}, [isConnected, initializeChat]); //Execute on is connected

	// Handle new user messages
	const handleNewMessage = async (content: string) => {
		console.log("[ChatDisplay] Handling new message:", content);
		const userMessageId = crypto.randomUUID();
		const assistantMessageId = crypto.randomUUID();

		// Add user message to both local and workspace state
		const userMessage: MessageBubble = {
			id: userMessageId,
			type: "user",
			chunks: [{ content }],
		};

		// take away potential responses
		setPotentialResponses([]);

		// Add user message to both local and workspace state
		setLocalMessages((prev) => [...prev, userMessage]);
		// addMessage(userMessage); Add the user message when its rendered in the begingn

		console.log("[ChatDisplay] Sending message to LLM");
		sendMessage("toLLM", { type: "toLLM", text: content } as ToLLMMessage);
	};

	return (
		<div className="flex flex-col h-full bg-[#F4F5F7]">
			{/* Header */}
			{/* <div className="flex items-center justify-between border-b p-4 bg-white">
				<div className="flex items-center gap-2">
					{!isLaunchMode && (
						<>
							<div
								className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"
									}`}
							/>
							<span className="text-sm text-gray-600">
								{isConnected ? "Connected" : "Connecting..."}
							</span>
						</>
					)}
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						type="button"
					>
						✕
					</button>
				)}
			</div> */}

			{/* Messages */}
			<MessageList
				messages={localMessages}
				onToolSelect={useCallback(
					(tool: ToolExecutionBubble) => {
						if (tool.artifactId) {
							setCurrentArtifactById(tool.artifactId);
						}
					},
					[setCurrentArtifactById],
				)}
			/>

			{/* Potential Responses */}
			{potentialResponses.length > 0 && (
				<div className="flex flex-wrap gap-2 p-4">
					{potentialResponses.map((response) => (
						<button
							key={response}
							type="button"
							onClick={() => {
								handleNewMessage(response);
								setPotentialResponses([]);
							}}
							className="px-4 py-2 text-sm text-primary border border-primary/20 rounded-full hover:bg-primary/10 transition-colors"
						>
							{response}
						</button>
					))}
				</div>
			)}

			{/* Chat Input */}
			<ChatInput
				isConnected={isConnected}
				onSubmit={handleNewMessage}
				error={error}
				isLaunchMode={isLaunchMode}
			/>
		</div>
	);
});
