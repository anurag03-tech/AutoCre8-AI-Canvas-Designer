"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface ShapePropertiesProps {
  selectedObject: any;
  onUpdate: (props: any) => void;
}

const ShapeProperties = ({
  selectedObject,
  onUpdate,
}: ShapePropertiesProps) => {
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState<"solid" | "dotted" | "dashed">(
    "solid"
  );
  const [borderRadius, setBorderRadius] = useState(0);

  // ✅ Local state for inputs to allow typing
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [radiusInput, setRadiusInput] = useState("");

  useEffect(() => {
    if (selectedObject) {
      setStrokeColor(selectedObject.stroke || "#000000");
      setStrokeWidth(selectedObject.strokeWidth || 0);
      setBorderRadius(selectedObject.rx || 0);

      // Set input values
      if (selectedObject.type === "rect") {
        setWidthInput(
          Math.round(selectedObject.width * selectedObject.scaleX).toString()
        );
        setHeightInput(
          Math.round(selectedObject.height * selectedObject.scaleY).toString()
        );
      } else if (selectedObject.type === "circle") {
        setRadiusInput(Math.round(selectedObject.radius).toString());
      }

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

  const handleBorderRadiusChange = (value: number[]) => {
    setBorderRadius(value[0]);
    onUpdate({ rx: value[0], ry: value[0] });
  };

  // ✅ Handle width input with proper updates
  const handleWidthChange = (value: string) => {
    setWidthInput(value);
  };

  const handleWidthBlur = () => {
    const numValue = parseInt(widthInput) || 0;
    onUpdate({ width: numValue, scaleX: 1 });
  };

  // ✅ Handle height input with proper updates
  const handleHeightChange = (value: string) => {
    setHeightInput(value);
  };

  const handleHeightBlur = () => {
    const numValue = parseInt(heightInput) || 0;
    onUpdate({ height: numValue, scaleY: 1 });
  };

  // ✅ Handle radius input
  const handleRadiusChange = (value: string) => {
    setRadiusInput(value);
  };

  const handleRadiusBlur = () => {
    const numValue = parseInt(radiusInput) || 0;
    onUpdate({ radius: numValue });
  };

  return (
    <>
      {/* Border Color */}
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

      {/* Border Width */}
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

      {/* Border Style */}
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

      {/* Size Controls for Rect */}
      {selectedObject.type === "rect" && (
        <>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Width
            </Label>
            <Input
              type="number"
              value={widthInput}
              onChange={(e) => handleWidthChange(e.target.value)}
              onBlur={handleWidthBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleWidthBlur();
              }}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
              Height
            </Label>
            <Input
              type="number"
              value={heightInput}
              onChange={(e) => handleHeightChange(e.target.value)}
              onBlur={handleHeightBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleHeightBlur();
              }}
              className="w-full"
            />
          </div>
        </>
      )}

      {/* Radius Control for Circle */}
      {selectedObject.type === "circle" && (
        <div>
          <Label className="text-xs font-semibold text-gray-700 mb-2 block">
            Radius
          </Label>
          <Input
            type="number"
            value={radiusInput}
            onChange={(e) => handleRadiusChange(e.target.value)}
            onBlur={handleRadiusBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRadiusBlur();
            }}
            className="w-full"
          />
        </div>
      )}
    </>
  );
};

export default ShapeProperties;
