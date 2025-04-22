import React from "react";

interface DataSourceItemProps {
    icon?: string;
    isImage?: boolean;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

export const DataSourceItem: React.FC<DataSourceItemProps> = ({
    icon,
    isImage = false,
    label,
    isActive = false,
    onClick,
}) => {
    const baseClasses =
        "flex gap-3.5 px-6 py-5 whitespace-nowrap rounded-xl border border-solid max-md:px-5 cursor-pointer";
    const activeClasses = isActive
        ? "bg-stone-300 border-white"
        : "bg-white border text-neutral-900";

    return (
        <article 
            className={`${baseClasses} ${activeClasses}`}
            onClick={onClick}
        >
            {isImage ? (
                <div className="flex shrink-0 bg-white border border-solid h-[30px] w-[30px]" />
            ) : icon ? (
                <img
                    src={icon}
                    alt=""
                    className="object-contain shrink-0 self-start aspect-square stroke-[2px] stroke-stone-300 w-[18px]"
                />
            ) : (
                <div className="flex shrink-0 bg-zinc-300 h-[30px] w-[30px]" />
            )}
            <p
                className={`grow shrink ${isActive ? "my-auto w-[143px]" : "self-start w-36"}`}
            >
                {label}
            </p>
        </article>
    );
}; 