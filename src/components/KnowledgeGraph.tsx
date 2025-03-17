import type React from "react";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import ReactFlow from 'reactflow';
import {
    Controls,
    Background,
    NodeProps,
    Handle,
    Position,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import "reactflow/dist/style.css";
import { QueryBuilder } from "../utils/QueryBuilder";
import type { Blueprint, Entity, Field } from "@/types/blueprint";

interface EntityData {
    nodeId: string;
    [key: string]: any;
}

interface TableQueryResult {
    tableName: string;
    data: EntityData[] | null;
    loading: boolean;
    error?: Error;
}

interface TableQuery {
    tableName: string;
    query: any;
}

// Custom node component for displaying entity data
const EntityNode = ({ data }: NodeProps) => {
    return (
        <div
            className="px-4 py-2 shadow-lg rounded-lg bg-white border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors"
            onClick={() => data.onClick(data.id)}
        >
            <Handle type="target" position={Position.Top} />
            <div className="font-bold text-lg text-primary">{data.label}</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

// Expanded node component for showing detailed data
const ExpandedNode = ({ data }: NodeProps) => {
    return (
        <div
            className="px-6 py-4 shadow-xl rounded-lg bg-white border-2 border-primary cursor-pointer hover:border-primary/80 transition-colors min-w-[300px]"
            onClick={() => data.onClick(data.id)}
        >
            <Handle type="target" position={Position.Top} />
            <div className="font-bold text-xl text-primary mb-4">{data.label}</div>
            <div className="space-y-2">
                {Object.entries(data.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="font-semibold text-gray-600">{key}:</span>
                        <span className="text-gray-800">{String(value)}</span>
                    </div>
                ))}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const nodeTypes = {
    entityNode: EntityNode,
    expandedNode: ExpandedNode,
};

export const KnowledgeGraph: React.FC<{
    blueprint: Blueprint;
}> = ({ blueprint }) => {
    // State to track expanded nodes
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    // Function to handle node clicks
    const handleNodeClick = (nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    // Prepare queries for all tables
    const tableQueries = useMemo(() => {
        return blueprint.entities
            .map((entity: Entity) => ({
                tableName: entity.name,
                query: QueryBuilder.getQueryForTable(entity),
            }))
            .filter((item: TableQuery) => item.query);
    }, [blueprint]);

    // Use useQuery for each table query
    const tableQueryResults = tableQueries.map(({ tableName, query }: TableQuery) => {
        const { data, loading, error } = useQuery(query, { fetchPolicy: "no-cache" });
        return {
            tableName,
            data: data ? data[tableName.toLowerCase()] : null,
            loading,
            error,
        } as TableQueryResult;
    });

    // Transform data into nodes and edges
    const { nodes, edges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let nodeId = 0;

        // Calculate grid dimensions
        const NODES_PER_ROW = 3;
        const NODE_SPACING = 250; // Space between nodes
        const START_X = 100; // Starting X position
        const START_Y = 100; // Starting Y position

        // Create nodes for each entity
        tableQueryResults.forEach((result: TableQueryResult) => {
            if (result.data) {
                result.data.forEach((item: EntityData) => {
                    const nodeData = {
                        id: `node-${nodeId}`,
                        label: item.name || `${item.firstName} ${item.lastName}`,
                        metadata: Object.entries(item).reduce((acc, [key, value]) => {
                            if (key !== "name" && key !== "firstName" && key !== "lastName") {
                                acc[key] = value;
                            }
                            return acc;
                        }, {} as Record<string, any>),
                        onClick: handleNodeClick,
                    };

                    // Calculate position in grid
                    const row = Math.floor(nodeId / NODES_PER_ROW);
                    const col = nodeId % NODES_PER_ROW;
                    const x = START_X + (col * NODE_SPACING);
                    const y = START_Y + (row * NODE_SPACING);

                    const node: Node = {
                        id: `node-${nodeId}`,
                        type: expandedNodes.has(`node-${nodeId}`) ? "expandedNode" : "entityNode",
                        position: { x, y },
                        data: nodeData,
                        draggable: false,
                        selectable: false,
                        connectable: false,
                    };

                    console.log(`Creating node:`, node);
                    nodes.push(node);
                    nodeId++;
                });
            }
        });

        console.log("All nodes created:", nodes);

        // Create edges based on relationships
        blueprint.entities.forEach((entity: Entity) => {
            entity.fields.forEach((field: Field) => {
                if (field.type === "relationship") {
                    nodes.forEach((node, i) => {
                        if (i < nodes.length - 1) {
                            const edge: Edge = {
                                id: `edge-${i}`,
                                source: node.id,
                                target: nodes[i + 1].id,
                                type: "smoothstep",
                                label: field.name,
                                animated: true,
                            };
                            edges.push(edge);
                        }
                    });
                }
            });
        });

        console.log("All edges created:", edges);
        return { nodes, edges };
    }, [tableQueryResults, blueprint, expandedNodes]);

    // Check for loading state
    const isLoading = tableQueryResults.some((result: TableQueryResult) => result.loading);
    if (isLoading) {
        return <div className="flex flex-col items-center w-full p-4">Loading knowledge graph...</div>;
    }

    // Check for errors
    const errors = tableQueryResults.filter((result: TableQueryResult) => result.error);
    if (errors.length > 0) {
        return (
            <div className="p-4 text-red-600">
                <h2 className="text-xl font-bold mb-4">Errors</h2>
                {errors.map((error: TableQueryResult) => (
                    <div key={error.tableName}>
                        <strong>{error.tableName}:</strong> {error.error?.message}
                    </div>
                ))}
            </div>
        );
    }

    // Debug log before rendering
    console.log("Rendering ReactFlow with:", {
        nodesCount: nodes.length,
        edgesCount: edges.length,
        firstNode: nodes[0],
        lastNode: nodes[nodes.length - 1],
    });

    return (
        <div style={{ position: 'relative', width: '1400px', height: '800px', border: '1px solid #ccc' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnScroll={true}
                zoomOnScroll={true}
                zoomOnPinch={true}
                zoomOnDoubleClick={true}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                minZoom={0.1}
                maxZoom={4}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default KnowledgeGraph; 