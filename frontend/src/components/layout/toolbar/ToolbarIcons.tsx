// components/layout/toolbar/ToolbarIcons.tsx
"use client";

import React from "react";
import {
  Sparkles,
  Image,
  Type,
  Layers,
  Palette,
  Square,
  Users,
  Tag,
} from "lucide-react";
import { ToolType } from "../canvasToolbox";

interface Props {
  activePanel: ToolType;
  onPanelToggle: (panel: ToolType) => void;
}

const ToolbarIcons: React.FC<Props> = ({ activePanel, onPanelToggle }) => {
  const iconButton = (
    panel: ToolType,
    label: string,
    Icon: React.ComponentType<{ className?: string }>
  ) => (
    <button
      key={panel}
      onClick={() => onPanelToggle(panel)}
      className={`flex flex-col items-center gap-1 p-1 py-2 cursor-pointer rounded-lg transition-all duration-200 hover:bg-gray-100 ${
        activePanel === panel ? "bg-indigo-50 text-indigo-600" : "text-gray-600"
      }`}
    >
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
          activePanel === panel
            ? "bg-indigo-600 text-white shadow-sm"
            : "bg-gray-100"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span
        className={`text-[10px] font-medium leading-tight text-center ${
          activePanel === panel ? "text-indigo-600" : "text-gray-600"
        }`}
      >
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col items-stretch py-2 px-2 bg-white border-r border-gray-200 gap-1 min-w-[80px]">
      {iconButton("layers", "Layers", Layers)}
      {iconButton("elements", "Elements", Square)}
      {iconButton("text", "Text", Type)}
      {iconButton("images", "Images", Image)}
      {iconButton("background", "Background", Palette)}

      <div className="h-px bg-gray-200 my-2 mx-2" />

      {iconButton("ai", "AI Assistant", Sparkles)}
      {iconButton("brand", "Brand", Tag)}
      {iconButton("collaborates", "Team", Users)}
    </div>
  );
};

export default ToolbarIcons;
