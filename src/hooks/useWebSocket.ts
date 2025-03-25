import { useState, useRef, useCallback, useEffect } from "react";
import type { WebSocketMessage, WebSocketMessageType } from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

			const wsUrl = `${API_BASE_URL}/ws?token=${token}`;
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				console.log("WebSocket connected");
				setIsConnected(true);
				setError(null);
				options.onConnect?.();
				isConnectingRef.current = false;
			};

			ws.onclose = () => {
				console.log("WebSocket disconnected");
				setIsConnected(false);
				options.onDisconnect?.();
				isConnectingRef.current = false;

				// Attempt to reconnect after a delay
				reconnectTimeoutRef.current = setTimeout(() => {
					if (isAuthenticated) {
						connect();
					}
				}, 5000);
			};

			ws.onerror = (event) => {
				console.error("WebSocket error:", event);
				const errorMessage = "WebSocket connection error";
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
			setError("Failed to establish connection");
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
		if (isAuthenticated) {
			connect();
		}
		return () => {
			disconnect();
		};
	}, [isAuthenticated, connect, disconnect]);

	return {
		isConnected,
		error,
		sendMessage,
		connect,
		disconnect,
	};
}
