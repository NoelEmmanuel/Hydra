"use client";

import { useParams } from "next/navigation";
import { useCallback, useMemo, useEffect, useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const projects = [
  { id: 1, name: "Customer Support Agent", status: "deployed", lastModified: "2 hours ago", description: "AI-powered customer support system" },
  { id: 2, name: "Data Analysis Pipeline", status: "deployed", lastModified: "1 day ago", description: "Automated data processing workflow" },
  { id: 3, name: "Content Generator", status: "draft", lastModified: "3 days ago", description: "Multi-agent content creation system" },
  { id: 4, name: "E-commerce Assistant", status: "deployed", lastModified: "5 days ago", description: "Shopping experience optimization" },
  { id: 5, name: "Document Processor", status: "deployed", lastModified: "1 week ago", description: "Intelligent document analysis" },
  { id: 6, name: "Email Classifier", status: "draft", lastModified: "2 weeks ago", description: "Automated email categorization" },
  { id: 7, name: "Code Review Assistant", status: "deployed", lastModified: "2 weeks ago", description: "AI-powered code review system" },
  { id: 8, name: "Meeting Summarizer", status: "deployed", lastModified: "3 weeks ago", description: "Automatic meeting transcription and summary" },
];

// Custom Core Node Component
function CoreNode({ data }: NodeProps) {
  return (
    <div className="flex items-center justify-center cursor-pointer group relative">
      {/* Top - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Top}
        id="top-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Top}
        id="top-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Right - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Right}
        id="right-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="right-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Bottom - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Bottom}
        id="bottom-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="bottom-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Left - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Left}
        id="left-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Left}
        id="left-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <div 
        className="w-16 h-16 flex items-center justify-center bg-gray-100/80 rounded-lg"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <Image
          src="/core.png"
          alt="Core"
          width={52}
          height={52}
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  );
}

// Custom Tool Node Component
function ToolNode({ data }: NodeProps) {
  return (
    <div className="flex items-center justify-center cursor-pointer group relative">
      {/* Top - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Top}
        id="top-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Top}
        id="top-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Right - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Right}
        id="right-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="right-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Bottom - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Bottom}
        id="bottom-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="bottom-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Left - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Left}
        id="left-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Left}
        id="left-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <div 
        className="w-16 h-16 flex items-center justify-center bg-blue-100/80 rounded-lg"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <Image
          src="/tool.png"
          alt="Tool"
          width={40}
          height={40}
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  );
}

// Custom KB Node Component
function KBNode({ data }: NodeProps) {
  return (
    <div className="flex items-center justify-center cursor-pointer group relative">
      {/* Top - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Top}
        id="top-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Top}
        id="top-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Right - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Right}
        id="right-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="right-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Bottom - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Bottom}
        id="bottom-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="bottom-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Left - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Left}
        id="left-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Left}
        id="left-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <div 
        className="w-16 h-16 flex items-center justify-center bg-green-100/80 rounded-lg"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <Image
          src="/kb.png"
          alt="Knowledge Base"
          width={40}
          height={40}
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  );
}

// Custom Model Node Component
function ModelNode({ data }: NodeProps) {
  return (
    <div className="flex items-center justify-center cursor-pointer group relative">
      {/* Top - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Top}
        id="top-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Top}
        id="top-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Right - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Right}
        id="right-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="right-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Bottom - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Bottom}
        id="bottom-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom}
        id="bottom-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      {/* Left - Target and Source */}
      <Handle 
        type="target" 
        position={Position.Left}
        id="left-target"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <Handle 
        type="source" 
        position={Position.Left}
        id="left-source"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ 
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          zIndex: 10
        }}
      />
      <div 
        className="w-16 h-16 flex items-center justify-center bg-purple-100/80 rounded-lg"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <Image
          src="/model.png"
          alt="Model"
          width={40}
          height={40}
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  );
}

const nodeTypes = {
  core: CoreNode,
  tool: ToolNode,
  kb: KBNode,
  model: ModelNode,
};

const initialNodes = [
  {
    id: "core",
    type: "core",
    position: { x: 400, y: 200 },
    data: {},
    style: { cursor: "pointer" },
  },
];

const initialEdges: any[] = [];

