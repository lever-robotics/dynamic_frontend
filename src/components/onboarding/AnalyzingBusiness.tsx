"use client";
import { userConfigStore } from "@/stores/UserConfigStore";
import type {
	AgentChunk,
	FlagChunk,
	MessageBubble,
	ToolChunk,
	ToolExecutionBubble,
	WebSocketMessage,
} from "@/types/chat";
import { useAuth } from "@/utils/AuthProvider";
import { WebSocketConversation } from "@/utils/WebSocket";
import { observer } from "mobx-react-lite";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "../common/Modal";

// Progress calculation constants
const TOOL_PROGRESS_INCREMENT = 2; // Each tool adds 5%
const AGENT_PROGRESS_INCREMENT = 10; // Each completed agent adds 10%
const TOTAL_PROGRESS = 100; // Total progress to reach

interface AnalyzingBusinessProps {
	onComplete: () => void;
	businessInfo: {
		name: string;
		url: string;
	};
}

interface ProgressBarProps {
	progress: number;
	width: number;
	className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
	progress,
	width,
	className = "",
}) => {
	return (
		<div
			className={`relative h-4 bg-slate-100 rounded-[40px] ${className}`}
			style={{ width }}
		>
			<div
				className="absolute top-0 left-0 h-4 bg-primary-400 rounded-[40px] transition-all duration-300 ease-in-out"
				style={{ width: `${progress}%` }}
				aria-valuenow={progress}
				aria-valuemin={0}
				aria-valuemax={100}
			/>
		</div>
	);
};

interface StatusTextProps {
	messages: Array<{
		id: number;
		text: string;
		timestamp: number;
	}>;
}

const StatusText: React.FC<StatusTextProps> = ({ messages }) => {
	// Only show the last 3 messages
	const visibleMessages = messages.slice(-3);

	return (
		<div className="flex flex-col gap-1">
			{visibleMessages.map((message) => (
				<p
					key={message.text}
					className="text-xs leading-4 text-center text-slate-600 text-opacity-60"
				>
					{message.text}
				</p>
			))}
		</div>
	);
};

export function AnalyzingBusiness({
	onComplete,
	businessInfo,
}: AnalyzingBusinessProps) {
	const [progress, setProgress] = useState(0);
	const [statusMessages, setStatusMessages] = useState<
		Array<{ id: number; text: string; timestamp: number }>
	>([]);
	const [runningAgents, setRunningAgents] = useState<string[]>([]);
	const [messageCounter, setMessageCounter] = useState(1);
	const { session } = useAuth();
	const ws = useRef<WebSocketConversation | null>(null);

	useEffect(() => {
		const initWebSocket = async () => {
			ws.current = new WebSocketConversation(
				session?.access_token || "",
				session?.user.id || "",
				userConfigStore.threadId,
			);
			ws.current.subscribe("tool", async (toolCall: ToolExecutionBubble) => {
				setProgress((prev) =>
					Math.min(prev + TOOL_PROGRESS_INCREMENT, TOTAL_PROGRESS),
				);

				const addStatusMessage = (text: string) => {
					setStatusMessages((prev) => {
						// Check if the last message is the same to prevent duplicates
						if (prev.length > 0 && prev[prev.length - 1].text === text) {
							return prev;
						}
						return [
							...prev,
							{
								id: prev.length + 1,
								text,
								timestamp: Date.now(),
							},
						];
					});
				};

				switch (toolCall.tool) {
					case "agent_scrape_website":
						addStatusMessage("Reading Website Content");
						break;
					case "agent_update_business_json":
					case "agent_update_business": {
						if (toolCall.status === "complete" && toolCall.result) {
							addStatusMessage("Updating Business Memory");
						}
						break;
					}
					default: {
						if (toolCall.status === "complete") {
							addStatusMessage(`${toolCall.tool} completed`);
						}
						break;
					}
				}
			});
			ws.current.subscribe("agent", (agentChunk: AgentChunk) => {
				if (agentChunk.status === "running") {
					setRunningAgents((prev) => [
						agentChunk.name,
						...prev.filter((name) => name !== agentChunk.name),
					]);
				} else if (agentChunk.status === "complete") {
					setProgress((prev) =>
						Math.min(prev + AGENT_PROGRESS_INCREMENT, TOTAL_PROGRESS),
					);
					if (agentChunk.name === "Data Gathering Agent") {
						setProgress(TOTAL_PROGRESS);
						setMessageCounter((counter) => counter + 1);
						setStatusMessages((prev) => [
							...prev,
							{
								id: messageCounter,
								text: "Finalizing analysis",
								timestamp: Date.now(),
							},
						]);
						setTimeout(() => onComplete(), 1000);
					}
				}
			});
			ws.current.connect("onboarding");
		};
		if (ws.current === null) {
			initWebSocket();
		}
		return () => {
			ws.current?.disconnect();
		};
	}, [session, onComplete, messageCounter]);

	return (
		<Modal
			isOpen={true}
			size="xl"
			showCloseButton={false}
			preventBackgroundClick={true}
		>
			<div className="flex justify-center items-center w-full h-[90vh]">
				<section className="flex flex-col justify-center items-center h-[738px] w-[1400px]">
					<h1 className="mb-24 text-5xl leading-5">
						<span className="text-black">{runningAgents[0]}</span>
					</h1>

					<ProgressBar progress={progress} width={414} className="mb-20" />

					<StatusText messages={statusMessages} />
				</section>
			</div>
		</Modal>
	);
}

export default observer(AnalyzingBusiness);
