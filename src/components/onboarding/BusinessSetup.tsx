"use client";
import * as React from "react";
import { useState } from "react";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { X } from "lucide-react";
import gsIcon from "@/assets/gs.png";
import odooIcon from "@/assets/odoo.png";
import shopifyIcon from "@/assets/shopify.png";
import quickBooksIcon from "@/assets/quick_books.png";
import defaultLogo from "@/assets/default_business_logo.png";
import { IntegrationModal } from "./IntegrationModal";

export interface Integration {
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  isConnected?: boolean;
}

interface BusinessSetupProps {
  onClose?: () => void;
}

interface IntegrationsSectionProps {
  integrations: Integration[];
  isHovering: string | null;
  setIsHovering: (value: string | null) => void;
  onConnect: (integration: Integration) => void;
}

interface IntegrationCardProps {
  integration: Integration;
  isHovering: string | null;
  setIsHovering: (value: string | null) => void;
  onClick: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  isHovering,
  setIsHovering,
  onClick,
}) => {
  return (
    <article
      className={`flex gap-4 items-center p-4 rounded-xl border cursor-pointer transition-all ${!integration.isAvailable ? 'opacity-50 cursor-not-allowed' : ''
        } ${integration.isConnected ? 'border-primary-500 bg-primary-50' : ''
        }`}
      onMouseEnter={() => integration.isAvailable && setIsHovering(integration.name)}
      onMouseLeave={() => setIsHovering(null)}
      onClick={() => integration.isAvailable && onClick()}
      style={{
        background: isHovering === integration.name ? "rgb(var(--primary-200))" : integration.isConnected ? "rgb(var(--primary-300))" : "white",
      }}
    >
      <img
        className={`w-10 h-10 ${!integration.isAvailable ? 'grayscale' : ''}`}
        src={integration.icon}
        alt={`${integration.name} icon`}
      />
      <div className="flex flex-col">
        <h3 className="text-base font-medium text-neutral-900">
          {integration.name}
        </h3>
        <p className="text-sm text-stone-500">{integration.description}</p>
        {integration.isConnected && (
          <p className="text-xs text-primary-600 mt-1">Connected</p>
        )}
      </div>
    </article>
  );
};

const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({
  integrations,
  isHovering,
  setIsHovering,
  onConnect,
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const handleIntegrationClick = (integration: Integration) => {
    setSelectedIntegration(integration);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-800">Integrations</label>
        <div className="grid grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.name}
              integration={integration}
              isHovering={isHovering}
              setIsHovering={setIsHovering}
              onClick={() => handleIntegrationClick(integration)}
            />
          ))}
        </div>
      </div>
      {selectedIntegration && (
        <IntegrationModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onConnect={onConnect}
        />
      )}
    </section>
  );
};

const BusinessSetup: React.FC<BusinessSetupProps> = ({ onClose }) => {
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      name: "Google Sheets",
      icon: gsIcon,
      description: "Connect your spreadsheets",
      isAvailable: true,
    },
    {
      name: "Odoo",
      icon: odooIcon,
      description: "ERP integration",
      isAvailable: true,
    },
    {
      name: "Shopify",
      icon: shopifyIcon,
      description: "E-commerce platform",
      isAvailable: false,
    },
    {
      name: "QuickBooks",
      icon: quickBooksIcon,
      description: "Accounting software",
      isAvailable: false,
    },
  ]);

  const handleConnect = (integration: Integration) => {
    setIntegrations(prev =>
      prev.map(integ =>
        integ.name === integration.name
          ? { ...integ, isConnected: true }
          : integ
      )
    );
  };

  return (
    <main className="fixed inset-0 flex justify-center items-center w-screen h-screen bg-black bg-opacity-50 z-50">
      <section className="relative p-8 bg-white rounded-3xl max-w-[600px] shadow-[0_4px_24px_rgba(0,0,0,0.1)] w-[90%]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Set up your business
          </h1>
          <BusinessInfoSection
            businessName={businessName}
            setBusinessName={setBusinessName}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            isHovering={isHovering}
            setIsHovering={setIsHovering}
          />
          <IntegrationsSection
            integrations={integrations}
            isHovering={isHovering}
            setIsHovering={setIsHovering}
            onConnect={handleConnect}
          />
        </div>
      </section>
    </main>
  );
};

export default BusinessSetup;
