"use client";

import Image from "next/image";
import { NodeProps, Handle, Position } from "@xyflow/react";

export default function CoreNode({ data, selected }: NodeProps) {
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
        className={`w-16 h-16 flex items-center justify-center bg-gray-100/80 rounded-lg ${selected ? 'border-2 border-black' : ''}`}
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

