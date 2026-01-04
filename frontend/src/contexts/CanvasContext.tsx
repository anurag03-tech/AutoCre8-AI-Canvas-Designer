// contexts/CanvasContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CanvasData {
  version: string;
  objects: any[];
  background?: string;
  width: number;
  height: number;
}

interface Canvas {
  _id: string;
  name: string;
  description?: string;
  template?: string;
  thumbnail?: string;
  project: {
    _id: string;
    name: string;
  };
  canvasData: CanvasData;
  unit: "px" | "in" | "cm" | "mm";
  createdAt: string;
  updatedAt: string;
}

export interface CanvasActions {
  addShape: (config: any) => void;
  addText: (fontSize?: number, fontFamily?: string) => void;
  addStyledText?: (styleConfig: any) => void;
  addImage: (imageUrl: string) => void;
  applyImageTransformation: (transformation: string) => void;
  changeBackground: (value: string) => void;
  deleteSelected: () => void;
  saveCanvas: () => void;
  updateSelectedObject: (props: any) => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  duplicateSelected: () => void;
  getCanvasJSON: () => any | null;
  loadCanvasJSON: (data: any) => void;
}

interface CanvasContextType {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  updateCanvasName: (name: string) => void;
  updateCanvas: (updates: Partial<Canvas>) => void;
  canvasActions: CanvasActions | null;
  setCanvasActions: (actions: CanvasActions | null) => void;
  selectedObject: any;
  setSelectedObject: (obj: any) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [canvasActions, setCanvasActions] = useState<CanvasActions | null>(
    null
  );
  const [selectedObject, setSelectedObject] = useState<any>(null);

  const updateCanvasName = (name: string) => {
    if (canvas) {
      setCanvas({ ...canvas, name });
    }
  };

  // Update any canvas fields
  const updateCanvas = (updates: Partial<Canvas>) => {
    if (canvas) {
      setCanvas({ ...canvas, ...updates });
    }
  };

  return (
    <CanvasContext.Provider
      value={{
        canvas,
        setCanvas,
        updateCanvasName,
        updateCanvas,
        canvasActions,
        setCanvasActions,
        selectedObject,
        setSelectedObject,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within CanvasProvider");
  }
  return context;
};
