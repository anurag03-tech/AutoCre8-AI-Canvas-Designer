"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/contexts/CanvasContext";

const TextStylesPanel = () => {
  const { canvasActions } = useCanvas();

  const textStyles = [
    {
      name: "Fire Gradient",
      preview: "linear-gradient(180deg, #ff0080 0%, #ff8c00 100%)",
      config: {
        text: "FIRE",
        fontFamily: "Impact",
        fontSize: 72,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: ["#ff0080", "#ff8c00"],
        },
        stroke: "#000000",
        strokeWidth: 2,
      },
    },
    {
      name: "Neon Glow",
      preview: "linear-gradient(180deg, #00ffff 0%, #00ffff 100%)",
      config: {
        text: "NEON",
        fontFamily: "Arial",
        fontSize: 64,
        fontWeight: "bold",
        fill: "#00ffff",
        stroke: "#0080ff",
        strokeWidth: 3,
        shadow: {
          color: "#00ffff",
          blur: 25,
          offsetX: 0,
          offsetY: 0,
        },
      },
    },
    {
      name: "Gold 3D",
      preview: "linear-gradient(180deg, #ffd700 0%, #ff8c00 100%)",
      config: {
        text: "GOLD",
        fontFamily: "Impact",
        fontSize: 72,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: ["#ffd700", "#ff8c00"],
        },
        stroke: "#8B4513",
        strokeWidth: 4,
        shadow: {
          color: "#000000",
          blur: 8,
          offsetX: 4,
          offsetY: 4,
        },
      },
    },
    {
      name: "Comic Book",
      preview: "#ff0000",
      config: {
        text: "POW!",
        fontFamily: "Impact",
        fontSize: 68,
        fontWeight: "bold",
        fill: "#ff0000",
        stroke: "#000000",
        strokeWidth: 6,
        shadow: {
          color: "#ffff00",
          blur: 0,
          offsetX: 5,
          offsetY: 5,
        },
      },
    },
    {
      name: "Ocean Wave",
      preview: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
      config: {
        text: "OCEAN",
        fontFamily: "Arial",
        fontSize: 64,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: ["#667eea", "#764ba2"],
        },
        stroke: "#ffffff",
        strokeWidth: 2,
      },
    },
    {
      name: "Sunset",
      preview: "linear-gradient(180deg, #ff6b6b 0%, #feca57 100%)",
      config: {
        text: "SUNSET",
        fontFamily: "Georgia",
        fontSize: 60,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: ["#ff6b6b", "#feca57"],
        },
      },
    },
    {
      name: "Mint Fresh",
      preview: "linear-gradient(180deg, #48c6ef 0%, #6f86d6 100%)",
      config: {
        text: "FRESH",
        fontFamily: "Verdana",
        fontSize: 56,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: ["#48c6ef", "#6f86d6"],
        },
        stroke: "#ffffff",
        strokeWidth: 3,
      },
    },
    {
      name: "Chrome Metal",
      preview: "linear-gradient(180deg, #bdc3c7 0%, #2c3e50 50%, #bdc3c7 100%)",
      config: {
        text: "CHROME",
        fontFamily: "Impact",
        fontSize: 72,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: ["#bdc3c7", "#2c3e50", "#bdc3c7"],
        },
        stroke: "#34495e",
        strokeWidth: 2,
      },
    },
    {
      name: "Rainbow",
      preview:
        "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
      config: {
        text: "RAINBOW",
        fontFamily: "Arial",
        fontSize: 64,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: [
            "#ff0000",
            "#ff7f00",
            "#ffff00",
            "#00ff00",
            "#0000ff",
            "#9400d3",
          ],
        },
        stroke: "#ffffff",
        strokeWidth: 3,
      },
    },
    {
      name: "Retro 80s",
      preview: "linear-gradient(180deg, #f857a6 0%, #ff5858 100%)",
      config: {
        text: "RETRO",
        fontFamily: "Impact",
        fontSize: 68,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: ["#f857a6", "#ff5858"],
        },
        stroke: "#000000",
        strokeWidth: 4,
        shadow: {
          color: "#00ffff",
          blur: 15,
          offsetX: 3,
          offsetY: 3,
        },
      },
    },
    {
      name: "Ice Cold",
      preview: "linear-gradient(180deg, #e0f7fa 0%, #006064 100%)",
      config: {
        text: "ICE",
        fontFamily: "Arial",
        fontSize: 64,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: ["#e0f7fa", "#006064"],
        },
        stroke: "#b2ebf2",
        strokeWidth: 2,
      },
    },
    {
      name: "Lava",
      preview: "linear-gradient(180deg, #ff4e00 0%, #ec9f05 100%)",
      config: {
        text: "LAVA",
        fontFamily: "Impact",
        fontSize: 72,
        fontWeight: "bold",
        gradient: {
          type: "linear",
          colors: ["#ff4e00", "#ec9f05"],
        },
        shadow: {
          color: "#ff0000",
          blur: 30,
          offsetX: 0,
          offsetY: 0,
        },
      },
    },
  ];

  const handleApplyStyle = (style: any) => {
    if (canvasActions) {
      canvasActions.addStyledText(style.config);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Text Styles
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {textStyles.map((style, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform overflow-hidden relative"
              onClick={() => handleApplyStyle(style)}
              style={{
                background: style.preview,
              }}
            >
              <span
                className="text-xs font-bold"
                style={{
                  color:
                    style.name.includes("Neon") || style.name.includes("Ice")
                      ? "#000"
                      : "#fff",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {style.name}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextStylesPanel;
