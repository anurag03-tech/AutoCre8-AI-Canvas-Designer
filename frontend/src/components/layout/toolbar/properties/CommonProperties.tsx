// "use client";

// import React, { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
// import { Button } from "@/components/ui/button";
// import {
//   ArrowUp,
//   ArrowDown,
//   ChevronsUp,
//   ChevronsDown,
//   Copy,
//   Layers,
// } from "lucide-react";

// interface CommonPropertiesProps {
//   selectedObject: any;
//   onUpdate: (props: any) => void;
//   onBringForward?: () => void;
//   onSendBackward?: () => void;
//   onBringToFront?: () => void;
//   onSendToBack?: () => void;
//   onDuplicate?: () => void;
// }

// const CommonProperties = ({
//   selectedObject,
//   onUpdate,
//   onBringForward,
//   onSendBackward,
//   onBringToFront,
//   onSendToBack,
//   onDuplicate,
// }: CommonPropertiesProps) => {
//   const [opacity, setOpacity] = useState(100);
//   const [fillColor, setFillColor] = useState("#3b82f6");
//   const [hasGradient, setHasGradient] = useState(false);
//   const [gradientColors, setGradientColors] = useState<string[]>([]);

//   useEffect(() => {
//     if (selectedObject) {
//       setOpacity((selectedObject.opacity || 1) * 100);

//       // Check for gradient
//       const isGradient =
//         typeof selectedObject.fill === "object" &&
//         selectedObject.fill !== null &&
//         selectedObject.fill.colorStops !== undefined;

//       setHasGradient(isGradient);

//       if (isGradient) {
//         const gradient = selectedObject.fill as any;
//         const colors = gradient.colorStops.map((stop: any) => stop.color);
//         setGradientColors(colors);
//         setFillColor(colors[0] || "#3b82f6");
//       } else {
//         setGradientColors([]);
//         setFillColor(selectedObject.fill || "#3b82f6");
//       }
//     }
//   }, [selectedObject]);

//   const handleOpacityChange = (value: number[]) => {
//     setOpacity(value[0]);
//     onUpdate({ opacity: value[0] / 100 });
//   };

//   const handleFillChange = (color: string) => {
//     setFillColor(color);

//     if (hasGradient && gradientColors.length > 0) {
//       const { Gradient } = require("fabric");
//       const newColors = [...gradientColors];
//       newColors[0] = color;

//       const fabricGradient = new Gradient({
//         type: "linear",
//         gradientUnits: "pixels",
//         coords: {
//           x1: 0,
//           y1: 0,
//           x2: 0,
//           y2: selectedObject.height || 100,
//         },
//         colorStops: newColors.map((c: string, i: number) => ({
//           offset: i / (newColors.length - 1),
//           color: c,
//         })),
//       });

//       setGradientColors(newColors);
//       onUpdate({ fill: fabricGradient });
//     } else {
//       onUpdate({ fill: color });
//     }
//   };

//   return (
//     <>
//       {/* Layer Order */}
//       <div>
//         <Label className="text-xs font-semibold text-gray-700 mb-2 block flex items-center gap-2">
//           <Layers className="w-4 h-4" />
//           Layer Order
//         </Label>
//         <div className="grid grid-cols-2 gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onBringToFront}
//             className="flex items-center gap-1"
//           >
//             <ChevronsUp className="w-4 h-4" />
//             <span className="text-xs">To Front</span>
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onBringForward}
//             className="flex items-center gap-1"
//           >
//             <ArrowUp className="w-4 h-4" />
//             <span className="text-xs">Forward</span>
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onSendBackward}
//             className="flex items-center gap-1"
//           >
//             <ArrowDown className="w-4 h-4" />
//             <span className="text-xs">Backward</span>
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onSendToBack}
//             className="flex items-center gap-1"
//           >
//             <ChevronsDown className="w-4 h-4" />
//             <span className="text-xs">To Back</span>
//           </Button>
//         </div>
//       </div>

//       {/* Duplicate */}
//       <div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={onDuplicate}
//           className="w-full flex items-center justify-center gap-2"
//         >
//           <Copy className="w-4 h-4" />
//           Duplicate
//         </Button>
//       </div>

//       {/* Fill Color (not for images or lines) */}
//       {selectedObject.type !== "line" && selectedObject.type !== "image" && (
//         <div>
//           <Label className="text-xs font-semibold text-gray-700 mb-2 block">
//             {selectedObject.type === "i-text" ? "Text Color" : "Fill Color"}
//             {hasGradient && (
//               <span className="ml-2 text-xs font-normal text-purple-600">
//                 (Gradient)
//               </span>
//             )}
//           </Label>

//           {hasGradient && gradientColors.length > 1 && (
//             <div className="flex gap-1 mb-2">
//               {gradientColors.map((color, index) => (
//                 <div
//                   key={index}
//                   className="w-6 h-6 rounded border border-gray-300"
//                   style={{ backgroundColor: color }}
//                   title={color}
//                 />
//               ))}
//             </div>
//           )}

