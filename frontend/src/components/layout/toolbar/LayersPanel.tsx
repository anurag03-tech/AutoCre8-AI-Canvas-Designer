// components/layout/toolbar/LayersPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/contexts/CanvasContext";

interface LayerItem {
  id: number;
  index: number;
  type: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

const LayersPanel: React.FC = () => {
  const { setSelectedObject } = useCanvas();
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getFabricCanvas = () =>
    (typeof window !== "undefined" && (window as any).__fabricCanvas) || null;

  const refreshLayers = () => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const objects = canvas.getObjects();
    const result: LayerItem[] = objects.map((obj: any, index: number) => ({
      id: obj.__uid || index,
      index,
      type: obj.type || "object",
      name: obj.name || obj.text || `${obj.type || "Object"} ${index + 1}`,
      visible: obj.visible !== false,
      locked: !!obj.lockMovementX && !!obj.lockMovementY,
    }));

    // Top of list = top of stack
    setLayers(result.slice().reverse());
  };

  const groupSelected = () => {
    const canvas = getFabricCanvas();
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length <= 1) return;

    const fabricNS = (window as any).fabric;
    if (!fabricNS || !fabricNS.Group) return;

    const group = new fabricNS.Group(active);
    active.forEach((obj: any) => canvas.remove(obj));
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    refreshLayers();
  };

  const ungroupSelected = () => {
    const canvas = getFabricCanvas();
    if (!canvas) return;
    const active: any = canvas.getActiveObject();
    if (!active || active.type !== "group") return;

    const items = active._objects || [];
    active._restoreObjectsState && active._restoreObjectsState();
    canvas.remove(active);
    items.forEach((obj: any) => canvas.add(obj));
    canvas.renderAll();
    refreshLayers();
  };

  useEffect(() => {
    refreshLayers();

    const canvas = getFabricCanvas();
    if (!canvas) return;

    const handler = () => refreshLayers();
    canvas.on("object:added", handler);
    canvas.on("object:removed", handler);
    canvas.on("object:modified", handler);

    return () => {
      canvas.off("object:added", handler);
      canvas.off("object:removed", handler);
      canvas.off("object:modified", handler);
    };
  }, []);

  const selectLayer = (layer: LayerItem) => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const objects = canvas.getObjects();
    // list is reversed, but layer.index already stores original index
    const obj = objects[layer.index];
    if (!obj) return;

    canvas.setActiveObject(obj);
    canvas.renderAll();
    setSelectedObject(obj);
    setSelectedIndex(layer.index);
  };

  const toggleVisibility = (layer: LayerItem) => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const objects = canvas.getObjects();
    const obj = objects[layer.index];
    if (!obj) return;

    obj.visible = !obj.visible;
    canvas.renderAll();
    refreshLayers();
  };

  const toggleLock = (layer: LayerItem) => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const obj = canvas.getObjects()[layer.index];
    if (!obj) return;

    const locked = !(obj.lockMovementX && obj.lockMovementY);
    obj.lockMovementX = locked;
    obj.lockMovementY = locked;
    obj.lockScalingX = locked;
    obj.lockScalingY = locked;
    obj.lockRotation = locked;
    canvas.renderAll();
    refreshLayers();
  };

  const moveLayerUp = (layer: LayerItem) => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const obj = canvas.getObjects()[layer.index];
    if (!obj) return;

    canvas.bringObjectForward(obj);
    canvas.renderAll();
    refreshLayers();
  };

  const moveLayerDown = (layer: LayerItem) => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const obj = canvas.getObjects()[layer.index];
    if (!obj) return;

    canvas.sendObjectBackwards(obj);
    canvas.renderAll();
    refreshLayers();
  };

  const selectAllByType = (type: "text" | "image") => {
    const canvas = getFabricCanvas();
    if (!canvas) return;

    const objects = canvas.getObjects();
    const filtered = objects.filter((obj: any) => {
      if (type === "text") {
        return (
          obj.type === "i-text" || obj.type === "textbox" || obj.type === "text"
        );
      }
      if (type === "image") {
        return obj.type === "image";
      }
      return false;
    });

    if (filtered.length === 0) return;

    const fabricNS = (window as any).fabric;
    if (!fabricNS || !fabricNS.ActiveSelection) return;

    const activeSelection = new fabricNS.ActiveSelection(filtered, { canvas });
    canvas.setActiveObject(activeSelection);
    canvas.renderAll();
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium">Layers</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="xs"
            className="h-6 px-2 text-[11px]"
            onClick={groupSelected}
          >
            Group
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="h-6 px-2 text-[11px]"
            onClick={ungroupSelected}
          >
            Ungroup
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="h-6 px-2 text-[11px]"
            onClick={() => selectAllByType("text")}
          >
            Text
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="h-6 px-2 text-[11px]"
            onClick={() => selectAllByType("image")}
          >
            Images
          </Button>
        </div>
      </div>

      <div className="flex-1 border rounded-md bg-gray-50 overflow-y-auto">
        {layers.length === 0 && (
          <div className="text-xs text-gray-400 p-2">
            No objects yet. Add elements to see layers here.
          </div>
        )}

        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => selectLayer(layer)}
            className={`w-full flex items-center justify-between px-2 py-1 text-xs border-b last:border-b-0 hover:bg-gray-100 cursor-pointer ${
              selectedIndex === layer.index ? "bg-indigo-50" : ""
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase text-gray-400">
                {layer.type}
              </span>
              <span className="truncate max-w-[120px]">{layer.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(layer);
                }}
              >
                {layer.visible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(layer);
                }}
              >
                {layer.locked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Unlock className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerUp(layer);
                }}
              >
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  moveLayerDown(layer);
                }}
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;
