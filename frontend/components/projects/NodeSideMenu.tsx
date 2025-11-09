"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NodeSideMenuProps {
  selectedNode: any;
  setNodes: (updater: (nodes: any[]) => any[]) => void;
  setSelectedNode: (node: any) => void;
}

export default function NodeSideMenu({ selectedNode, setNodes, setSelectedNode }: NodeSideMenuProps) {
  if (!selectedNode) return null;

  // Helper function to update node data
  const updateNodeData = (field: string, value: any) => {
    setNodes((nds: any[]) => {
      const updatedNodes = nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, [field]: value } }
          : node
      );
      // Update selectedNode with the updated node from the array
      const updatedNode = updatedNodes.find((n) => n.id === selectedNode.id);
      if (updatedNode) {
        setSelectedNode(updatedNode);
      }
      return updatedNodes;
    });
  };

  if (selectedNode.type === 'core') {
    return (
      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-20">
        <div className="bg-white/50 border border-white/20 rounded-xl px-6 py-8 shadow-sm min-w-[280px]" style={{ backdropFilter: 'blur(16px)' }}>
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold text-foreground">Core</h3>
            
            {/* Objective Textarea */}
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-foreground mb-2">
                Objective
              </label>
              <textarea
                id="objective"
                value={selectedNode.data?.goal || ''}
                onChange={(e) => updateNodeData('goal', e.target.value)}
                rows={4}
                className="w-full px-3 pt-3 py-2 border border-input rounded-lg bg-gray-100 text-foreground placeholder:text-gray-400 focus:outline-none transition-colors text-xs resize-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px #341f4f';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
                placeholder="Describe overall function of this agentic workflow"
              />
            </div> 

            {/* Nemotron Model Dropdown */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-foreground mb-2">
                Nemotron Model
              </label>
              <Select
                value={selectedNode.data?.model || ""}
                onValueChange={(value) => updateNodeData('model', value)}
              >
                <SelectTrigger className="w-full h-9 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none transition-colors text-xs" style={{ '--ring-color': '#341f4f' } as React.CSSProperties}>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nemotron-small">Nemotron Small</SelectItem>
                  <SelectItem value="nemotron-medium">Nemotron Medium</SelectItem>
                  <SelectItem value="nemotron-large">Nemotron Large</SelectItem>
                  <SelectItem value="nemotron-xl">Nemotron XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedNode.type === 'kb') {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const nodeName = selectedNode.data?.name || "Knowledge Base";

    const handleTitleDoubleClick = () => {
      setIsEditingTitle(true);
    };

    const handleTitleBlur = () => {
      setIsEditingTitle(false);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData('name', e.target.value);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setIsEditingTitle(false);
      }
    };

    return (
      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-20">
        <div className="bg-white/50 border border-white/20 rounded-xl px-6 py-8 shadow-sm min-w-[280px]" style={{ backdropFilter: 'blur(16px)' }}>
          <div className="flex flex-col gap-6">
            {/* Editable Title */}
            {isEditingTitle ? (
              <input
                type="text"
                value={nodeName}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-semibold text-foreground bg-transparent border-b-2 focus:outline-none w-full"
                style={{ borderColor: '#341f4f' }}
                autoFocus
              />
            ) : (
              <h3 
                className="text-lg font-semibold text-foreground truncate cursor-text" 
                onDoubleClick={handleTitleDoubleClick}
                title={nodeName}
              >
                {nodeName}
              </h3>
            )}
            
            {/* Source Dropdown */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-foreground mb-2">
                Source
              </label>
              <Select
                value={selectedNode.data?.source || ""}
                onValueChange={(value) => updateNodeData('source', value)}
              >
                <SelectTrigger className="w-full h-9 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none transition-colors text-xs" style={{ '--ring-color': '#341f4f' } as React.CSSProperties}>
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws-s3">AWS S3</SelectItem>
                  <SelectItem value="github-repo">Github Repo</SelectItem>
                  <SelectItem value="google-drive">Google Drive</SelectItem>
                  <SelectItem value="dropbox">Dropbox</SelectItem>
                  <SelectItem value="azure-blob">Azure Blob Storage</SelectItem>
                  <SelectItem value="api-endpoint">API Endpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Dropdown */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <Select
                value={selectedNode.data?.type || ""}
                onValueChange={(value) => updateNodeData('type', value)}
              >
                <SelectTrigger className="w-full h-9 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none transition-colors text-xs" style={{ '--ring-color': '#341f4f' } as React.CSSProperties}>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                  <SelectItem value="parquet">Parquet</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schema Textarea - Only show if type is not "image" */}
            {selectedNode.data?.type !== 'image' && (
              <div>
                <label htmlFor="schema" className="block text-sm font-medium text-foreground mb-2">
                  Schema
                </label>
                <textarea
                  id="schema"
                  value={selectedNode.data?.schema || ''}
                  onChange={(e) => updateNodeData('schema', e.target.value)}
                  rows={4}
                  className="w-full px-3 pt-3 py-2 border border-input rounded-lg bg-gray-100 text-foreground placeholder:text-gray-400 focus:outline-none transition-colors text-xs resize-none"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px #341f4f';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
                  placeholder="Enter schema definition"
                />
              </div>
            )}

            {/* Link Input */}
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-foreground mb-2">
                Link
              </label>
              <input
                type="text"
                id="link"
                value={selectedNode.data?.link || ''}
                onChange={(e) => updateNodeData('link', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-gray-100 text-foreground placeholder:text-gray-400 focus:outline-none transition-colors text-xs"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px #341f4f';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
                placeholder="Enter link URL"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedNode.type === 'tool') {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const nodeName = selectedNode.data?.name || "Tool";

    const handleTitleDoubleClick = () => {
      setIsEditingTitle(true);
    };

    const handleTitleBlur = () => {
      setIsEditingTitle(false);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData('name', e.target.value);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setIsEditingTitle(false);
      }
    };

    return (
      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-20">
        <div className="bg-white/50 border border-white/20 rounded-xl px-6 py-8 shadow-sm min-w-[280px]" style={{ backdropFilter: 'blur(16px)' }}>
          <div className="flex flex-col gap-6">
            {/* Editable Title */}
            {isEditingTitle ? (
              <input
                type="text"
                value={nodeName}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-semibold text-foreground bg-transparent border-b-2 focus:outline-none w-full"
                style={{ borderColor: '#341f4f' }}
                autoFocus
              />
            ) : (
              <h3 
                className="text-lg font-semibold text-foreground truncate cursor-text" 
                onDoubleClick={handleTitleDoubleClick}
                title={nodeName}
              >
                {nodeName}
              </h3>
            )}
            
            {/* Source Dropdown */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-foreground mb-2">
                Source
              </label>
              <Select
                value={selectedNode.data?.source || ""}
                onValueChange={(value) => updateNodeData('source', value)}
              >
                <SelectTrigger className="w-full h-9 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none transition-colors text-xs" style={{ '--ring-color': '#341f4f' } as React.CSSProperties}>
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="google-drive">Google Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedNode.type === 'model') {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const nodeName = selectedNode.data?.name || "Model";

    const handleTitleDoubleClick = () => {
      setIsEditingTitle(true);
    };

    const handleTitleBlur = () => {
      setIsEditingTitle(false);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData('name', e.target.value);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setIsEditingTitle(false);
      }
    };

    return (
      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-20">
        <div className="bg-white/50 border border-white/20 rounded-xl px-6 py-8 shadow-sm min-w-[280px]" style={{ backdropFilter: 'blur(16px)' }}>
          <div className="flex flex-col gap-6">
            {/* Editable Title */}
            {isEditingTitle ? (
              <input
                type="text"
                value={nodeName}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-semibold text-foreground bg-transparent border-b-2 focus:outline-none w-full"
                style={{ borderColor: '#341f4f' }}
                autoFocus
              />
            ) : (
              <h3 
                className="text-lg font-semibold text-foreground truncate cursor-text" 
                onDoubleClick={handleTitleDoubleClick}
                title={nodeName}
              >
                {nodeName}
              </h3>
            )}
            
            {/* Type Dropdown */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <Select
                value={selectedNode.data?.type || ""}
                onValueChange={(value) => updateNodeData('type', value)}
              >
                <SelectTrigger className="w-full h-9 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none transition-colors text-xs" style={{ '--ring-color': '#341f4f' } as React.CSSProperties}>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nemotron-small">Nemotron Small</SelectItem>
                  <SelectItem value="nemotron-medium">Nemotron Medium</SelectItem>
                  <SelectItem value="nemotron-large">Nemotron Large</SelectItem>
                  <SelectItem value="nemotron-xl">Nemotron XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-1/2 right-6 -translate-y-1/2 z-20">
      <div className="bg-white/50 border border-white/20 rounded-xl px-6 py-12 shadow-sm min-w-[280px] min-h-[600px]" style={{ backdropFilter: 'blur(16px)' }}>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Node Settings</h3>
            <p className="text-xs text-muted-foreground">Type: {selectedNode.type}</p>
          </div>
          {/* Add more node-specific settings here */}
        </div>
      </div>
    </div>
  );
}

