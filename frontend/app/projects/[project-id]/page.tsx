"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { addEdge, useNodesState, useEdgesState, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "@/components/nodes";
import FlowCanvas from "@/components/projects/FlowCanvas";
import { useAuth } from "@/contexts/AuthContext";
import { Rocket, Copy, Check } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  canvas_data: { nodes: any[]; edges: any[] } | null;
  endpoint: string | null;
  created_at: string;
  updated_at: string;
}

// Core node must always be present, centered, locked, and non-deletable
const createCoreNode = () => ({
  id: "core",
  type: "core",
  position: { x: 0, y: 0 }, // Center position
  data: {},
  style: { cursor: "pointer" },
  draggable: false, // Lock the core node
  deletable: false, // Prevent deletion
});

const defaultNodes = [createCoreNode()];
const defaultEdges: any[] = [];

// Helper function to ensure core node exists and is properly configured
const ensureCoreNode = (nodes: any[]) => {
  if (!Array.isArray(nodes)) {
    return [createCoreNode()];
  }
  
  const coreNode = nodes.find((n) => n && n.id === "core");
  if (!coreNode) {
    // Core node missing, add it at the beginning
    return [createCoreNode(), ...nodes];
  }
  
  // Check if core node already has correct properties to avoid unnecessary updates
  const needsUpdate = 
    coreNode.draggable !== false ||
    coreNode.deletable !== false ||
    coreNode.position?.x !== 0 ||
    coreNode.position?.y !== 0 ||
    coreNode.type !== "core";
  
  if (!needsUpdate) {
    // Core node is already correctly configured, return nodes as-is
    return nodes;
  }
  
  // Ensure core node is locked and non-deletable
  return nodes.map((node) =>
    node && node.id === "core"
      ? {
          ...node,
          type: "core", // Ensure type is set
          draggable: false,
          deletable: false,
          position: { x: 0, y: 0 }, // Lock position to center
          data: node.data || {},
          style: { cursor: "pointer" },
        }
      : node
  );
};

