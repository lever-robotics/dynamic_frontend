import React from "react";

interface TextareaFieldProps {
    label?: string;
    value: string;
    className?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
    label,
    value,
    className = "",
}) => (
    <>
        {label && <label className="self-start mt-3.5 text-sm">{label}</label>}
        <div
            className={`overflow-hidden flex-1 shrink px-3.5 py-2 mt-4 leading-none bg-white rounded-md basis-0 min-h-[35px] ${className}`}
        >
            {value}
        </div>
    </>
); 