"use client";
import * as React from "react";
import { useState } from "react";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { IntegrationsSection } from "./IntegrationsSection";

export interface Integration {
  name: string;
  icon: string;
  description: string;
}

const BusinessSetup = () => {
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      name: "Google Sheets",
      icon: "https://placehold.co/40x40/4318D1/FFFFFF/svg",
      description: "Connect your spreadsheets",
    },
    {
      name: "Odoo",
      icon: "https://placehold.co/40x40/4318D1/FFFFFF/svg",
      description: "ERP integration",
    },
    {
      name: "Shopify",
      icon: "https://placehold.co/40x40/4318D1/FFFFFF/svg",
      description: "E-commerce platform",
    },
    {
      name: "QuickBooks",
      icon: "https://placehold.co/40x40/4318D1/FFFFFF/svg",
      description: "Accounting software",
    },
  ];

  return (
    <main className="flex justify-center items-center w-screen h-screen bg-black bg-opacity-50">
      <section className="p-8 bg-white rounded-3xl max-w-[600px] shadow-[0_4px_24px_rgba(0,0,0,0.1)] w-[90%]">
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
          />
        </div>
      </section>
    </main>
  );
};

export default BusinessSetup;
