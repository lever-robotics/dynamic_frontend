import * as React from "react";
import type { Integration } from "./BusinessSetup";

interface IntegrationCardProps {
  integration: Integration;
  isHovering: string | null;
  setIsHovering: (value: string | null) => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  isHovering,
  setIsHovering,
}) => {
  return (
    <article
      className="flex gap-4 items-center p-4 rounded-xl border cursor-pointer"
      onMouseEnter={() => setIsHovering(integration.name)}
      onMouseLeave={() => setIsHovering(null)}
      style={{
        background: isHovering === integration.name ? "#F8F9FA" : "white",
      }}
    >
      <img
        className="w-10 h-10"
        src={integration.icon}
        alt={`${integration.name} icon`}
      />
      <div className="flex flex-col">
        <h3 className="text-base font-medium text-neutral-900">
          {integration.name}
        </h3>
        <p className="text-sm text-stone-500">{integration.description}</p>
      </div>
    </article>
  );
};
