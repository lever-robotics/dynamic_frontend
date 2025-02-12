import React, { useState } from 'react';
import { Database } from 'lucide-react';

interface OdooLoginFormProps {
  onSubmit?: (credentials: {
    odooUrl: string;
    database: string;
    username: string;
    apiKey: string;
  }) => void;
}

const OdooLoginForm: React.FC<OdooLoginFormProps> = ({ onSubmit }) => {
  const [odooUrl, setOdooUrl] = useState('');
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVisible(false);
    if (onSubmit) {
      onSubmit({
        odooUrl,
        database,
        username,
        apiKey
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white rounded-xl shadow-lg m-8">
      <div className="flex items-center justify-center mb-8">
        <Database className="h-8 w-8 text-[var(--primary-color)]" />
        <span className="ml-2 text-lg text-[var(--primary-color)]">Odoo Connection</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="w-full">
          <div className="flex justify-between mb-2">
            <label htmlFor="odooUrl" className="block text-sm font-medium text-gray-700">
              Odoo URL
            </label>
          </div>
          <input
            type="url"
            id="odooUrl"
            value={odooUrl}
            onChange={(e) => setOdooUrl(e.target.value)}
            placeholder="https://mycompany.odoo.com"
            className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)]"

          />
        </div>

        <div className="w-full">
          <div className="flex justify-between mb-2">
            <label htmlFor="database" className="block text-sm font-medium text-gray-700">
              Database Name
            </label>
          </div>
          <input
            type="text"
            id="database"
            value={database}
            onChange={(e) => setDatabase(e.target.value)}
            placeholder="mycompany_prod"
            className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)]"
            
          />
        </div>

        <div className="w-full">
          <div className="flex justify-between mb-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
          </div>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin@mycompany.com"
            className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)]"
            
          />
        </div>

        <div className="w-full">
          <div className="flex justify-between mb-2">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              Password/API Key
            </label>
          </div>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter password or API key"
            className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-[var(--primary-color)] focus:outline-none focus:ring-[var(--primary-color)]"
            
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--primary-color)] text-white py-3 px-4 rounded-md hover:bg-[var(--primary-color-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 mt-6"
        >
          Connect
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between text-sm text-gray-500">
        <button className="hover:text-gray-700">Test Connection</button>
      </div>
    </div>
  );
};

export default OdooLoginForm;