"use client";

import Image from "next/image";
import { NodeProps, Handle, Position } from "@xyflow/react";

export default function ModelNode({ data, selected }: NodeProps) {
  const modelType = data?.type;
  
  // Map model type values to display text
  const getModelLabel = () => {
    if (modelType === 'nemotron-small') return 'S';
    if (modelType === 'nemotron-medium') return 'M';
    if (modelType === 'nemotron-large') return 'L';
    if (modelType === 'nemotron-xl') return 'XL';
    return null;
  };

  const modelLabel = getModelLabel();

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
        className={`w-16 h-16 flex items-center justify-center bg-gray-100/80 rounded-lg relative ${selected ? 'border-2 border-black' : ''}`}
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
        {/* Model Type Badge - Bottom Right, Sticking Out */}
        {modelLabel && (
          <div className="absolute -bottom-1 -right-1 z-20">
            <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
              <span className="text-xs font-semibold text-gray-700">{modelLabel}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

