"use client";

import React from "react";
import { Type, Heading1, Heading2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/contexts/CanvasContext";

const TextPanel = () => {
  const { canvasActions } = useCanvas();

  const textTypes = [
    { icon: Heading1, label: "Heading", fontSize: 48 },
    { icon: Heading2, label: "Subheading", fontSize: 32 },
    { icon: Type, label: "Body Text", fontSize: 16 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Add Text
        </h4>
        <div className="space-y-2">
          {textTypes.map((text) => {
            const Icon = text.icon;
            return (
              <Button
                key={text.label}
                variant="outline"
                className="w-full h-16 flex items-center gap-3 justify-start hover:bg-orange-50 hover:border-orange-300"
                onClick={() => canvasActions?.addText(text.fontSize)}
              >
                <Icon className="w-5 h-5 text-gray-700" />
                <span className="text-sm">{text.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
