// src/components/MainEntityData.tsx
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


const dataToUi = (data: [string, unknown][]) => {

    type dict = {
        [key: string]: dict;
    }
    const ui: dict = {};

    // biome-ignore lint/complexity/noForEach: <explanation>
    data.forEach(([key,value]) => {
        switch(key){
            case "first_name":{
                ui.name[key] = value;
               break; 
            }
            case "last_name":{
                ui.name[key] = value
                break;
            }
            case "phone_number":{
                ui.contact[key] = value
                break;
            }
            case "age":{
                ui.age[key] = value;
                break;
            }
            case "email":{
                ui.contact[key] = value;
                break;
            }
            case "birth_day":{
                ui.age[key] = value;
                break;
            }
            case "address":{
                ui.contact[key] = value;
                break;
            }
            case "gender":{
                ui.name[key] = value;
                break;
            }
            case "notes":{
                ui.name[key] = value;
                break;
            }
        }
    });
    return ui;
}

const MainEntityData: React.FC<MainEntityDataProps> = ({ data, typename }) => {
	const [showDebug, setShowDebug] = useState(false);

	// Filter out collections and internal fields
	const mainData = Object.entries(data).filter(
		([key, value]) =>
			!key.endsWith("Collection") && !key.startsWith("__") && value !== null,
	);
    console.log(mainData);
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
				<div className="grid gap-3">
					{/* {mainData.map(([key, value]) => (
						<div
							key={key}
							className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-0"
						>
							<span className="text-gray-600 font-medium">
								{key.replace(/([A-Z])/g, " $1").trim()}
							</span>
							<span className="col-span-2 text-gray-800">
								{typeof value === "object"
									? JSON.stringify(value)
									: String(value)}
							</span>
						</div>
					))} */}
                    <div className="flex w-full flex-row gap-4">
                        <Name name={`${mainData[1][1]} ${mainData[2][1]}`} notes={`${mainData[9][1]}`} gender={`${mainData[8][1]}`}/>
                        <Age age={`${mainData[4][1]}`} birthdate={`${mainData[6][1]}`}/>
                    </div>
                    <div className="flex w-full flex-row gap-4">
                        <Contact phone={`${mainData[3][1]}`} email={`${mainData[5][1]}`} address={`${mainData[7][1]}`}/>
                        <Extra />
                    </div>
				</div>
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

const Contact = ({ phone, email, address }:{phone:string, email:string, address:string}) => {
	const footer = (
		<div>
			<p className="font-light text-lg">{phone}</p>
			<p className="font-light text-lg">{email}</p>
			<p className="font-light text-lg">{address}</p>
		</div>
	);

	return <InfoCard title="Contact" footer={footer} className="max-w-full flex-1 h-56 bg-portage-300 text-portage-950 border border-portage-400"/>
};
const Extra = () => {
	const footer = (
		<div>
			<p className="font-light text-lg">PRP</p>
			<p className="font-light text-lg">Waiver</p>
		</div>
	);

	return <InfoCard title="Extra" footer={footer} className="max-w-full flex-1 h-56 bg-anakiwa-200 text-anakiwa-950 border border-anakiwa-300"/>
};
const Name = ({ name, notes, gender }:{name:string, notes:string, gender:string}) => {
	const footer = (
		<div>
			<p className="font-light text-lg">{gender}</p>
		</div>
	);

	return <InfoCard title={name} footer={footer} titleClass="text-3xl" className="max-w-full flex-1 h-56 bg-anakiwa-200 text-anakiwa-950 border border-anakiwa-300">
        <p className="font-light text-lg">{notes}</p>
    </InfoCard>
};
const Age = ({ age, birthdate }: {age:string, birthdate:string}) => {
	const footer = (
		<div>
			<p className="font-light text-2xl">{age}</p>
			<p className="">{birthdate}</p>
		</div>
	);

	return <InfoCard title="Age" footer={footer} className="w-40 h-56 bg-portage-300 text-portage-950 border border-portage-400"/>
};

interface InfoCardProps {
	title: string;
	children?: ReactNode;
	footer?: ReactNode;
	className?: string;
    titleClass?: string;
}
const InfoCard = ({
	title,
	children,
	footer,
	className = "",
    titleClass,
}: InfoCardProps) => {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className={`font-medium text-xl ${titleClass}`}>{title}</CardTitle>
				{/* <CardDescription>Card Description</CardDescription> */}
			</CardHeader>
			<CardContent>{children}</CardContent>
			<CardFooter>{footer}</CardFooter>
		</Card>
	);
};
