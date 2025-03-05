import * as React from "react";
import { IntegrationCard } from "./IntegrationCard";
import type { Integration } from "./BusinessSetup";

interface IntegrationsSectionProps {
  integrations: Integration[];
  isHovering: string | null;
  setIsHovering: (value: string | null) => void;
}

export const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({
  integrations,
  isHovering,
  setIsHovering,
}) => {
  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">
        Connections
      </h2>
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.name}
            integration={integration}
            isHovering={isHovering}
            setIsHovering={setIsHovering}
          />
        ))}
      </div>
    </section>
  );
};
