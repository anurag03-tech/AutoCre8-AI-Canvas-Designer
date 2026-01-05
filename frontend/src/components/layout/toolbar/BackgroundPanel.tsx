// components/layout/toolbar/BackgroundPanel.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/contexts/CanvasContext";

const BackgroundPanel = () => {
  const { canvasActions } = useCanvas();
  const [bgColor, setBgColor] = useState("#ffffff");

  const presetColors = [
    // Neutrals
    "#ffffff",
    "#f9fafb",
    "#f3f4f6",
    "#e5e7eb",
    "#d1d5db",
    "#9ca3af",
    "#6b7280",
    "#374151",
    "#111827",

    // Blues
    "#eff6ff",
    "#bfdbfe",
    "#60a5fa",
    "#3b82f6",
    "#2563eb",
    "#1e40af",

    // Reds
    "#fee2e2",
    "#fca5a5",
    "#ef4444",
    "#dc2626",
    "#991b1b",

    // Greens
    "#dcfce7",
    "#86efac",
    "#10b981",
    "#059669",
    "#065f46",

    // Yellows / Ambers
    "#fef3c7",
    "#fde68a",
    "#f59e0b",
    "#d97706",
    "#92400e",

    // Purples
    "#ede9fe",
    "#c4b5fd",
    "#8b5cf6",
    "#7c3aed",
    "#4c1d95",

    // Pinks
    "#fce7f3",
    "#f9a8d4",
    "#ec4899",
    "#be185d",

    // Teals / Cyans
    "#ccfbf1",
    "#5eead4",
    "#14b8a6",
    "#0d9488",
    "#155e75",

    // Oranges
    "#ffedd5",
    "#fdba74",
    "#f97316",
    "#c2410c",
  ];

  const handleColorChange = (color: string) => {
    setBgColor(color);
    if (!canvasActions) return;
    canvasActions.changeBackground(color);
  };

  const handleTransparent = () => {
    if (!canvasActions) return;
    setBgColor("transparent");
    canvasActions.changeBackground("transparent");
  };

  return (
    <div className="space-y-4">
      {/* Color Picker */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Background Color
        </h4>
        <div className="flex gap-2 items-center">
          <Input
            type="color"
            value={bgColor === "transparent" ? "#ffffff" : bgColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-16 h-16 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={bgColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 uppercase"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Transparent Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full cursor-pointer bg-blue-50"
        onClick={handleTransparent}
      >
        Transparent Background
      </Button>

      {/* Preset Colors */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Preset Colors
        </h4>
        <div className="grid grid-cols-6 gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all hover:scale-110 cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange(color)}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundPanel;
