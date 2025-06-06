"use client";
import { useWebSocket } from "@/hooks/useWebSocket";
import type {
	AgentChunk,
	FlagChunk,
	ToolChunk,
	WebSocketMessage,
} from "@/types/chat";
import { useUserConfig } from "@/utils/UserConfigProvider";
import { Fragment, useCallback, useEffect, useState } from "react";
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
					key={message.id}
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
	const { userConfig, upsertUserConfig } = useUserConfig();

	// Handle incoming WebSocket messages
	const handleMessage = useCallback(
		async (wsMessage: WebSocketMessage) => {
			const { payload } = wsMessage;

			switch (payload.type) {
				case "tool": {
					const toolChunk = payload as ToolChunk;
					console.log("[AnalyzingBusiness] Tool execution:", toolChunk);

					// Update progress based on tool execution
					setProgress((prev) =>
						Math.min(prev + TOOL_PROGRESS_INCREMENT, TOTAL_PROGRESS),
					);

					const addStatusMessage = (text: string) => {
						setStatusMessages((prev) => {
							// Check if the last message is the same to prevent duplicates
							if (prev.length > 0 && prev[prev.length - 1].text === text) {
								return prev;
							}
							setMessageCounter((counter) => counter + 1);
							return [
								...prev,
								{
									id: messageCounter,
									text,
									timestamp: Date.now(),
								},
							];
						});
					};

					switch (toolChunk.tool) {
						case "agent_scrape_website":
							addStatusMessage(`Reading ${businessInfo.name}'s Website`);
							break;
						case "agent_update_business_json":
						case "agent_update_business": {
							if (toolChunk.status === "complete" && toolChunk.result) {
								console.log(
									"[AnalyzingBusiness] Updating business overview:",
									toolChunk.result,
								);
								if (userConfig) {
									await upsertUserConfig({
										...userConfig,
										business_overview: toolChunk.result,
									});
								}
								addStatusMessage("Updating Business Memory");
							}
							break;
						}
						default: {
							if (toolChunk.status === "complete") {
								const toolDisplayNames: Record<string, string> = {
									agent_update_business: "Updating Business Memory",
									agent_read_business: "Thinking",
									data_gather: "Looking through connected data",
									agent_scrape_website: "Reading website",
									agent_update_business_json: "Updating Business Memory",
								};
								addStatusMessage(
									`${toolDisplayNames[toolChunk.tool] || toolChunk.tool} completed`,
								);
							}
							break;
						}
					}
					break;
				}
				case "agent": {
					const agentChunk = payload as AgentChunk;
					console.log("[AnalyzingBusiness] Agent status:", agentChunk);

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
					break;
				}
			}
		},
		[
			userConfig,
			upsertUserConfig,
			onComplete,
			messageCounter,
			businessInfo.name,
		],
	);

	// WebSocket connection with message handling
	const { isConnected, error, sendMessage } = useWebSocket({
		onMessage: handleMessage,
	});

	// Initialize analysis when connected
	useEffect(() => {
		if (isConnected) {
			console.log("[AnalyzingBusiness] Starting analysis");
			// Send initial flag message with business info
			sendMessage("flag", {
				type: "flag",
				flag: "onboarding",
				context: {
					data_connectors: userConfig?.data_connectors || [],
					business_name: businessInfo.name,
					business_url: businessInfo.url,
					business_overview: userConfig?.business_overview || "",
				},
			} as unknown as FlagChunk);
		}
	}, [isConnected, businessInfo, userConfig, sendMessage]);

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
