"use client";
import { useEffect, useState, Fragment } from "react";
import { Modal } from "../common/Modal";

interface AnalyzingBusinessProps {
    onComplete: () => void;
    businessInfo: {
        name: string;
        url: string;
    };
}

interface ProgressBarProps {
    progress: number;
    width: number;
    className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    width,
    className = "",
}) => {
    return (
        <div
            className={`relative h-4 bg-slate-100 rounded-[40px] ${className}`}
            style={{ width }}
        >
            <div
                className="absolute top-0 left-0 h-4 bg-primary-400 rounded-[40px] transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </div>
    );
};

interface StatusTextProps {
    messages: string[];
}

const StatusText: React.FC<StatusTextProps> = ({ messages }) => {
    return (
        <p className="text-xs leading-4 text-center text-slate-600 text-opacity-60">
            {messages.map((message) => (
                <Fragment key={message}>
                    {message}
                    <br />
                </Fragment>
            ))}
        </p>
    );
};

export function AnalyzingBusiness({ onComplete }: AnalyzingBusinessProps) {
    const [progress, setProgress] = useState(0);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    const messages = [
        "Reading website content",
        "Analyzing business structure",
        "Processing integrations",
        "Generating recommendations",
        "Finalizing analysis"
    ];

    useEffect(() => {
        const progressTimer = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(progressTimer);
                    setTimeout(() => onComplete(), 500);
                    return 100;
                }
                return prevProgress + 20;
            });
        }, 100);

        const messageTimer = setInterval(() => {
            setCurrentMessageIndex((prev) => {
                if (prev >= messages.length - 1) {
                    clearInterval(messageTimer);
                    return prev;
                }
                return prev + 1;
            });
        }, 2000);

        return () => {
            clearInterval(progressTimer);
            clearInterval(messageTimer);
        };
    }, [onComplete]);

    return (
        <Modal isOpen={true} size="xl" showCloseButton={false} preventBackgroundClick={true}>
            <div className="flex justify-center items-center w-full h-[90vh]">
                <section className="flex flex-col justify-center items-center h-[738px] w-[1400px]">
                    <h1 className="mb-24 text-5xl leading-5">
                        <span className="text-black">Analyzing</span>
                        <span className="text-primary-400"> Website</span>
                    </h1>

                    <ProgressBar progress={progress} width={414} className="mb-20" />

                    <StatusText
                        messages={messages.slice(0, currentMessageIndex + 1)}
                    />
                </section>
            </div>
        </Modal>
    );
} 