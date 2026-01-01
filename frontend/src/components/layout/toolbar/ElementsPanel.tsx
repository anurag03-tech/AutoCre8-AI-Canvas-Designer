"use client";

import React from "react";
import {
  Square,
  Circle,
  Triangle,
  Star,
  Minus,
  Pentagon,
  Hexagon,
  ArrowRight,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/contexts/CanvasContext";

const ElementsPanel = () => {
  const { canvasActions } = useCanvas();

  const shapes = [
    {
      icon: Square,
      label: "Rectangle",
      config: {
        type: "rect",
        left: 150,
        top: 150,
        width: 200,
        height: 150,
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      },
    },
    {
      icon: Circle,
      label: "Circle",
      config: {
        type: "circle",
        left: 150,
        top: 150,
        radius: 75,
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      },
    },
    {
      icon: Circle,
      label: "Ellipse",
      config: {
        type: "ellipse",
        left: 150,
        top: 150,
        rx: 100,
        ry: 60,
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      },
    },
    {
      icon: Triangle,
      label: "Triangle",
      config: {
        type: "triangle",
        left: 150,
        top: 150,
        width: 150,
        height: 150,
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      },
    },
    {
      icon: Pentagon,
      label: "Pentagon",
      config: {
        type: "polygon",
        left: 150,
        top: 150,
        points: [
          { x: 0, y: -50 },
          { x: 47.5, y: -15.5 },
          { x: 29.4, y: 40.5 },
          { x: -29.4, y: 40.5 },
          { x: -47.5, y: -15.5 },
        ],
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      },
    },
    {
      icon: Hexagon,
      label: "Hexagon",
      config: {
        type: "polygon",
        left: 150,
        top: 150,
        points: Array.from({ length: 6 }, (_, i) => ({
          x: Math.cos((Math.PI / 3) * i) * 50,
          y: Math.sin((Math.PI / 3) * i) * 50,
        })),
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      },
    },
    {
      icon: Star,
      label: "Star",
      config: {
        type: "polygon",
        left: 150,
        top: 150,
        points: Array.from({ length: 10 }, (_, i) => {
          const radius = i % 2 === 0 ? 50 : 25;
          const angle = (Math.PI / 5) * i;
          return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          };
        }),
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      },
    },
    {
      icon: Minus,
      label: "Line",
      config: {
        type: "line",
        points: [50, 50, 200, 200],
        stroke: "#1e40af",
        strokeWidth: 3,
      },
    },
    {
      icon: ArrowRight,
      label: "Arrow",
      config: {
        type: "path",
        path: "M 0 10 L 100 10 L 100 0 L 120 15 L 100 30 L 100 20 L 0 20 Z",
        left: 100,
        top: 100,
        fill: "#3b82f6",
        stroke: "#1e40af",
        strokeWidth: 2,
      },
    },
  ];

  const handleAddShape = (config: any) => {
    if (canvasActions) {
      canvasActions.addShape(config);
    }
  };

  const handleAddText = () => {
    if (canvasActions) {
      canvasActions.addText();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Shapes & Elements
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {shapes.map((shape, idx) => {
            const Icon = shape.icon;
            return (
              <Button
                key={idx}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                onClick={() => handleAddShape(shape.config)}
              >
                <Icon className="w-6 h-6 text-gray-700" />
                <span className="text-xs text-gray-600">{shape.label}</span>
              </Button>
            );
          })}
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            onClick={handleAddText}
          >
            <Type className="w-6 h-6 text-gray-700" />
            <span className="text-xs text-gray-600">Text</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ElementsPanel;
