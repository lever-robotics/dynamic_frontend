"use client";
import * as React from "react";

interface LogoUploadProps {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  isHovering: string | null;
  setIsHovering: (value: string | null) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  logoUrl,
  setLogoUrl,
  isHovering,
  setIsHovering,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-800">Business Logo</label>
      <div className="flex gap-4 items-center">
        <div className="flex justify-center items-center w-20 h-20 bg-gray-100 rounded-lg">
          <img
            className="object-contain max-w-full max-h-full"
            src={logoUrl || "https://placehold.co/80x80/F3F4F6/94A3B8/svg"}
            alt="Business logo preview"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          id="logoUpload"
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.[0]) {
              setLogoUrl(URL.createObjectURL(event.target.files[0]));
            }
          }}
        />
        <label
          htmlFor="logoUpload"
          className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer"
          onMouseEnter={() => setIsHovering("upload")}
          onMouseLeave={() => setIsHovering(null)}
          style={{
            background: isHovering === "upload" ? "rgb(1, 40, 50)" : "rgb(2, 159, 202)",
          }}
        >
          Upload Logo
        </label>
      </div>
    </div>
  );
};
