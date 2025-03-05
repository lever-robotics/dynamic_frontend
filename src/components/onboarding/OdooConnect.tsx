"use client";
import * as React from "react";

interface OdooConnectProps {
    onSubmit: (data: OdooFormData) => Promise<void>;
}

export interface OdooFormData {
    url: string;
    database: string;
    username: string;
    password: string;
}

export const OdooConnect: React.FC<OdooConnectProps> = ({ onSubmit }) => {
    const [formData, setFormData] = React.useState<OdooFormData>({
        url: "",
        database: "",
        username: "",
        password: "",
    });
    const [isLoading, setIsLoading] = React.useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    Odoo URL
                </label>
                <input
                    type="url"
                    id="url"
                    name="url"
                    placeholder="https://mycompany.odoo.com"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="database" className="block text-sm font-medium text-gray-700">
                    Database Name
                </label>
                <input
                    type="text"
                    id="database"
                    name="database"
                    placeholder="mycompany_prod"
                    value={formData.database}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                </label>
                <input
                    type="email"
                    id="username"
                    name="username"
                    placeholder="admin@mycompany.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password/API Key
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoading}
                />
            </div>
            <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                    </>
                ) : (
                    "Connect Odoo"
                )}
            </button>
        </form>
    );
}; 