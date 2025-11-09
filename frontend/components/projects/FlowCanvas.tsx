"use client";

import { useCallback, useState } from "react";
import { ReactFlow, Background, Connection } from "@xyflow/react";
import Toolbar from "./Toolbar";
import NodeSideMenu from "./NodeSideMenu";

interface FlowCanvasProps {
  nodes: any[];
  edges: any[];
  nodeTypes: any;
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  setNodes: (updater: (nodes: any[]) => any[]) => void;
  onSelectionChange: (params: { nodes: any[]; edges: any[] }) => void;
  selectedNode: any;
  setSelectedNode: (node: any) => void;
}

export default function FlowCanvas({
  nodes,
  edges,
  nodeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes,
  onSelectionChange,
  selectedNode,
  setSelectedNode,
}: FlowCanvasProps) {
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType || !reactFlowInstance) return;

      const reactFlowBounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: {},
        style: { cursor: "pointer" },
      };

      setNodes((nds: any[]) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        defaultViewport={{ x: 0, y: 0, zoom: 0.1 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 2, stroke: '#555' },
          animated: false,
        }}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        panOnDrag={true}
        nodesDraggable={true}
      >
        <Background />
      </ReactFlow>
      <Toolbar onDragStart={onDragStart} />
      <NodeSideMenu 
        selectedNode={selectedNode} 
        setNodes={setNodes} 
        setSelectedNode={setSelectedNode} 
      />
    </>
  );
}

