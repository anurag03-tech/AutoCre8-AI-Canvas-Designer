"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/contexts/CanvasContext";
import ToolbarIcons from "./toolbar/ToolbarIcons";
import ElementsPanel from "./toolbar/ElementsPanel";
import ImagesPanel from "./toolbar/ImagesPanel";
import TextPanel from "./toolbar/text/TextPanel";
import TextStylesPanel from "./toolbar/text/TextStylesPanel";
import BackgroundPanel from "./toolbar/BackgroundPanel";
import PropertiesPanel from "./toolbar/properties/PropertiesPanel";
import AIAssistantPanel from "./toolbar/AIAssistantPanel";
import LayersPanel from "./toolbar/LayersPanel";
import CompliancePanel from "./toolbar/compliance/CompliancePanel";

export type ToolType =
  | "elements"
  | "images"
  | "text"
  | "background"
  | "layers"
  | "ai assistant"
  | "assets"
  | "collaborates"
  | "compliance"
  | null;

const CanvasToolbox = () => {
  const [activePanel, setActivePanel] = useState<ToolType>(null);
  const { selectedObject, canvasActions } = useCanvas();

  const handlePanelToggle = (panel: ToolType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // Auto-close active panel when an object gets selected
  useEffect(() => {
    if (selectedObject && activePanel) {
      setActivePanel(null);
    }
  }, [selectedObject, activePanel]);

  const showProperties = selectedObject && !activePanel;

  return (
    <div className="flex h-full">
      <ToolbarIcons
        activePanel={activePanel}
        onPanelToggle={handlePanelToggle}
      />

      <div
        className={`
          bg-white border-r border-gray-200 shadow-lg
          transition-all duration-300 ease-in-out overflow-hidden
          ${activePanel || showProperties ? "w-72" : "w-0"}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 capitalize">
              {showProperties ? "Properties" : activePanel || ""}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActivePanel(null);
                if (showProperties && canvasActions) {
                  const fabricCanvas = (window as any).__fabricCanvas;
                  if (fabricCanvas) {
                    fabricCanvas.discardActiveObject();
                    fabricCanvas.renderAll();
                  }
                }
              }}
              className="w-8 h-8 p-0 hover:bg-gray-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* 
               1. PROPERTIES PANEL 
               Rendered conditionally (it's okay if this unmounts/remounts on selection)
            */}
            {showProperties && (
              <PropertiesPanel
                selectedObject={selectedObject}
                onUpdate={canvasActions?.updateSelectedObject || (() => {})}
                onDelete={canvasActions?.deleteSelected || (() => {})}
                onBringForward={canvasActions?.bringForward}
                onSendBackward={canvasActions?.sendBackward}
                onBringToFront={canvasActions?.bringToFront}
                onSendToBack={canvasActions?.sendToBack}
                onDuplicate={canvasActions?.duplicateSelected}
              />
            )}

            {/* 
               2. AI ASSISTANT PANEL - THE FIX
               We moved this OUTSIDE the ternary operator. 
               It is always in the DOM, just hidden via CSS when not active.
               This preserves the chat history/state.
            */}
            <div
              className={
                !showProperties && activePanel === "ai assistant"
                  ? "block"
                  : "hidden"
              }
            >
              <AIAssistantPanel />
            </div>

            {/* 
               3. OTHER STANDARD PANELS
               These are rendered only when properties are hidden.
            */}
            {!showProperties && (
              <>
                {/* Elements Panel */}
                <div
                  className={activePanel === "elements" ? "block" : "hidden"}
                >
                  <ElementsPanel />
                </div>

                {/* Text Panel */}
                <div
                  className={
                    activePanel === "text" ? "block space-y-6" : "hidden"
                  }
                >
                  <TextPanel />
                  <div className="border-t pt-4">
                    <TextStylesPanel />
                  </div>
                </div>

                {/* Images Panel */}
                <div className={activePanel === "images" ? "block" : "hidden"}>
                  <ImagesPanel />
                </div>

                {/* Background Panel */}
                <div
                  className={activePanel === "background" ? "block" : "hidden"}
                >
                  <BackgroundPanel />
                </div>

                {/* Layers Panel */}
                <div className={activePanel === "layers" ? "block" : "hidden"}>
                  <LayersPanel />
                </div>

                {/* Compliance Panel */}
                <div
                  className={activePanel === "compliance" ? "block" : "hidden"}
                >
                  <CompliancePanel />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasToolbox;
