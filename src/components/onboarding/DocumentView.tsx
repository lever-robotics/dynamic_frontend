import { useState, useEffect } from "react";
import { JsonView } from "./JsonViewer";

interface DocumentViewProps {
    content: string;
    onUpdate?: (content: string) => void;
    isEditable?: boolean;
}

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
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {businessProfile.long_description}
                            </p>
                        </div>
                    )}

                    {/* Mission & Vision */}
                    {(businessProfile.mission_statement || businessProfile.vision_statement) && (
                        <div className="grid grid-cols-2 gap-6">
                            {businessProfile.mission_statement && (
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Mission</h2>
                                    <p className="text-gray-700 italic">
                                        {businessProfile.mission_statement}
                                    </p>
                                </div>
                            )}
                            {businessProfile.vision_statement && (
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Vision</h2>
                                    <p className="text-gray-700 italic">
                                        {businessProfile.vision_statement}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Objectives */}
                    {businessProfile.objectives && businessProfile.objectives.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Potential Objectives</h2>
                            <ul className="space-y-2">
                                {businessProfile.objectives.map((objective: string, index: number) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-accent-500 mr-2">•</span>
                                        <span className="text-gray-700">{objective}</span>
                                    </li>
                                ))}
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
                        <div key={index} className="border-l-4 border-accent-200 pl-4">
                            {typeof item === 'object' ? (
                                Object.entries(item).map(([key, val]) => (
                                    val && (
                                        <div key={key} className="mb-2">
                                            <h3 className="font-medium text-gray-800">
                                                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </h3>
                                            <p className="text-gray-700">{val as string}</p>
                                        </div>
                                    )
                                ))
                            ) : (
                                item && <p className="text-gray-700">{item}</p>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof value === 'object' && value !== null) {
            const entries = Object.entries(value).filter(([_, val]) => val !== null && val !== undefined);
            if (entries.length > 0) {
                return (
                    <div className="space-y-4">
                        {entries.map(([key, val]) => (
                            <div key={key} className="border-l-4 border-accent-200 pl-4">
                                <h3 className="font-medium text-gray-800">
                                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </h3>
                                {typeof val === 'object' && val !== null ? renderValue(val) : <p className="text-gray-700">{val as string}</p>}
                            </div>
                        ))}
                    </div>
                );
            }
        }

        return value ? <p className="text-gray-700">{value}</p> : null;
    };

    const renderGeneralSection = (key: string, value: any) => {
        if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
            return null;
        }

        const formatKey = (key: string) => {
            return key.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{formatKey(key)}</h2>
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
                    if (key !== 'business_profile' && value && typeof value === 'object' && Object.keys(value as object).length > 0) {
                        return renderGeneralSection(key, value);
                    }
                    return null;
                })}
            </div>
        );
    };

    return (
        <div className="max-w-none">
            {renderContent(data)}
        </div>
    );
}

export function DocumentView({
    content,
    onUpdate,
    isEditable = false
}: DocumentViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableContent, setEditableContent] = useState(content);
    const [parsedContent, setParsedContent] = useState<any>(null);

    useEffect(() => {
        setEditableContent(content);
        try {
            setParsedContent(JSON.parse(content));
        } catch (e) {
            setParsedContent(null);
        }
    }, [content]);

    const handleSave = () => {
        setIsEditing(false);
        onUpdate?.(editableContent);
    };

    const formatJson = (json: string) => {
        try {
            return JSON.stringify(JSON.parse(json), null, 2);
        } catch (e) {
            return json;
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Business Overview</h2>
                {isEditable && (
                    <button
                        type="button"
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="px-4 py-2 rounded-md text-sm font-medium
                            bg-accent-100 text-accent-700 hover:bg-accent-200
                            transition-colors duration-200"
                    >
                        {isEditing ? "Save" : "Edit"}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {isEditing ? (
                    <div className="h-full">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <JsonView data={parsedContent} />
                        </div>
                        <textarea
                            value={formatJson(editableContent)}
                            onChange={(e) => setEditableContent(e.target.value)}
                            className="w-full h-full min-h-[500px] p-4 border rounded-lg mt-4
                                font-mono text-sm focus:outline-none focus:ring-2 
                                focus:ring-accent-500 bg-gray-50"
                            placeholder="Enter JSON content..."
                        />
                    </div>
                ) : (
                    <div className="prose max-w-none">
                        {parsedContent ? (
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <JsonToMarkdown data={parsedContent} />
                            </div>
                        ) : (
                            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                                Invalid JSON content
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 