export default function ProjectPage() {
  const params = useParams();
  const projectId = params["project-id"] as string;
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectName, setProjectName] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const { token } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const coreNodeEnsuredRef = useRef(false);
  const initialCanvasDataRef = useRef<{ nodes: any[]; edges: any[] } | null>(null);

  const fetchProject = useCallback(async () => {
    if (!token || !projectId) {
      console.log("Missing token or projectId:", { token: !!token, projectId });
      setIsLoading(false);
      return;
    }

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch project: ${response.status}`);
      }

      const data = await response.json();
      setProject(data);
      setProjectName(data.name || "Untitled");
      
      // Always ensure core node exists
      let nodesToSet = defaultNodes;
      let edgesToSet: any[] = [];
      
      if (data.canvas_data && Array.isArray(data.canvas_data.nodes)) {
        // Ensure core node exists and is properly configured
        nodesToSet = ensureCoreNode(data.canvas_data.nodes);
      }
      
      if (data.canvas_data && Array.isArray(data.canvas_data.edges)) {
        edgesToSet = data.canvas_data.edges;
      }
      
      setNodes(nodesToSet);
      setEdges(edgesToSet);
      
      // Store initial canvas data for comparison (deep copy)
      initialCanvasDataRef.current = {
        nodes: JSON.parse(JSON.stringify(nodesToSet)),
        edges: JSON.parse(JSON.stringify(edgesToSet))
      };
      
      setIsInitialized(true);
      setIsLoading(false);
      coreNodeEnsuredRef.current = true;
      
      // Debug: Log the actual node structure
      console.log("Final nodes being set:", JSON.stringify(nodesToSet, null, 2));
      const coreNodeInSet = nodesToSet.find((n: any) => n.id === "core");
      console.log("Core node in nodesToSet:", coreNodeInSet);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Error fetching project:", error);
      if (error.name === 'AbortError') {
        console.error("Request timed out");
      }
      setIsLoading(false);
      // Still set default nodes so user can see something
      setNodes(defaultNodes);
      setEdges(defaultEdges);
      initialCanvasDataRef.current = {
        nodes: JSON.parse(JSON.stringify(defaultNodes)),
        edges: JSON.parse(JSON.stringify(defaultEdges))
      };
      setIsInitialized(true);
      coreNodeEnsuredRef.current = true;
    }
  }, [token, projectId, setNodes, setEdges]);

  // Fetch project when component mounts or token/projectId changes
  useEffect(() => {
    if (token && projectId) {
      fetchProject();
    } else {
      setIsLoading(false);
    }
  }, [token, projectId, fetchProject]);

  // Helper function to deep compare canvas data
  const hasCanvasDataChanged = useCallback((currentNodes: any[], currentEdges: any[]): boolean => {
    if (!initialCanvasDataRef.current) return true;
    
    const initial = initialCanvasDataRef.current;
    
    // Compare nodes (normalize for comparison - remove transient properties)
    const normalizeNode = (node: any) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      draggable: node.draggable,
      deletable: node.deletable
    });
    
    const normalizedCurrentNodes = currentNodes.map(normalizeNode).sort((a, b) => a.id.localeCompare(b.id));
    const normalizedInitialNodes = initial.nodes.map(normalizeNode).sort((a, b) => a.id.localeCompare(b.id));
    
    if (JSON.stringify(normalizedCurrentNodes) !== JSON.stringify(normalizedInitialNodes)) {
      return true;
    }
    
    // Compare edges
    const normalizeEdge = (edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type
    });
    
    const normalizedCurrentEdges = currentEdges.map(normalizeEdge).sort((a, b) => a.id.localeCompare(b.id));
    const normalizedInitialEdges = initial.edges.map(normalizeEdge).sort((a, b) => a.id.localeCompare(b.id));
    
    if (JSON.stringify(normalizedCurrentEdges) !== JSON.stringify(normalizedInitialEdges)) {
      return true;
    }
    
    return false;
  }, []);

  // Auto-save canvas data whenever nodes or edges change
  const saveCanvasData = useCallback(async () => {
    if (!token || !projectId || !isInitialized) return;

    try {
      // Ensure core node is present and locked before saving
      const nodesToSave = ensureCoreNode(nodes);
      
      // Only save if data has actually changed
      if (!hasCanvasDataChanged(nodesToSave, edges)) {
        return;
      }
      
      await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          canvas_data: {
            nodes: nodesToSave,
            edges: edges,
          },
        }),
      });
      
      // Update initial canvas data after successful save
      initialCanvasDataRef.current = {
        nodes: JSON.parse(JSON.stringify(nodesToSave)),
        edges: JSON.parse(JSON.stringify(edges))
      };
    } catch (error) {
      console.error("Error saving canvas data:", error);
    }
  }, [token, projectId, nodes, edges, isInitialized, hasCanvasDataChanged]);

  // Debounced save function
  useEffect(() => {
    if (!isInitialized) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveCanvasData();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, isInitialized, saveCanvasData]);

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    
    if (!token || !projectId || !project) return;

    // Only update if name changed
    if (projectName.trim() === project.name) return;

    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName.trim() || "Untitled",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update project name");
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
      setProjectName(updatedProject.name);
    } catch (error) {
      console.error("Error updating project name:", error);
      // Revert to original name on error
      setProjectName(project.name);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
      handleTitleBlur();
    }
  };

  // Custom onNodesChange that prevents core node deletion and movement
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      // Filter out any changes that would delete or move the core node
      const filteredChanges = changes.filter((change) => {
        if (change.type === "remove" && change.id === "core") {
          return false; // Prevent core node deletion
        }
        if (change.type === "position" && change.id === "core") {
          return false; // Prevent core node movement
        }
        if (change.type === "dimensions" && change.id === "core") {
          return false; // Prevent core node dimension changes that might affect position
        }
        return true;
      });

      // Apply filtered changes
      if (filteredChanges.length > 0) {
        onNodesChange(filteredChanges);
      }

      // Ensure core node is always present and locked after changes
      setNodes((nds) => ensureCoreNode(nds));
    },
    [onNodesChange, setNodes]
  );

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

  // Check if deploy button should be enabled
  const canDeploy = useCallback(() => {
    // Check if there are more nodes than just the core node
    const nonCoreNodes = nodes.filter((node) => node.id !== "core");
    if (nonCoreNodes.length === 0) {
      return false;
    }

    // Check if all nodes (including core) are connected (have at least one edge)
    const connectedNodeIds = new Set<string>();
    
    edges.forEach((edge) => {
      if (edge.source) connectedNodeIds.add(edge.source);
      if (edge.target) connectedNodeIds.add(edge.target);
    });

    // All nodes must have at least one edge connected to them
    return nodes.every((node) => connectedNodeIds.has(node.id));
  }, [nodes, edges]);

  const isDeployEnabled = canDeploy();

  const handleDeploy = async () => {
    if (!token || !projectId || !isDeployEnabled || isDeploying) return;

    setIsDeploying(true);
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to deploy project");
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (error) {
      console.error("Error deploying project:", error);
      // You could show an error toast here
    } finally {
      setIsDeploying(false);
    }
  };

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
    <ProtectedRoute>
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50/50 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-[calc(100%-2rem)]">
          {/* Project Title and API Endpoint */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={projectName}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="text-2xl font-semibold text-foreground bg-transparent border-b-2 focus:outline-none w-full"
                  style={{ borderColor: '#341f4f' }}
                  autoFocus
                />
              ) : (
                <h1 
                  className="text-2xl font-semibold text-foreground text-left truncate cursor-text" 
                  onDoubleClick={handleTitleDoubleClick}
                  title={projectName || "Project"}
                >
                  {projectName || project?.name || "Untitled"}
                </h1>
              )}
            </div>
            {/* API Endpoint URL - Only show if endpoint exists (after deployment) */}
            {project?.endpoint && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono" style={{ color: '#341f4f' }}>
                  {project.endpoint}
                </span>
                <button
                  onClick={async () => {
                    if (!project.endpoint) return;
                    try {
                      await navigator.clipboard.writeText(project.endpoint);
                      setIsCopied(true);
                      setTimeout(() => {
                        setIsCopied(false);
                      }, 1500);
                    } catch (err) {
                      console.error('Failed to copy:', err);
                    }
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Copy API endpoint"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4" style={{ color: '#341f4f' }} />
                  ) : (
                    <Copy className="w-4 h-4" style={{ color: '#341f4f' }} />
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Canvas Card */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading project...</p>
            </div>
          ) : (
            <div className="bg-gray-50/90 rounded-xl border border-border shadow-sm relative w-full">
            {/* Canvas */}
            <div className="w-full h-[800px] p-6 relative">
              <FlowCanvas
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                setNodes={setNodes}
                onSelectionChange={onSelectionChange}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
              />
              
              {/* Deploy Button - positioned on bottom right */}
              <button 
                disabled={!isDeployEnabled || isDeploying}
                onClick={handleDeploy}
                className={`absolute bottom-6 right-6 px-4 py-2 rounded-lg font-medium text-sm transition-colors z-30 flex items-center gap-2 ${
                  isDeployEnabled && !isDeploying
                    ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Rocket className="w-4 h-4" />
                {isDeploying ? "Deploying..." : "Deploy"}
              </button>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}

