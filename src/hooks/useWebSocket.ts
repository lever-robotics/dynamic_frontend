import { useState, useRef, useCallback, useEffect } from "react";
import type { WebSocketMessage, WebSocketMessageType } from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const WS_URL =
	API_BASE_URL?.replace("https", "wss").replace("http", "ws") ||
	"ws://localhost:8000";

interface UseWebSocketOptions {
	onMessage?: (message: WebSocketMessage) => void;
	onConnect?: () => void;
	onDisconnect?: () => void;
	onError?: (error: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const { getValidToken, isAuthenticated } = useAuth();
	const isConnectingRef = useRef(false);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
	const mountedRef = useRef(false);

	const connect = useCallback(async () => {
		if (isConnectingRef.current || !isAuthenticated) {
			console.log("Connection blocked:", {
				isConnecting: isConnectingRef.current,
				isAuthenticated,
			});
			return;
		}

		try {
			isConnectingRef.current = true;
			const token = await getValidToken();

			// Close existing connection if any
			if (wsRef.current) {
				wsRef.current.close();
			}

			const wsUrl = `${WS_URL}/ws?token=${token}`;
			console.log("Attempting WebSocket connection to:", wsUrl);

			// Add timeout to detect connection failures
			const connectionTimeout = setTimeout(() => {
				if (wsRef.current?.readyState !== WebSocket.OPEN) {
					console.error("WebSocket connection timeout");
					wsRef.current?.close();
				}
			}, 5000);

			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				clearTimeout(connectionTimeout);
				console.log("WebSocket connected successfully");
				setIsConnected(true);
				setError(null);
				options.onConnect?.();
				isConnectingRef.current = false;
			};

			ws.onclose = (event) => {
				clearTimeout(connectionTimeout);
				console.log(
					"WebSocket disconnected with code:",
					event.code,
					"reason:",
					event.reason,
					"wasClean:",
					event.wasClean,
				);
				setIsConnected(false);
				options.onDisconnect?.();
				isConnectingRef.current = false;

				// Only attempt reconnect if it wasn't a clean closure
				if (!event.wasClean) {
					reconnectTimeoutRef.current = setTimeout(() => {
						if (isAuthenticated) {
							console.log("Attempting to reconnect...");
							connect();
						}
					}, 5000);
				}
			};

			ws.onerror = (event) => {
				console.error("WebSocket error:", event);
				// Try to get more error details
				const error = (event as any).error;
				const errorMessage = error
					? `WebSocket error: ${error.message}`
					: "WebSocket connection error";
				setError(errorMessage);
				options.onError?.(errorMessage);
			};

			ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data) as WebSocketMessage;
					console.log("WebSocket message received:", {
						type: message.type,
						timestamp: message.timestamp,
					});
					options.onMessage?.(message);
				} catch (error) {
					console.error("Error processing message:", error);
					setError("Failed to process message");
				}
			};
		} catch (error) {
			console.error("Error connecting to WebSocket:", error);
			setError(`Failed to establish connection: ${error}`);
			isConnectingRef.current = false;
		}
	}, [isAuthenticated, getValidToken, options]);

	const disconnect = useCallback(() => {
		if (wsRef.current) {
			wsRef.current.close();
		}
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}
	}, []);

	const sendMessage = useCallback(
		(type: WebSocketMessageType, payload: any) => {
			if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
				console.error("WebSocket is not connected");
				return false;
			}

			try {
				const message: WebSocketMessage = {
					type,
					userId: "user", // This should come from auth context
					payload,
					timestamp: new Date().toISOString(),
				};
				wsRef.current.send(JSON.stringify(message));
				return true;
			} catch (error) {
				console.error("Error sending message:", error);
				return false;
			}
		},
		[],
	);

	// Connect when component mounts and auth state changes
	useEffect(() => {
		mountedRef.current = true;

		if (isAuthenticated && !wsRef.current) {
			connect();
		}

		return () => {
			// Only disconnect if the component is unmounting
			if (mountedRef.current) {
				console.log("Component unmounting, cleaning up WebSocket");
				mountedRef.current = false;
				disconnect();
			}
		};
	}, [isAuthenticated, disconnect, connect]);

	return {
		isConnected,
		error,
		sendMessage,
		connect,
		disconnect,
	};
}
