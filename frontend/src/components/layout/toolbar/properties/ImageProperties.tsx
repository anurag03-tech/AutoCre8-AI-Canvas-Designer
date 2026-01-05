"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eraser, Sparkles, ImageIcon, Contrast, Zap } from "lucide-react";

interface ImagePropertiesProps {
  selectedObject: any;
  onUpdate: (props: any) => void;
  canvasActions: any;
}

const ImageProperties = ({
  selectedObject,
  onUpdate,
  canvasActions,
}: ImagePropertiesProps) => {
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");

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
      const currentWidth = Math.round(
        (selectedObject.width || 0) * (selectedObject.scaleX || 1)
      );
      const currentHeight = Math.round(
        (selectedObject.height || 0) * (selectedObject.scaleY || 1)
      );
      setWidthInput(currentWidth.toString());
      setHeightInput(currentHeight.toString());
    }
  }, [selectedObject]);

  const handleWidthChange = (value: string) => {
    setWidthInput(value);
  };

  const handleWidthBlur = () => {
    const newWidth = parseInt(widthInput) || 100;
    const scaleX = newWidth / (selectedObject.width || 1);
    onUpdate({ scaleX });
  };

  const handleHeightChange = (value: string) => {
    setHeightInput(value);
  };

  const handleHeightBlur = () => {
    const newHeight = parseInt(heightInput) || 100;
    const scaleY = newHeight / (selectedObject.height || 1);
    onUpdate({ scaleY });
  };

  return (
    <>
      {/* Image Transformations */}
      <div className="border-b pb-4">
        <Label className=" font-semibold text-gray-700 mb-3 block">
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
                  <span className="text-xs font-medium">{transform.label}</span>
                  <span className="text-[10px] text-gray-500">
                    {transform.description}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">Powered by ImageKit.io</p>
      </div>

      {/* Image Size Controls */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Image Size
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-500">Width</Label>
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
            <Label className="text-xs text-gray-500">Height</Label>
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
        </div>
      </div>
    </>
  );
};

export default ImageProperties;
