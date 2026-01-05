"use client";

import React from "react";
import { useCanvas } from "@/contexts/CanvasContext";
import ShapeProperties from "./ShapeProperties";
import TextProperties from "./TextProperties";
import ImageProperties from "./ImageProperties";
import CommonProperties from "./CommonProperties";

interface PropertiesProps {
  selectedObject: any;
  onUpdate: (props: any) => void;
  onDelete: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onDuplicate?: () => void;
}

const PropertiesPanel = ({
  selectedObject,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onDuplicate,
}: PropertiesProps) => {
  const { canvasActions } = useCanvas();

  if (!selectedObject) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Select an object to edit properties
      </div>
    );
  }

  const isText =
    selectedObject.type === "i-text" || selectedObject.type === "textbox";
  const isImage = selectedObject.type === "image";
  const isShape = !isText && !isImage;

  return (
    <div className="space-y-6">
      {/* Object Type Header */}
      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase ">
          {selectedObject.type}
        </h4>
      </div>

      {/* Image Transformations */}
      {isImage && (
        <ImageProperties
          selectedObject={selectedObject}
          onUpdate={onUpdate}
          canvasActions={canvasActions}
        />
      )}

      {/* Common Properties (Layer controls, Duplicate, Opacity) */}
      <CommonProperties
        selectedObject={selectedObject}
        onUpdate={onUpdate}
        onBringForward={onBringForward}
        onSendBackward={onSendBackward}
        onBringToFront={onBringToFront}
        onSendToBack={onSendToBack}
        onDuplicate={onDuplicate}
      />

      {/* Text-specific Properties */}
      {isText && (
        <TextProperties selectedObject={selectedObject} onUpdate={onUpdate} />
      )}

      {/* Shape-specific Properties */}
      {isShape && (
        <ShapeProperties selectedObject={selectedObject} onUpdate={onUpdate} />
      )}

      {/* Delete Button */}
      <div className="pt-4 border-t">
        <button
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
          onClick={onDelete}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete Object
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
