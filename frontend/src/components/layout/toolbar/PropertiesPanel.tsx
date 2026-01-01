"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Copy,
  Layers,
  Eraser,
  Sparkles,
  ImageIcon,
  Contrast,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/contexts/CanvasContext";

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
  const { canvasActions } = useCanvas(); // ✅ Add this to access applyImageTransformation
  const [fillColor, setFillColor] = useState("#3b82f6");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState<"solid" | "dotted" | "dashed">(
    "solid"
  );
  const [opacity, setOpacity] = useState(100);
  const [borderRadius, setBorderRadius] = useState(0);

  const fonts = [
    "Arial",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
    "Comic Sans MS",
    "Impact",
    "Trebuchet MS",
    "Palatino",
    "Garamond",
    "Helvetica",
    "Tahoma",
    "Brush Script MT",
    "Lucida Console",
    "Monaco",
  ];

  // ✅ ImageKit transformations
  const imageTransformations = [
    {
      id: "removeBg",
      label: "Remove Background",
      icon: Eraser,
      description: "AI background removal",
    },
    {
      id: "autoEnhance",
      label: "Auto Enhance",
      icon: Sparkles,
      description: "Contrast + Sharpness",
    },
    {
      id: "grayscale",
      label: "Grayscale",
      icon: ImageIcon,
      description: "Black & white",
    },
    {
      id: "blur",
      label: "Blur",
      icon: Contrast,
      description: "Blur effect",
    },
    {
      id: "sharpen",
      label: "Sharpen",
      icon: Zap,
      description: "Sharpen details",
    },
  ];

  useEffect(() => {
    if (selectedObject) {
      setFillColor(selectedObject.fill || "#3b82f6");
      setStrokeColor(selectedObject.stroke || "#000000");
      setStrokeWidth(selectedObject.strokeWidth || 0);
      setOpacity((selectedObject.opacity || 1) * 100);
      setBorderRadius(selectedObject.rx || 0);

      const dashArray = selectedObject.strokeDashArray;
      if (!dashArray || dashArray.length === 0) {
        setStrokeStyle("solid");
      } else if (dashArray[0] === 1) {
        setStrokeStyle("dotted");
      } else {
        setStrokeStyle("dashed");
      }
    }
  }, [selectedObject]);

  if (!selectedObject) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Select an object to edit properties
      </div>
    );
  }

  const handleFillChange = (color: string) => {
    setFillColor(color);
    onUpdate({ fill: color });
  };

  const handleStrokeChange = (color: string) => {
    setStrokeColor(color);
    onUpdate({ stroke: color });
  };

  const handleStrokeWidthChange = (value: number[]) => {
    setStrokeWidth(value[0]);
    onUpdate({ strokeWidth: value[0] });
  };

  const handleStrokeStyleChange = (style: "solid" | "dotted" | "dashed") => {
    setStrokeStyle(style);
    let strokeDashArray: number[] | null = null;

    switch (style) {
      case "dotted":
        strokeDashArray = [1, 3];
        break;
      case "dashed":
        strokeDashArray = [5, 5];
        break;
      default:
        strokeDashArray = null;
    }

    onUpdate({ strokeDashArray });
  };

  const handleOpacityChange = (value: number[]) => {
    setOpacity(value[0]);
    onUpdate({ opacity: value[0] / 100 });
  };

  const handleBorderRadiusChange = (value: number[]) => {
    setBorderRadius(value[0]);
    onUpdate({ rx: value[0], ry: value[0] });
  };

  return (
    <div className="space-y-6">
      {/* Object Type */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          {selectedObject.type}
        </h4>
      </div>

      {/* ✅ IMAGE TRANSFORMATIONS SECTION - Add at top for images */}
      {selectedObject.type === "image" && (
        <div className="border-b pb-4">
          <Label className="text-xs font-semibold text-gray-700 mb-3 block">
            Image Transformations
          </Label>
          <div className="space-y-2">
            {imageTransformations.map((transform) => {
              const Icon = transform.icon;
              return (
                <Button
                  key={transform.id}
                  variant="outline"
                  className="w-full h-auto flex items-start gap-3 justify-start hover:bg-blue-50 hover:border-blue-300 p-3"
                  onClick={() =>
                    canvasActions?.applyImageTransformation?.(transform.id)
                  }
                >
                  <Icon className="w-4 h-4 text-gray-700 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-medium">
                      {transform.label}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {transform.description}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Powered by ImageKit.io
          </p>
        </div>
      )}

      {/* Layering Controls */}
      <div>
        <Label className="text-xs font-semibold text-gray-700 mb-2 block flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Layer Order
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBringToFront}
            className="flex items-center gap-1"
          >
            <ChevronsUp className="w-4 h-4" />
            <span className="text-xs">To Front</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBringForward}
            className="flex items-center gap-1"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="text-xs">Forward</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSendBackward}
            className="flex items-center gap-1"
          >
            <ArrowDown className="w-4 h-4" />
            <span className="text-xs">Backward</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSendToBack}
            className="flex items-center gap-1"
          >
            <ChevronsDown className="w-4 h-4" />
            <span className="text-xs">To Back</span>
          </Button>
        </div>
      </div>

      {/* Duplicate Button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={onDuplicate}
          className="w-full flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </Button>
      </div>

      {/* Fill Color */}
      {selectedObject.type !== "line" && selectedObject.type !== "image" && (
        <div>
          <Label className="text-xs font-semibold text-gray-700 mb-2 block">
            {selectedObject.type === "i-text" ? "Text Color" : "Fill Color"}
          </Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={fillColor}
              onChange={(e) => handleFillChange(e.target.value)}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={fillColor}
              onChange={(e) => handleFillChange(e.target.value)}
              className="flex-1 uppercase text-xs"
            />
          </div>
        </div>
      )}

      {/* Text Outline/Stroke */}
      {selectedObject.type === "i-text" && (
        <>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Text Outline Color
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={strokeColor}
                onChange={(e) => handleStrokeChange(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={strokeColor}
                onChange={(e) => handleStrokeChange(e.target.value)}
                className="flex-1 uppercase text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Outline Width: {strokeWidth}px
            </Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={handleStrokeWidthChange}
              max={10}
              step={1}
              className="w-full"
            />
            {strokeWidth === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Set to 1+ to add outline
              </p>
            )}
          </div>
        </>
      )}

      {/* Stroke Color for Shapes */}
      {selectedObject.type !== "i-text" &&
        selectedObject.type !== "line" &&
        selectedObject.type !== "image" && (
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Border Color
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={strokeColor}
                onChange={(e) => handleStrokeChange(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={strokeColor}
                onChange={(e) => handleStrokeChange(e.target.value)}
                className="flex-1 uppercase text-xs"
              />
            </div>
          </div>
        )}

      {/* Stroke Width for Shapes */}
      {selectedObject.type !== "i-text" &&
        selectedObject.type !== "line" &&
        selectedObject.type !== "image" && (
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Border Width: {strokeWidth}px
            </Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={handleStrokeWidthChange}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        )}

      {/* Border Style for Shapes */}
      {selectedObject.type !== "i-text" &&
        selectedObject.type !== "line" &&
        selectedObject.type !== "image" && (
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Border Style
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant={strokeStyle === "solid" ? "default" : "outline"}
                onClick={() => handleStrokeStyleChange("solid")}
                className="text-xs"
              >
                Solid
              </Button>
              <Button
                size="sm"
                variant={strokeStyle === "dotted" ? "default" : "outline"}
                onClick={() => handleStrokeStyleChange("dotted")}
                className="text-xs"
              >
                Dotted
              </Button>
              <Button
                size="sm"
                variant={strokeStyle === "dashed" ? "default" : "outline"}
                onClick={() => handleStrokeStyleChange("dashed")}
                className="text-xs"
              >
                Dashed
              </Button>
            </div>
          </div>
        )}

      {/* Border Radius (only for rects) */}
      {selectedObject.type === "rect" && (
        <div>
          <Label className="text-xs font-semibold text-gray-700 mb-2 block">
            Border Radius: {borderRadius}px
          </Label>
          <Slider
            value={[borderRadius]}
            onValueChange={handleBorderRadiusChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Opacity */}
      <div>
        <Label className="text-xs font-semibold text-gray-700 mb-2 block">
          Opacity: {opacity}%
        </Label>
        <Slider
          value={[opacity]}
          onValueChange={handleOpacityChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* ✅ Image Size Controls */}
      {selectedObject.type === "image" && (
        <>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Image Size
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500">Width</Label>
                <Input
                  type="number"
                  value={Math.round(
                    (selectedObject.width || 0) * (selectedObject.scaleX || 1)
                  )}
                  onChange={(e) => {
                    const newWidth = parseInt(e.target.value);
                    const scaleX = newWidth / (selectedObject.width || 1);
                    onUpdate({ scaleX });
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Height</Label>
                <Input
                  type="number"
                  value={Math.round(
                    (selectedObject.height || 0) * (selectedObject.scaleY || 1)
                  )}
                  onChange={(e) => {
                    const newHeight = parseInt(e.target.value);
                    const scaleY = newHeight / (selectedObject.height || 1);
                    onUpdate({ scaleY });
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Size (for shapes) */}
      {selectedObject.type === "rect" && (
        <>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Width
            </Label>
            <Input
              type="number"
              value={Math.round(selectedObject.width * selectedObject.scaleX)}
              onChange={(e) =>
                onUpdate({
                  width: parseInt(e.target.value),
                  scaleX: 1,
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Height
            </Label>
            <Input
              type="number"
              value={Math.round(selectedObject.height * selectedObject.scaleY)}
              onChange={(e) =>
                onUpdate({
                  height: parseInt(e.target.value),
                  scaleY: 1,
                })
              }
              className="w-full"
            />
          </div>
        </>
      )}

      {selectedObject.type === "circle" && (
        <div>
          <Label className="text-xs font-semibold text-gray-700 mb-2 block">
            Radius
          </Label>
          <Input
            type="number"
            value={Math.round(selectedObject.radius)}
            onChange={(e) =>
              onUpdate({
                radius: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
        </div>
      )}

      {/* Text Properties */}
      {selectedObject.type === "i-text" && (
        <>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Font Family
            </Label>
            <select
              value={selectedObject.fontFamily || "Arial"}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ fontFamily: selectedObject.fontFamily || "Arial" }}
            >
              {fonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Font Size
            </Label>
            <Input
              type="number"
              value={selectedObject.fontSize}
              onChange={(e) =>
                onUpdate({
                  fontSize: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Font Weight
            </Label>
            <select
              value={selectedObject.fontWeight || "normal"}
              onChange={(e) => onUpdate({ fontWeight: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="600">Semi Bold</option>
              <option value="300">Light</option>
            </select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Text Align
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant={
                  selectedObject.textAlign === "left" ? "default" : "outline"
                }
                onClick={() => onUpdate({ textAlign: "left" })}
                className="text-xs"
              >
                Left
              </Button>
              <Button
                size="sm"
                variant={
                  selectedObject.textAlign === "center" ? "default" : "outline"
                }
                onClick={() => onUpdate({ textAlign: "center" })}
                className="text-xs"
              >
                Center
              </Button>
              <Button
                size="sm"
                variant={
                  selectedObject.textAlign === "right" ? "default" : "outline"
                }
                onClick={() => onUpdate({ textAlign: "right" })}
                className="text-xs"
              >
                Right
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Button */}
      <div className="pt-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={onDelete}
          size="sm"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Object
        </Button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
