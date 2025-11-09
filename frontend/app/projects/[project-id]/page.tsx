"use client";

import { useParams } from "next/navigation";
import { useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import {
  ReactFlow,
  Background,
  Controls,
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
    <div className="flex flex-col items-center justify-center cursor-pointer group">
      <Handle 
        type="target" 
        position={Position.Top}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <div className="w-20 h-20 flex items-center justify-center">
        <Image
          src="/core.png"
          alt="Core"
          width={80}
          height={80}
          className="object-contain"
          unoptimized
        />
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <div className="mt-2 text-xs font-medium text-foreground">Core</div>
    </div>
  );
}

const nodeTypes = {
  core: CoreNode,
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

export default function ProjectPage() {
  const params = useParams();
  const projectId = params["project-id"];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const project = useMemo(() => {
    const id = typeof projectId === "string" ? parseInt(projectId, 10) : Number(projectId);
    return projects.find((p) => p.id === id);
  }, [projectId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
      }
      .react-flow__handle {
        cursor: pointer !important;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .react-flow__node:hover .react-flow__handle {
        opacity: 1;
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
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="w-full px-8 pt-8">
          {/* Canvas Card */}
          <div className="bg-gray-50/90 rounded-xl border border-border shadow-sm relative">
            {/* Canvas */}
            <div className="w-full h-[800px] p-6">
              {/* Project Title with Glassmorphic Background - Absolutely Positioned */}
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-white/50 border border-white/20 rounded-lg px-4 py-2 inline-block">
                  <h1 className="text-2xl font-semibold text-foreground">
                    {project?.name || "Project"}
                  </h1>
                </div>
              </div>
              
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                fitView
                fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
                panOnDrag={true}
                nodesDraggable={true}
              >
                <Background />
                <Controls />
              </ReactFlow>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

