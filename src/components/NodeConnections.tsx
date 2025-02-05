// src/components/NodeConnections.tsx
import { useNodeConnections } from '../hooks/useNodeConnections';
import NodeDataDisplay from './NodeDataDisplay';


interface NodeConnectionsProps {
    nodeId: string;
    typeName: string;
}

export function NodeConnections({ nodeId, typeName }: NodeConnectionsProps) {
    const { data, loading, error } = useNodeConnections(nodeId, typeName);

    if (loading) return <div>Loading connections...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data) return <div>No data found</div>;

    return <NodeDataDisplay nodeData={data} />;
}