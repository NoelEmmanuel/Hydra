"use client";

import { useState } from "react";
import Image from "next/image";

interface ToolbarProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

interface TooltipIconProps {
  icon: string;
  label: string;
  bgColor: string;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  nodeType: string;
}

function TooltipIcon({ icon, label, bgColor, onDragStart, nodeType }: TooltipIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const handleMouseEnter = () => {
    const id = window.setTimeout(() => {
      setShowTooltip(true);
    }, 500);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setShowTooltip(false);
  };

  return (
    <div className="relative">
      <div 
        className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing`}
        draggable
        onDragStart={(e) => onDragStart(e, nodeType)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image src={icon} alt={label} width={20} height={20} className="object-contain pointer-events-none" unoptimized />
      </div>
      {showTooltip && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-30">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Toolbar({ onDragStart }: ToolbarProps) {
  return (
    <div className="absolute top-1/2 left-6 -translate-y-1/2 z-20">
      <div className="bg-white/50 border border-white/20 rounded-xl px-4 py-5 flex flex-col items-center gap-4 shadow-sm" style={{ backdropFilter: 'blur(16px)' }}>
        <TooltipIcon 
          icon="/tool.png" 
          label="Tool" 
          bgColor="bg-gray-100" 
          onDragStart={onDragStart} 
          nodeType="tool" 
        />
        <TooltipIcon 
          icon="/kb.png" 
          label="Knowledge Base" 
          bgColor="bg-gray-100" 
          onDragStart={onDragStart} 
          nodeType="kb" 
        />
        <TooltipIcon 
          icon="/model.png" 
          label="Model" 
          bgColor="bg-gray-100" 
          onDragStart={onDragStart} 
          nodeType="model" 
        />
      </div>
    </div>
  );
}

