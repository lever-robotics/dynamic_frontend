"use client";
import type * as React from "react";
import { Modal } from "../common/Modal";
import { useState } from "react";
import type { BusinessInfo } from "./Onboarding";
// import { LogoUpload } from "./LogoUpload";

interface BusinessInfoSectionProps {
  businessName: string;
  setBusinessName: (name: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  isHovering: string | null;
  setIsHovering: (value: string | null) => void;
  onClose: () => void;
}

interface BusinessInfoProps {
    onClose: () => void;
    setBusinessInfo: (info: BusinessInfo) => void;
}

export const BusinessInfoSection: React.FC<BusinessInfoProps> = ({
  onClose,
  setBusinessInfo,
}) => {

    const [businessName, setBusinessName] = useState("");
    const [businessUrl, setBusinessUrl] = useState("");

  return (
    <Modal isOpen={true} onClose={onClose}>
        <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
            <label
            htmlFor="businessName"
            className="text-sm font-medium text-zinc-800"
            >
            Business Name
            </label>
            <input
            type="text"
            id="businessName"
            placeholder="Enter your business name"
            className="px-4 py-3 w-full text-base rounded-lg border"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            />
        </div>
        <div className="flex flex-col gap-2">
            <label
            htmlFor="businessUrl"
            className="text-sm font-medium text-zinc-800"
            >
            Business URL
            </label>
            <input
            type="text"
            id="businessUrl"
            placeholder="Enter your business URL"
            className="px-4 py-3 w-full text-base rounded-lg border"
            value={businessUrl}
            onChange={(event) => setBusinessUrl(event.target.value)}
            />
        </div>
        <button
            type="button"
            className="px-4 py-3 w-full text-base rounded-lg border"
            onClick={() => {
                setBusinessInfo({ name: businessName, url: businessUrl });
                onClose();
            }}
        >
            Continue
        </button>
        {/* <LogoUpload
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            isHovering={isHovering}
            setIsHovering={setIsHovering}
        /> */}
        </div>
    </Modal>
  );
};