// Component to handle drag and drop from toolbar
function FlowCanvas({ 
  nodes, 
  edges, 
  nodeTypes, 
  onNodesChange, 
  onEdgesChange, 
  onConnect,
  setNodes,
  onSelectionChange
}: {
  nodes: any[];
  edges: any[];
  nodeTypes: any;
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  setNodes: any;
  onSelectionChange: (params: { nodes: any[]; edges: any[] }) => void;
}) {
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
      {/* Floating Toolbar Card */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 z-20">
        <div className="bg-white/50 border border-white/20 rounded-xl px-4 py-5 flex flex-col items-center gap-4 shadow-sm" style={{ backdropFilter: 'blur(16px)' }}>
          <div 
            className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => onDragStart(e, 'tool')}
          >
            <Image src="/tool.png" alt="Tool" width={20} height={20} className="object-contain pointer-events-none" unoptimized />
          </div>
          <div 
            className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => onDragStart(e, 'kb')}
          >
            <Image src="/kb.png" alt="Knowledge Base" width={20} height={20} className="object-contain pointer-events-none" unoptimized />
          </div>
          <div 
            className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => onDragStart(e, 'model')}
          >
            <Image src="/model.png" alt="Model" width={20} height={20} className="object-contain pointer-events-none" unoptimized />
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params["project-id"];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());

  const project = useMemo(() => {
    const id = typeof projectId === "string" ? parseInt(projectId, 10) : Number(projectId);
    return projects.find((p) => p.id === id);
  }, [projectId]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        style: { strokeWidth: 2, stroke: '#555' },
        animated: false,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onSelectionChange = useCallback((params: { nodes: any[]; edges: any[] }) => {
    setSelectedEdgeIds(new Set(params.edges.map((edge: any) => edge.id)));
  }, []);

  // Handle keyboard deletion of edges
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdgeIds.size > 0) {
        event.preventDefault();
        setEdges((eds) => eds.filter((edge) => !selectedEdgeIds.has(edge.id)));
        setSelectedEdgeIds(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEdgeIds, setEdges]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .react-flow__pane {
        cursor: default !important;
      }
      .react-flow__pane.dragging {
        cursor: grabbing !important;
      }
      .react-flow__node {
        cursor: pointer !important;
      }
      .react-flow__edge {
        cursor: pointer !important;
      }
      .react-flow__edge-path {
        cursor: pointer !important;
        stroke-width: 2 !important;
        stroke: #555 !important;
      }
      .react-flow__edge.selected .react-flow__edge-path {
        stroke: #333 !important;
        stroke-width: 2.5 !important;
      }
      .react-flow__connectionline {
        stroke-width: 2 !important;
        stroke: #555 !important;
      }
      .react-flow__connection-path {
        stroke-width: 2 !important;
        stroke: #555 !important;
      }
      .react-flow__handle {
        cursor: crosshair !important;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 10 !important;
        pointer-events: auto !important;
      }
      .react-flow__node:hover .react-flow__handle {
        opacity: 1;
      }
      .react-flow__handle[style*="opacity: 1"] {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);

    // Add event listeners for dragging cursor
    const handleMouseDown = () => {
      const pane = document.querySelector('.react-flow__pane');
      pane?.classList.add('dragging');
    };

    const handleMouseUp = () => {
      const pane = document.querySelector('.react-flow__pane');
      pane?.classList.remove('dragging');
    };

    const handleMouseLeave = () => {
      const pane = document.querySelector('.react-flow__pane');
      pane?.classList.remove('dragging');
    };

    // Use a small delay to ensure ReactFlow has rendered
    const timeoutId = setTimeout(() => {
      const pane = document.querySelector('.react-flow__pane');
      if (pane) {
        pane.addEventListener('mousedown', handleMouseDown);
        pane.addEventListener('mouseup', handleMouseUp);
        pane.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseup', handleMouseUp);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.head.removeChild(style);
      const pane = document.querySelector('.react-flow__pane');
      if (pane) {
        pane.removeEventListener('mousedown', handleMouseDown);
        pane.removeEventListener('mouseup', handleMouseUp);
        pane.removeEventListener('mouseleave', handleMouseLeave);
      }
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50/50 flex items-start justify-center pt-12 px-8">
        {/* Canvas Card */}
        <div className="bg-gray-50/90 rounded-xl border border-border shadow-sm relative w-full max-w-[calc(100%-2rem)]">
            {/* Canvas */}
            <div className="w-full h-[800px] p-6 relative">
              {/* Project Title with Glassmorphic Background - Absolutely Positioned */}
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-white/50 border border-white/20 rounded-lg px-4 py-2 inline-block" style={{ backdropFilter: 'blur(12px)' }}>
                  <h1 className="text-2xl font-semibold text-foreground">
                    {project?.name || "Project"}
                  </h1>
                </div>
              </div>
              
              <FlowCanvas
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                setNodes={setNodes}
                onSelectionChange={onSelectionChange}
              />
            </div>
          </div>
      </main>
    </div>
  );
}

