import React from 'react';

interface ToolState {
    tool: string;
    status: 'starting' | 'in-progress' | 'completed' | 'error';
    progress?: number;
    parameters?: any;
    result?: any;
}

interface ToolStateDisplayProps {
    toolStates: ToolState[];
}

const getStatusColor = (status: ToolState['status']) => {
    switch (status) {
        case 'starting':
            return 'text-blue-600 bg-blue-50';
        case 'in-progress':
            return 'text-yellow-600 bg-yellow-50';
        case 'completed':
            return 'text-green-600 bg-green-50';
        case 'error':
            return 'text-red-600 bg-red-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};

export const ToolStateDisplay: React.FC<ToolStateDisplayProps> = ({ toolStates }) => {
    if (toolStates.length === 0) return null;

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Tool Execution Status</h3>
            <div className="space-y-2">
                {toolStates.map((state, index) => (
                    <div
                        key={`${state.tool}-${index}`}
                        className="rounded-lg border p-3 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="font-medium">{state.tool}</div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(state.status)}`}>
                                {state.status}
                            </div>
                        </div>

                        {state.progress !== undefined && (
                            <div className="mt-2">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${state.progress}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {state.progress}% complete
                                </div>
                            </div>
                        )}

                        {state.parameters && (
                            <div className="mt-2 text-sm">
                                <div className="text-gray-500">Parameters:</div>
                                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(state.parameters, null, 2)}
                                </pre>
                            </div>
                        )}

                        {state.result && (
                            <div className="mt-2 text-sm">
                                <div className="text-gray-500">Result:</div>
                                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(state.result, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ToolStateDisplay; 