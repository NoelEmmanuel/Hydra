"use client";

import { useParams } from "next/navigation";
import { useCallback, useMemo, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { addEdge, useNodesState, useEdgesState, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "@/components/nodes";
import FlowCanvas from "@/components/projects/FlowCanvas";

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

export default function ProjectPage() {
  const params = useParams();
  const projectId = params["project-id"];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<any>(null);

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
    setSelectedNode(params.nodes.length > 0 ? params.nodes[0] : null);
  }, []);

  // Sync selectedNode with actual node data when nodes change
  useEffect(() => {
    if (selectedNode) {
      const updatedNode = nodes.find((n) => n.id === selectedNode.id);
      if (updatedNode) {
        setSelectedNode(updatedNode);
      }
    }
  }, [nodes, selectedNode?.id]);

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
      .react-flow__attribution {
        display: none !important;
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
      <main className="flex-1 overflow-y-auto bg-gray-50/50 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-[calc(100%-2rem)]">
          {/* Project Title */}
          <h1 className="text-2xl font-semibold text-foreground mb-6 text-left">
            {project?.name || "Project"}
          </h1>
          
          {/* Canvas Card */}
          <div className="bg-gray-50/90 rounded-xl border border-border shadow-sm relative w-full">
            {/* Canvas */}
            <div className="w-full h-[800px] p-6 relative">
              <FlowCanvas
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                setNodes={setNodes}
                onSelectionChange={onSelectionChange}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
              />
              
              {/* Deploy Button - positioned over React Flow watermark */}
              <button className="absolute bottom-6 right-6 bg-black text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors z-30">
                Deploy
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

