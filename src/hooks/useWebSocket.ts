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
	const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
	const optionsRef = useRef(options);
	const isConnectingRef = useRef(false);
	const { getValidToken, userId } = useAuth();

	// Update options ref when options change
	useEffect(() => {
		optionsRef.current = options;
	}, [options]);

	// Memoize connect function and keep it stable
	const connect = useCallback(async () => {
		// Prevent multiple connection attempts
		if (
			isConnectingRef.current ||
			wsRef.current?.readyState === WebSocket.OPEN
		) {
			return;
		}

		isConnectingRef.current = true;

		try {
			const token = await getValidToken();
			const wsUrl = `${WS_URL}/ws?token=${token}`;

			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = () => {
				console.log("WebSocket connected successfully");
				setIsConnected(true);
				setError(null);
				optionsRef.current.onConnect?.();
				isConnectingRef.current = false;
			};

			ws.onclose = (event) => {
				console.log("WebSocket disconnected:", event.code);
				setIsConnected(false);
				optionsRef.current.onDisconnect?.();
				isConnectingRef.current = false;

				// Only attempt reconnect if it wasn't a clean closure
				if (!event.wasClean) {
					reconnectTimeoutRef.current = setTimeout(() => {
						connect();
					}, 5000);
				}
			};

			ws.onerror = (event) => {
				const errorMessage = "WebSocket connection error";
				console.error(errorMessage, event);
				setError(errorMessage);
				optionsRef.current.onError?.(errorMessage);
			};

			ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data) as WebSocketMessage;
					optionsRef.current.onMessage?.(message);
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
	}, [getValidToken]); // Only depend on getValidToken

	// Memoize disconnect function
	const disconnect = useCallback(() => {
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}
		setIsConnected(false);
		isConnectingRef.current = false;
	}, []);

	// Memoize sendMessage function
	const sendMessage = useCallback(
		(type: WebSocketMessageType, payload: WebSocketMessage["payload"]) => {
			if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
				console.error("WebSocket is not connected");
				return false;
			}

			try {
				const message: WebSocketMessage = {
					type,
					userId,
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
		[userId],
	);

	// Set up initial connection and cleanup
	useEffect(() => {
		connect();

		return () => {
			disconnect();
		};
	}, [connect, disconnect]);

	return {
		isConnected,
		error,
		sendMessage,
	};
}
