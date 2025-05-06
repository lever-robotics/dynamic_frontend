import { type Connection, Connections } from "@/types/connectors";
import type * as React from "react";
import { useState } from "react";
import { BackArrow } from "../common/BackArrow";
import { Modal } from "../common/Modal";
import { ConnectionCard } from "./ConnectionCard";
import { ConnectionDetail } from "./ConnectionDetail";

interface ConnectionStoreProps {
	onClose: () => void;
	onBack: () => void;
}

export const ConnectionStore: React.FC<ConnectionStoreProps> = ({
	onClose,
	onBack,
}) => {
	const [isHovering, setIsHovering] = useState<string | null>(null);
	const [selectedConnection, setSelectedConnection] =
		useState<Connection | null>(null);

	const availableConnections = Connections.filter((conn) => conn.isAvailable);
	const futureConnections = Connections.filter((conn) => !conn.isAvailable);

	return (
		<Modal isOpen={true} onClose={onClose} size="xl" showCloseButton={false}>
			<div className="flex flex-col h-full">
				<div className="flex items-center p-4 border-b">
					<BackArrow onClick={onBack} />
					<h2 className="text-xl font-semibold ml-4">Connection Store</h2>
				</div>

				<div className="flex-1 overflow-y-auto p-6">
					<div className="max-w-4xl mx-auto">
						<div className="flex flex-col gap-6">
							<section className="flex flex-col gap-4">
								<h3 className="text-sm font-medium text-zinc-800">
									Available Connections
								</h3>
								<div className="grid grid-cols-2 gap-4">
									{availableConnections.map((connection) => (
										<ConnectionCard
											key={connection.type}
											connection={connection}
											isHovering={isHovering}
											setIsHovering={setIsHovering}
											onClick={() => setSelectedConnection(connection)}
										/>
									))}
								</div>
							</section>

							{futureConnections.length > 0 && (
								<section className="flex flex-col gap-4">
									<h3 className="text-sm font-medium text-zinc-800">
										Coming Soon
									</h3>
									<div className="grid grid-cols-2 gap-4">
										{futureConnections.map((connection) => (
											<ConnectionCard
												key={connection.type}
												connection={connection}
												isHovering={isHovering}
												setIsHovering={setIsHovering}
												onClick={() => setSelectedConnection(connection)}
											/>
										))}
									</div>
								</section>
							)}
						</div>
					</div>
				</div>
			</div>
			{selectedConnection && (
				<ConnectionDetail
					connection={selectedConnection}
					onClose={onClose}
					onBack={() => setSelectedConnection(null)}
				/>
			)}
		</Modal>
	);
};
