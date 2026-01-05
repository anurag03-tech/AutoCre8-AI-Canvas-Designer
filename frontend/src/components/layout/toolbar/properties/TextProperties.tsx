"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface TextPropertiesProps {
  selectedObject: any;
  onUpdate: (props: any) => void;
}

const TextProperties = ({ selectedObject, onUpdate }: TextPropertiesProps) => {
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [fontSizeInput, setFontSizeInput] = useState("");

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

  useEffect(() => {
    if (selectedObject) {
      setStrokeColor(selectedObject.stroke || "#000000");
      setStrokeWidth(selectedObject.strokeWidth || 0);
      setFontSizeInput((selectedObject.fontSize || 24).toString());
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

  const handleFontSizeChange = (value: string) => {
    setFontSizeInput(value);
  };

  const handleFontSizeBlur = () => {
    const numValue = parseInt(fontSizeInput) || 24;
    onUpdate({ fontSize: numValue });
  };

  return (
    <>
      {/* Font Family */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
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

      {/* Font Size */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Font Size
        </Label>
        <Input
          type="number"
          value={fontSizeInput}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          onBlur={handleFontSizeBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleFontSizeBlur();
          }}
          className="w-full"
        />
      </div>

      {/* Font Weight */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
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

      {/* Text Align */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Text Align
        </Label>
        <div className="grid grid-cols-3 gap-2 ">
          <Button
            size="sm"
            variant={
              selectedObject.textAlign === "left" ? "default" : "outline"
            }
            onClick={() => onUpdate({ textAlign: "left" })}
            className="text-xs cursor-pointer"
          >
            Left
          </Button>
          <Button
            size="sm"
            variant={
              selectedObject.textAlign === "center" ? "default" : "outline"
            }
            onClick={() => onUpdate({ textAlign: "center" })}
            className="text-xs cursor-pointer"
          >
            Center
          </Button>
          <Button
            size="sm"
            variant={
              selectedObject.textAlign === "right" ? "default" : "outline"
            }
            onClick={() => onUpdate({ textAlign: "right" })}
            className="text-xs cursor-pointer"
          >
            Right
          </Button>
        </div>
      </div>

      {/* Text Outline Color */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
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

      {/* Outline Width */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
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
          <p className="text-xs text-gray-500 mt-1">Set to 1+ to add outline</p>
        )}
      </div>
    </>
  );
};

export default TextProperties;
