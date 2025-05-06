import type {
	MessageBubble as MessageBubbleType,
	ToolExecutionBubble,
} from "@/types/chat";
import type React from "react";
import { MessageBubble } from "./MessageBubble";

const sampleMessages: MessageBubbleType[] = [
	{
		id: "1",
		type: "user",
		chunks: [{ content: "Can you help me analyze my customer data?" }],
	},
	{
		id: "2",
		type: "assistant",
		chunks: [
			{
				content:
					"I'll help you analyze your customer data. Let me break this down into steps:",
			},
			{
				content:
					"\n1. First, we'll look at customer demographics\n2. Then analyze purchase patterns\n3. Finally, identify top customer segments",
			},
		],
	},
	{
		id: "3",
		type: "agent",
		agentName: "DataAnalysisAgent",
		status: "running",
		chunks: [
			{
				toolCall: {
					tool: "query_customer_data",
					agentName: "DataAnalysisAgent",
					arguments: {
						query: "SELECT * FROM customers WHERE purchase_date > '2023-01-01'",
					},
					status: "running",
				},
			},
		],
	},
	{
		id: "4",
		type: "assistant",
		chunks: [
			{ content: "Based on the analysis, here are the key findings:" },
			{
				content:
					"\n- 65% of customers are between 25-34 years old\n- Top 3 products account for 45% of revenue\n- Most active customers are from urban areas",
			},
		],
	},
];

export function MessageBubbleDemo() {
	const handleToolSelect = (tool: ToolExecutionBubble) => {
		console.log("Tool selected:", tool);
	};

	return (
		<div className="flex flex-col space-y-4 p-4 max-w-2xl mx-auto bg-gray-50 min-h-screen">
			<h1 className="text-xl font-bold mb-4">Message Bubble Demo</h1>
			{sampleMessages.map((message) => (
				<MessageBubble
					key={message.id}
					message={message}
					onToolSelect={handleToolSelect}
				/>
			))}
		</div>
	);
}
