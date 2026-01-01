// components/layout/canvasToolbox.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/contexts/CanvasContext";
import ToolbarIcons from "./toolbar/ToolbarIcons";
import ElementsPanel from "./toolbar/ElementsPanel";
import ImagesPanel from "./toolbar/ImagesPanel";
import TextPanel from "./toolbar/TextPanel";
import TextStylesPanel from "./toolbar/TextStylesPanel";
import BackgroundPanel from "./toolbar/BackgroundPanel";
import PropertiesPanel from "./toolbar/PropertiesPanel";
import ProjectGalleryPanel from "./toolbar/ProjectGalleryPanel";
import AIAssistantPanel from "./toolbar/AIAssistantPanel";
import LayersPanel from "./toolbar/LayersPanel";

export type ToolType =
  | "elements"
  | "images"
  | "text"
  | "background"
  | "layers"
  | "ai"
  | "brand"
  | "collaborates"
  | null;

const CanvasToolbox = () => {
  const [activePanel, setActivePanel] = useState<ToolType>(null);
  const { selectedObject, canvasActions } = useCanvas();

  const handlePanelToggle = (panel: ToolType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // auto-close active panel when an object gets selected
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
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
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
              className="w-8 h-8 p-0 hover:bg-gray-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {showProperties ? (
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
            ) : (
              <>
                {activePanel === "elements" && <ElementsPanel />}

                {activePanel === "text" && (
                  <div className="space-y-6">
                    <TextPanel />
                    <div className="border-t pt-4">
                      <TextStylesPanel />
                    </div>
                  </div>
                )}

                {activePanel === "images" && (
                  <div className="space-y-6">
                    <ImagesPanel />
                    <div className="border-t pt-4">
                      <ProjectGalleryPanel />
                    </div>
                  </div>
                )}

                {activePanel === "background" && <BackgroundPanel />}

                {activePanel === "ai" && <AIAssistantPanel />}

                {activePanel === "layers" && <LayersPanel />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasToolbox;
