"use client";
import * as React from "react";
import { X } from "lucide-react";
import type { Integration } from "./BusinessSetup";

interface IntegrationModalProps {
    integration: Integration;
    onClose: () => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
    integration,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 flex justify-center items-center w-screen h-screen bg-black bg-opacity-50 z-[60]">
            <div className="relative p-8 bg-white rounded-3xl max-w-[500px] shadow-[0_4px_24px_rgba(0,0,0,0.1)] w-[90%]">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <img
                            src={integration.icon}
                            alt={`${integration.name} icon`}
                            className="w-12 h-12"
                        />
                        <h2 className="text-2xl font-semibold text-neutral-900">
                            {integration.name}
                        </h2>
                    </div>
                    <p className="text-neutral-600">{integration.description}</p>
                    {!integration.isAvailable ? (
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-red-600 font-medium">
                                This integration is coming soon!
                            </p>
                            <p className="text-sm text-red-500 mt-1">
                                We're working hard to bring you this integration. Stay tuned for updates.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-medium text-blue-900">How it works</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Connect your {integration.name} account to sync your data automatically.
                                </p>
                            </div>
                            <button
                                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => {
                                    // Handle integration connection
                                    console.log(`Connecting to ${integration.name}`);
                                }}
                            >
                                Connect {integration.name}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 