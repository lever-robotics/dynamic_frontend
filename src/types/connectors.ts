import bigqueryIcon from "@/assets/bigquery.png";
import gsIcon from "@/assets/gs.png";
import odooIcon from "@/assets/odoo.png";
import quickBooksIcon from "@/assets/quick_books.png";
import shopifyIcon from "@/assets/shopify.png";

export interface DataConnector {
	id: string;
	type: string;
	meta: {
		version: string;
		entities: Array<Entity>;
	};
}

export interface Connection {
	name: string;
	type: string;
	description: string;
	icon: string;
	url: string;
	isExpanded: boolean;
	isConnected: boolean;
	isAvailable: boolean;
}

export interface CombinedConnection {
	connection: Connection;
	dataConnector: DataConnector;
}

export interface Entity {
	name: string;
	displayName: string;
	description: string;
	fields: Array<{
		name: string;
		displayName: string;
		description: string;
	}>;
}

export const Connections: Connection[] = [
	{
		name: "Google Sheets",
		type: "google_sheets",
		icon: gsIcon,
		description: "Connect your spreadsheets",
		isExpanded: false,
		isAvailable: false,
		isConnected: false,
		url: "https://sheets.google.com",
	},
	{
		name: "BigQuery",
		type: "bigquery",
		icon: bigqueryIcon,
		description: "Google BigQuery",
		isExpanded: false,
		isAvailable: true,
		isConnected: false,
		url: `${import.meta.env.VITE_API_URL}/v0/connectors/bigquery/login`,
	},
	{
		name: "Odoo",
		type: "odoo",
		icon: odooIcon,
		description: "ERP integration",
		isExpanded: false,
		isAvailable: false,
		isConnected: false,
		url: "https://odoo.com",
	},
	{
		name: "Shopify",
		type: "shopify",
		icon: shopifyIcon,
		description: "E-commerce platform",
		isExpanded: false,
		isAvailable: true,
		isConnected: false,
		url: "https://shopify.com",
	},
	{
		name: "QuickBooks",
		type: "quickbooks",
		icon: quickBooksIcon,
		description: "Accounting software",
		isExpanded: false,
		isAvailable: false,
		isConnected: false,
		url: "https://quickbooks.com",
	},
];
