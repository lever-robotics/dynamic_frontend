import { useUserConfig } from "@/utils/UserConfigProvider";
import { useEffect, useState } from "react";
import { JsonView } from "./JsonViewer";

function JsonToMarkdown({ data }: { data: any }) {
	const renderBusinessProfile = (businessProfile: any) => {
		return (
			<div className="space-y-6">
				{/* Business Name Section */}
				{businessProfile.business_name && (
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{businessProfile.business_name}
						</h1>
						{businessProfile.short_description && (
							<p className="text-lg text-gray-600">
								{businessProfile.short_description}
							</p>
						)}
					</div>
				)}

				{/* Main Content */}
				<div className="space-y-6">
					{/* Long Description */}
					{businessProfile.long_description && (
						<div className="bg-white p-6 rounded-lg shadow-sm">
							<h2 className="text-xl font-semibold text-gray-800 mb-4">
								About
							</h2>
							<p className="text-gray-700 leading-relaxed">
								{businessProfile.long_description}
							</p>
						</div>
					)}

					{/* Mission & Vision */}
					{(businessProfile.mission_statement ||
						businessProfile.vision_statement) && (
						<div className="grid grid-cols-2 gap-6">
							{businessProfile.mission_statement && (
								<div className="bg-white p-6 rounded-lg shadow-sm">
									<h2 className="text-xl font-semibold text-gray-800 mb-3">
										Mission
									</h2>
									<p className="text-gray-700 italic">
										{businessProfile.mission_statement}
									</p>
								</div>
							)}
							{businessProfile.vision_statement && (
								<div className="bg-white p-6 rounded-lg shadow-sm">
									<h2 className="text-xl font-semibold text-gray-800 mb-3">
										Vision
									</h2>
									<p className="text-gray-700 italic">
										{businessProfile.vision_statement}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Objectives */}
					{businessProfile.objectives &&
						businessProfile.objectives.length > 0 && (
							<div className="bg-white p-6 rounded-lg shadow-sm">
								<h2 className="text-xl font-semibold text-gray-800 mb-4">
									Potential Objectives
								</h2>
								<ul className="space-y-2">
									{businessProfile.objectives.map(
										(objective: string, index: number) => (
											<li
												key={`objective-${index}`}
												className="flex items-start"
											>
												<span className="text-accent-500 mr-2">•</span>
												<span className="text-gray-700">{objective}</span>
											</li>
										),
									)}
								</ul>
							</div>
						)}
				</div>
			</div>
		);
	};

	const renderValue = (value: any): React.ReactNode => {
		if (Array.isArray(value) && value.length > 0) {
			return (
				<div className="space-y-4">
					{value.map((item, index) => (
						<div
							key={`array-item-${index}`}
							className="border-l-4 border-accent-200 pl-4"
						>
							{typeof item === "object"
								? Object.entries(item).map(
										([key, val]) =>
											val && (
												<div key={`${key}-${index}`} className="mb-2">
													<h3 className="font-medium text-gray-800">
														{key
															.split("_")
															.map(
																(word) =>
																	word.charAt(0).toUpperCase() + word.slice(1),
															)
															.join(" ")}
													</h3>
													<p className="text-gray-700">{val as string}</p>
												</div>
											),
									)
								: item && (
										<p key={`text-item-${index}`} className="text-gray-700">
											{item}
										</p>
									)}
						</div>
					))}
				</div>
			);
		}

		if (typeof value === "object" && value !== null) {
			const entries = Object.entries(value).filter(
				([_, val]) => val !== null && val !== undefined,
			);
			if (entries.length > 0) {
				return (
					<div className="space-y-4">
						{entries.map(([key, val], index) => (
							<div
								key={`entry-${key}-${index}`}
								className="border-l-4 border-accent-200 pl-4"
							>
								<h3 className="font-medium text-gray-800">
									{key
										.split("_")
										.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
										.join(" ")}
								</h3>
								{typeof val === "object" && val !== null ? (
									renderValue(val)
								) : (
									<p className="text-gray-700">{val as string}</p>
								)}
							</div>
						))}
					</div>
				);
			}
		}

		return value ? <p className="text-gray-700">{value}</p> : null;
	};

	const renderGeneralSection = (key: string, value: any) => {
		if (
			!value ||
			(typeof value === "object" && Object.keys(value).length === 0)
		) {
			return null;
		}

		const formatKey = (key: string) => {
			return key
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		};

		return (
			<div className="bg-white p-6 rounded-lg shadow-sm">
				<h2 className="text-xl font-semibold text-gray-800 mb-4">
					{formatKey(key)}
				</h2>
				{renderValue(value)}
			</div>
		);
	};

	const renderContent = (data: any) => {
		if (!data) return null;

		return (
			<div className="space-y-8">
				{/* Business Profile Section */}
				{data.business_profile && renderBusinessProfile(data.business_profile)}

				{/* Other Sections */}
				{Object.entries(data).map(([key, value]) => {
					if (
						key !== "business_profile" &&
						value &&
						typeof value === "object" &&
						Object.keys(value as object).length > 0
					) {
						return renderGeneralSection(key, value);
					}
					return null;
				})}
			</div>
		);
	};

	return <div className="max-w-none">{renderContent(data)}</div>;
}

export function BusinessOverview() {
	const { userConfig, isLoading } = useUserConfig();
	const [parsedContent, setParsedContent] = useState<any>(null);

	useEffect(() => {
		if (userConfig?.business_overview) {
			try {
				// If it's a string, parse it. If it's already an object, use it directly
				const parsed =
					typeof userConfig.business_overview === "string"
						? JSON.parse(userConfig.business_overview)
						: userConfig.business_overview;
				setParsedContent(parsed);
			} catch (e) {
				console.error("Failed to parse business overview:", e);
				setParsedContent(null);
			}
		}
	}, [userConfig]);

	return (
		<div className="h-full flex flex-col bg-white">
			{/* Content */}
			<div className="flex-1 overflow-auto p-6">
				<div className="prose max-w-none">
					{isLoading ? (
						<div className="bg-gray-50 p-6 rounded-lg">
							Loading Business Overview...
						</div>
					) : parsedContent ? (
						<div className="bg-gray-50 p-6 rounded-lg">
							<JsonToMarkdown data={parsedContent} />
						</div>
					) : (
						<div className="bg-gray-50 p-6 rounded-lg">
							No business overview data available.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
