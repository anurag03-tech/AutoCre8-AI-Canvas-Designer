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
    "#ffffff",
    "#f3f4f6",
    "#e5e7eb",
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#6366f1",
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
        className="w-full"
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
              className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all hover:scale-110"
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
