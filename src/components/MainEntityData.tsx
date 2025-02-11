import React, { ReactNode, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface MainEntityDataProps {
    data: any;
    typename: string;
}

const Contact = ({ phone, email, address }: { phone: string; email: string; address: string }) => {
    const footer = (
        <div>
            <p className="font-light text-lg">{phone}</p>
            <p className="font-light text-lg">{email}</p>
            <p className="font-light text-lg">{address}</p>
        </div>
    );

    return <InfoCard title="Contact" footer={footer} className="max-w-full flex-1 h-56 bg-portage-300 text-portage-950 border border-portage-400" />;
};

const Extra = ({ prp_link, waiver_link }: { prp_link: string; waiver_link: string }) => {
    const footer = (
        <div className="flex flex-col gap-2">
            <a
                href={prp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-light text-lg text-blue-600 hover:text-blue-800 underline"
            >
                PRP Record
            </a>
            <a
                href={waiver_link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-light text-lg text-blue-600 hover:text-blue-800 underline"
            >
                Waiver Record
            </a>
        </div>
    );

    return (
        <InfoCard
            title="Documents"
            footer={footer}
            className="max-w-full flex-1 h-56 bg-anakiwa-200 text-anakiwa-950 border border-anakiwa-300"
        />
    );
};

const Name = ({ name, notes, gender }: { name: string; notes: string; gender: string }) => {
    const footer = (
        <div>
            <p className="font-light text-lg">{gender}</p>
        </div>
    );

    return (
        <InfoCard title={name} footer={footer} titleClass="text-3xl" className="max-w-full flex-1 h-56 bg-anakiwa-200 text-anakiwa-950 border border-anakiwa-300">
            <p className="font-light text-lg">{notes}</p>
        </InfoCard>
    );
};

const Age = ({ age, birthdate }: { age: string; birthdate: string }) => {
    const footer = (
        <div>
            <p className="font-light text-2xl">{age}</p>
            {/* <p className="">{birthdate}</p> */}
        </div>
    );

    return <InfoCard title="Age" footer={footer} className="w-40 h-56 bg-portage-300 text-portage-950 border border-portage-400" />;
};

const Allergies = ({ allergies }: { allergies: string }) => {
    return (
        <InfoCard
            title="Allergies"
            className="w-40 h-56 bg-amber-200 text-amber-950 border border-amber-300"
        >
            <p className="font-light text-lg">{allergies}</p>
        </InfoCard>
    );
};


interface InfoCardProps {
    title: string;
    children?: ReactNode;
    footer?: ReactNode;
    className?: string;
    titleClass?: string;
}

const InfoCard = ({ title, children, footer, className = "", titleClass }: InfoCardProps) => {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className={`font-medium text-xl ${titleClass}`}>{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
            <CardFooter>{footer}</CardFooter>
        </Card>
    );
};

const MainEntityData: React.FC<MainEntityDataProps> = ({ data, typename }) => {
    const [showDebug, setShowDebug] = useState(false);

    // Filter out collections and internal fields
    const mainData = Object.entries(data).filter(
        ([key, value]) => !key.endsWith("Collection") && !key.startsWith("__") && value !== null
    );



    const renderIndividualLayout = () => (
        <div className="grid gap-3">
            <div className="flex w-full flex-row gap-4">
                <Name
                    name={`${mainData[1]?.[1]} ${mainData[2]?.[1]}`}
                    notes={`${mainData[9]?.[1] || ''}`}
                    gender={`${mainData[8]?.[1] || ''}`}
                />
                <Age
                    age={`${mainData[4]?.[1] || ''}`}
                    birthdate={`${mainData[6]?.[1] || ''}`}
                />
            </div>
            <div className="flex w-full flex-row gap-4">
                <Contact
                    phone={`${mainData[3]?.[1] || ''}`}
                    email={`${mainData[5]?.[1] || ''}`}
                    address={`${mainData[7]?.[1] || ''}`}
                />
                <Extra
                    prp_link={`${mainData.find(([key]) => key === 'prp_record')?.[1] || ''}`}
                    waiver_link={`${mainData.find(([key]) => key === 'waiver_record')?.[1] || ''}`}
                />
                <Allergies
                    allergies={`${mainData.find(([key]) => key === 'allergies')?.[1] || 'None'}`}
                />

            </div>
        </div>
    );

    const renderDefaultLayout = () => (
        <div className="grid gap-3">
            {mainData.map(([key, value]) => (
                <div
                    key={key}
                    className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-0"
                >
                    <span className="text-gray-600 font-medium">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="col-span-2 text-gray-800">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                </div>
            ))}
        </div>
    );


    return (
        <div className="bg-white border-anakiwa-950/10 border rounded-xl shadow p-6">
            {/* Header with Debug Toggle */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">{typename}</h2>
                <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                    {showDebug ? "Hide" : "Show"} Debug
                </button>
            </div>

            {/* Formatted Data Display */}
            {!showDebug && (
                typename.toLowerCase() === "individual" ? renderIndividualLayout() : renderDefaultLayout()
            )}

            {/* Debug View */}
            {showDebug && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default MainEntityData;