//           <div className="flex gap-2">
//             <Input
//               type="color"
//               value={fillColor}
//               onChange={(e) => handleFillChange(e.target.value)}
//               className="w-16 h-10 p-1 cursor-pointer"
//             />
//             <Input
//               type="text"
//               value={fillColor}
//               onChange={(e) => handleFillChange(e.target.value)}
//               className="flex-1 uppercase text-xs"
//             />
//           </div>

//           {hasGradient && (
//             <p className="text-xs text-gray-500 mt-1">
//               Editing primary gradient color
//             </p>
//           )}
//         </div>
//       )}

//       {/* Opacity */}
//       <div>
//         <Label className="text-xs font-semibold text-gray-700 mb-2 block">
//           Opacity: {opacity}%
//         </Label>
//         <Slider
//           value={[opacity]}
//           onValueChange={handleOpacityChange}
//           max={100}
//           step={1}
//           className="w-full"
//         />
//       </div>
//     </>
//   );
// };

// export default CommonProperties;

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Copy,
  Layers,
} from "lucide-react";

interface CommonPropertiesProps {
  selectedObject: any;
  onUpdate: (props: any) => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onDuplicate?: () => void;
}

const CommonProperties = ({
  selectedObject,
  onUpdate,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onDuplicate,
}: CommonPropertiesProps) => {
  const [opacity, setOpacity] = useState(100);
  const [fillColor, setFillColor] = useState("#3b82f6");
  const [hasGradient, setHasGradient] = useState(false);
  const [gradientColors, setGradientColors] = useState<string[]>([]);

  useEffect(() => {
    if (selectedObject) {
      setOpacity((selectedObject.opacity || 1) * 100);

      // Check for gradient
      const isGradient =
        typeof selectedObject.fill === "object" &&
        selectedObject.fill !== null &&
        selectedObject.fill.colorStops !== undefined;

      setHasGradient(isGradient);

      if (isGradient) {
        const gradient = selectedObject.fill as any;
        const colors = gradient.colorStops.map((stop: any) => stop.color);
        setGradientColors(colors);
        setFillColor(colors[0] || "#3b82f6");
      } else {
        setGradientColors([]);
        setFillColor(selectedObject.fill || "#3b82f6");
      }
    }
  }, [selectedObject]);

  const handleOpacityChange = (value: number[]) => {
    setOpacity(value[0]);
    onUpdate({ opacity: value[0] / 100 });
  };

  const handleFillChange = (color: string) => {
    setFillColor(color);
    onUpdate({ fill: color });
  };

  // ✅ Update individual gradient color
  const handleGradientColorChange = (index: number, color: string) => {
    const { Gradient } = require("fabric");
    const newColors = [...gradientColors];
    newColors[index] = color;

    const fabricGradient = new Gradient({
      type: "linear",
      gradientUnits: "pixels",
      coords: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: selectedObject.height || 100,
      },
      colorStops: newColors.map((c: string, i: number) => ({
        offset: i / (newColors.length - 1),
        color: c,
      })),
    });

    setGradientColors(newColors);
    onUpdate({ fill: fabricGradient });
  };

  return (
    <>
      {/* Layer Order */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Layer Order
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBringToFront}
            className="flex items-center gap-1 cursor-pointer"
          >
            <ChevronsUp className="w-4 h-4" />
            <span className="text-xs">To Front</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBringForward}
            className="flex items-center gap-1 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="text-xs">Forward</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSendBackward}
            className="flex items-center gap-1 cursor-pointer"
          >
            <ArrowDown className="w-4 h-4" />
            <span className="text-xs">Backward</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSendToBack}
            className="flex items-center gap-1 cursor-pointer"
          >
            <ChevronsDown className="w-4 h-4" />
            <span className="text-xs">To Back</span>
          </Button>
        </div>
      </div>

      {/* Duplicate */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={onDuplicate}
          className="w-full flex items-center justify-center gap-2 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </Button>
      </div>

      {/* Fill Color or Gradient Colors */}
      {selectedObject.type !== "line" && selectedObject.type !== "image" && (
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
            {selectedObject.type === "i-text" ||
            selectedObject.type === "textbox"
              ? "Text Color"
              : "Fill Color"}
            {hasGradient && (
              <span className="ml-2 text-xs font-normal text-purple-600">
                (Gradient)
              </span>
            )}
          </Label>

          {hasGradient && gradientColors.length > 0 ? (
            // ✅ Show all gradient colors with individual pickers
            <div className="space-y-3">
              {gradientColors.map((color, index) => (
                <div key={index}>
                  <Label className="text-xs text-gray-500 mb-1 block">
                    Color {index + 1}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) =>
                        handleGradientColorChange(index, e.target.value)
                      }
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) =>
                        handleGradientColorChange(index, e.target.value)
                      }
                      className="flex-1 uppercase text-xs"
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">
                ✨ Gradient with {gradientColors.length} colors
              </p>
            </div>
          ) : (
            // ✅ Regular solid color picker
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
          )}
        </div>
      )}

      {/* Opacity */}
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
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
    </>
  );
};

export default CommonProperties;
