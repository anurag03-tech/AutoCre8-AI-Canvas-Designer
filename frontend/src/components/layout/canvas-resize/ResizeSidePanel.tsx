// // // // "use client";

// // // // import React from "react";
// // // // import { Button } from "@/components/ui/button";
// // // // import { Label } from "@/components/ui/label";
// // // // import { X } from "lucide-react";
// // // // import { CANVAS_TEMPLATES } from "@/lib/constants";

// // // // interface ResizeSidePanelProps {
// // // //   selectedTemplate: string;
// // // //   customWidth: string;
// // // //   customHeight: string;
// // // //   onBack: () => void;
// // // //   onConfirm: () => void;
// // // //   isResizing: boolean;
// // // // }

// // // // export const ResizeSidePanel = ({
// // // //   selectedTemplate,
// // // //   customWidth,
// // // //   customHeight,
// // // //   onBack,
// // // //   onConfirm,
// // // //   isResizing,
// // // // }: ResizeSidePanelProps) => {
// // // //   return (
// // // //     <div className="w-[780px] border-l bg-gray-50 p-4 max-h-[700px] overflow-y-auto">
// // // //       <div className="space-y-6">
// // // //         <div className="flex items-center justify-between">
// // // //           <h3 className="font-semibold text-lg">Confirm Resize</h3>
// // // //           <Button
// // // //             variant="ghost"
// // // //             size="sm"
// // // //             onClick={onBack}
// // // //             className="h-8 w-8 p-0"
// // // //           >
// // // //             <X className="h-4 w-4" />
// // // //           </Button>
// // // //         </div>

// // // //         <div className="space-y-4 p-4 border rounded-lg bg-white">
// // // //           {selectedTemplate ? (
// // // //             <>
// // // //               <div className="text-sm">
// // // //                 <span className="text-gray-600">Template:</span>
// // // //                 <span className="ml-2 font-medium">
// // // //                   {
// // // //                     CANVAS_TEMPLATES[
// // // //                       selectedTemplate as keyof typeof CANVAS_TEMPLATES
// // // //                     ]?.label
// // // //                   }
// // // //                 </span>
// // // //               </div>
// // // //               <div className="text-sm">
// // // //                 <span className="text-gray-600">Dimensions:</span>
// // // //                 <span className="ml-2 font-medium">
// // // //                   {
// // // //                     CANVAS_TEMPLATES[
// // // //                       selectedTemplate as keyof typeof CANVAS_TEMPLATES
// // // //                     ]?.width
// // // //                   }{" "}
// // // //                   ×{" "}
// // // //                   {
// // // //                     CANVAS_TEMPLATES[
// // // //                       selectedTemplate as keyof typeof CANVAS_TEMPLATES
// // // //                     ]?.height
// // // //                   }{" "}
// // // //                   px
// // // //                 </span>
// // // //               </div>
// // // //             </>
// // // //           ) : (
// // // //             <>
// // // //               <div className="text-sm">
// // // //                 <span className="text-gray-600">Template:</span>
// // // //                 <span className="ml-2 font-medium">Custom Size</span>
// // // //               </div>
// // // //               <div className="text-sm">
// // // //                 <span className="text-gray-600">Dimensions:</span>
// // // //                 <span className="ml-2 font-medium">
// // // //                   {customWidth} × {customHeight} px
// // // //                 </span>
// // // //               </div>
// // // //             </>
// // // //           )}
// // // //         </div>

// // // //         {/* Advanced Options */}
// // // //         <div className="space-y-3">
// // // //           <Label className="text-sm font-semibold">Advanced Options</Label>
// // // //           <div className="p-8 border-2 border-dashed rounded-lg text-center text-sm text-gray-400 bg-white">
// // // //             Coming soon...
// // // //           </div>
// // // //         </div>

// // // //         {/* Action Buttons */}
// // // //         <div className="flex gap-3 pt-4">
// // // //           <Button variant="outline" onClick={onBack} className="flex-1">
// // // //             Back
// // // //           </Button>
// // // //           <Button onClick={onConfirm} disabled={isResizing} className="flex-1">
// // // //             {isResizing ? "Resizing..." : "Confirm Resize"}
// // // //           </Button>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // "use client";

// // // import React, { useState, useEffect } from "react";
// // // import { Button } from "@/components/ui/button";
// // // import { Label } from "@/components/ui/label";
// // // import { X, Loader2 } from "lucide-react";

// // // interface ResizeSidePanelProps {
// // //   canvasData: any;
// // //   canvasScreenshot: string | null;
// // //   onStartClick: () => void;
// // //   onClose: () => void;
// // // }

// // // export const ResizeSidePanel = ({
// // //   canvasData,
// // //   canvasScreenshot,
// // //   onStartClick,
// // //   onClose,
// // // }: ResizeSidePanelProps) => {
// // //   const [previewHtml, setPreviewHtml] = useState<string>("");
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string>("");

// // //   useEffect(() => {
// // //     generatePreview();
// // //   }, []);

// // //   const generatePreview = async () => {
// // //     setLoading(true);
// // //     setError("");

// // //     try {
// // //       const response = await fetch("/api/ai/generate-canvas-preview", {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({
// // //           canvasData,
// // //           canvasScreenshot,
// // //         }),
// // //       });

// // //       const result = await response.json();

// // //       if (result.success) {
// // //         setPreviewHtml(result.previewHtml);
// // //       } else {
// // //         setError(result.error || "Failed to generate preview");
// // //       }
// // //     } catch (err) {
// // //       console.error("Preview generation error:", err);
// // //       setError("Failed to generate preview");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="w-[780px] border-l bg-gray-50 p-4 max-h-[700px] overflow-y-auto">
// // //       <div className="space-y-6">
// // //         {/* Header */}
// // //         <div className="flex items-center justify-between">
// // //           <h3 className="font-semibold text-lg">Canvas Preview</h3>
// // //           <Button
// // //             variant="ghost"
// // //             size="sm"
// // //             onClick={onClose}
// // //             className="h-8 w-8 p-0"
// // //             disabled={loading}
// // //           >
// // //             <X className="h-4 w-4" />
// // //           </Button>
// // //         </div>

// // //         {/* Preview Section */}
// // //         <div className="space-y-3">
// // //           <Label className="text-sm font-semibold">AI Generated Preview</Label>

// // //           {loading ? (
// // //             <div className="p-12 border-2 border-dashed rounded-lg text-center bg-white flex flex-col items-center gap-4">
// // //               <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
// // //               <p className="text-sm text-gray-500">Generating AI preview...</p>
// // //               <p className="text-xs text-gray-400">
// // //                 Analyzing your canvas and creating preview
// // //               </p>
// // //             </div>
// // //           ) : error ? (
// // //             <div className="p-8 border-2 border-red-200 rounded-lg text-center bg-red-50">
// // //               <p className="text-sm text-red-600 mb-4">{error}</p>
// // //               <Button variant="outline" size="sm" onClick={generatePreview}>
// // //                 Retry
// // //               </Button>
// // //             </div>
// // //           ) : (
// // //             <div className="border rounded-lg bg-white overflow-hidden">
// // //               <div
// // //                 className="p-4 min-h-[300px]"
// // //                 dangerouslySetInnerHTML={{ __html: previewHtml }}
// // //               />
// // //             </div>
// // //           )}
// // //         </div>

// // //         {/* Start Button - Disabled until preview loads */}
// // //         <div className="pt-4">
// // //           <Button
// // //             onClick={onStartClick}
// // //             disabled={loading || !!error}
// // //             className="w-full"
// // //             size="lg"
// // //           >
// // //             {loading ? (
// // //               <>
// // //                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// // //                 Loading Preview...
// // //               </>
// // //             ) : error ? (
// // //               "Fix Error First"
// // //             ) : (
// // //               "Start Resizing"
// // //             )}
// // //           </Button>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // "use client";

// // import React, { useState, useEffect } from "react";
// // import { Button } from "@/components/ui/button";
// // import { Label } from "@/components/ui/label";
// // import { X, Loader2, Check } from "lucide-react";

// // interface ResizeSidePanelProps {
// //   selectedTemplate: string;
// //   customWidth: string;
// //   customHeight: string;
// //   currentPreviewHtml: string; // NEW: Pass current preview
// //   onBack: () => void;
// //   onConfirm: (selectedVariation: number, resizedHtml: string) => void;
// //   isResizing: boolean;
// // }

// // export const ResizeSidePanel = ({
// //   selectedTemplate,
// //   customWidth,
// //   customHeight,
// //   currentPreviewHtml,
// //   onBack,
// //   onConfirm,
// //   isResizing,
// // }: ResizeSidePanelProps) => {
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string>("");
// //   const [variation1Html, setVariation1Html] = useState<string>("");
// //   const [variation2Html, setVariation2Html] = useState<string>("");
// //   const [selectedVariation, setSelectedVariation] = useState<number | null>(
// //     null
// //   );

// //   // Get target dimensions
// //   const getTargetDimensions = () => {
// //     if (customWidth && customHeight) {
// //       return {
// //         width: parseInt(customWidth),
// //         height: parseInt(customHeight),
// //       };
// //     }

// //     // Import CANVAS_TEMPLATES to get dimensions
// //     const { CANVAS_TEMPLATES } = require("@/lib/constants");
// //     const templateConfig = CANVAS_TEMPLATES[selectedTemplate];

// //     return {
// //       width: templateConfig?.width || 1920,
// //       height: templateConfig?.height || 1080,
// //     };
// //   };

// //   useEffect(() => {
// //     generateResizedPreviews();
// //   }, []);

// //   const generateResizedPreviews = async () => {
// //     setLoading(true);
// //     setError("");

// //     const { width, height } = getTargetDimensions();

// //     try {
// //       const response = await fetch("/api/ai/resize-preview", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           currentPreviewHtml,
// //           targetWidth: width,
// //           targetHeight: height,
// //         }),
// //       });

// //       const result = await response.json();

// //       if (result.success) {
// //         setVariation1Html(result.variation1Html);
// //         setVariation2Html(result.variation2Html);
// //       } else {
// //         setError(result.error || "Failed to generate resized previews");
// //       }
// //     } catch (err) {
// //       console.error("Resize preview generation error:", err);
// //       setError("Failed to generate resized previews");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleConfirm = () => {
// //     if (selectedVariation === null) return;

// //     const selectedHtml =
// //       selectedVariation === 1 ? variation1Html : variation2Html;
// //     onConfirm(selectedVariation, selectedHtml);
// //   };

// //   const { width, height } = getTargetDimensions();

// //   return (
// //     <div className="w-[780px] border-l bg-gray-50 p-4 max-h-[700px] overflow-y-auto">
// //       <div className="space-y-6">
// //         {/* Header */}
// //         <div className="flex items-center justify-between">
// //           <h3 className="font-semibold text-lg">Choose Resize Variation</h3>
// //           <Button
// //             variant="ghost"
// //             size="sm"
// //             onClick={onBack}
// //             className="h-8 w-8 p-0"
// //             disabled={loading || isResizing}
// //           >
// //             <X className="h-4 w-4" />
// //           </Button>
// //         </div>

// //         {/* Dimensions Info */}
// //         <div className="p-3 border rounded-lg bg-white">
// //           <div className="text-sm">
// //             <span className="text-gray-600">Target Size:</span>
// //             <span className="ml-2 font-medium">
// //               {width} × {height} px
// //             </span>
// //           </div>
// //           {selectedTemplate && (
// //             <div className="text-sm mt-1">
// //               <span className="text-gray-600">Template:</span>
// //               <span className="ml-2 font-medium">
// //                 {require("@/lib/constants").CANVAS_TEMPLATES[selectedTemplate]
// //                   ?.label || selectedTemplate}
// //               </span>
// //             </div>
// //           )}
// //         </div>

// //         {/* Preview Variations */}
// //         <div className="space-y-3">
// //           <Label className="text-sm font-semibold">
// //             Select Your Preferred Layout
// //           </Label>

// //           {loading ? (
// //             <div className="p-12 border-2 border-dashed rounded-lg text-center bg-white flex flex-col items-center gap-4">
// //               <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
// //               <p className="text-sm text-gray-500">
// //                 Generating 2 AI variations...
// //               </p>
// //               <p className="text-xs text-gray-400">
// //                 Creating optimized layouts for {width}×{height}px
// //               </p>
// //             </div>
// //           ) : error ? (
// //             <div className="p-8 border-2 border-red-200 rounded-lg text-center bg-red-50">
// //               <p className="text-sm text-red-600 mb-4">{error}</p>
// //               <Button
// //                 variant="outline"
// //                 size="sm"
// //                 onClick={generateResizedPreviews}
// //               >
// //                 Retry
// //               </Button>
// //             </div>
// //           ) : (
// //             <div className="grid grid-cols-2 gap-4">
// //               {/* Variation 1 */}
// //               <button
// //                 onClick={() => setSelectedVariation(1)}
// //                 className={`relative border-2 rounded-lg overflow-hidden transition-all ${
// //                   selectedVariation === 1
// //                     ? "border-indigo-600 ring-2 ring-indigo-200"
// //                     : "border-gray-200 hover:border-indigo-300"
// //                 }`}
// //               >
// //                 {selectedVariation === 1 && (
// //                   <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 z-10">
// //                     <Check className="h-4 w-4" />
// //                   </div>
// //                 )}
// //                 <div className="bg-white p-3">
// //                   <div className="text-xs font-semibold mb-2 text-left">
// //                     Variation 1
// //                   </div>
// //                   <div
// //                     className="relative bg-gray-100 rounded overflow-hidden"
// //                     style={{
// //                       height: "200px",
// //                     }}
// //                   >
// //                     <div
// //                       style={{
// //                         transform: `scale(${Math.min(
// //                           330 / width,
// //                           200 / height
// //                         )})`,
// //                         transformOrigin: "top left",
// //                       }}
// //                       dangerouslySetInnerHTML={{ __html: variation1Html }}
// //                     />
// //                   </div>
// //                 </div>
// //               </button>

// //               {/* Variation 2 */}
// //               <button
// //                 onClick={() => setSelectedVariation(2)}
// //                 className={`relative border-2 rounded-lg overflow-hidden transition-all ${
// //                   selectedVariation === 2
// //                     ? "border-indigo-600 ring-2 ring-indigo-200"
// //                     : "border-gray-200 hover:border-indigo-300"
// //                 }`}
// //               >
// //                 {selectedVariation === 2 && (
// //                   <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 z-10">
// //                     <Check className="h-4 w-4" />
// //                   </div>
// //                 )}
// //                 <div className="bg-white p-3">
// //                   <div className="text-xs font-semibold mb-2 text-left">
// //                     Variation 2
// //                   </div>
// //                   <div
// //                     className="relative bg-gray-100 rounded overflow-hidden"
// //                     style={{
// //                       height: "200px",
// //                     }}
// //                   >
// //                     <div
// //                       style={{
// //                         transform: `scale(${Math.min(
// //                           330 / width,
// //                           200 / height
// //                         )})`,
// //                         transformOrigin: "top left",
// //                       }}
// //                       dangerouslySetInnerHTML={{ __html: variation2Html }}
// //                     />
// //                   </div>
// //                 </div>
// //               </button>
// //             </div>
// //           )}
// //         </div>

// //         {/* Action Buttons */}
// //         <div className="flex gap-3 pt-4">
// //           <Button
// //             variant="outline"
// //             onClick={onBack}
// //             className="flex-1"
// //             disabled={loading || isResizing}
// //           >
// //             Back
// //           </Button>
// //           <Button
// //             onClick={handleConfirm}
// //             disabled={
// //               loading || !!error || selectedVariation === null || isResizing
// //             }
// //             className="flex-1"
// //           >
// //             {isResizing ? (
// //               <>
// //                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// //                 Applying...
// //               </>
// //             ) : selectedVariation === null ? (
// //               "Select a Variation"
// //             ) : (
// //               `Confirm Variation ${selectedVariation}`
// //             )}
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// "use client";

// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { X, Loader2, Check } from "lucide-react";

// interface ResizeSidePanelProps {
//   selectedTemplate: string;
//   customWidth: string;
//   customHeight: string;
//   currentPreviewHtml: string;
//   currentCanvasScreenshot: string | null;
//   onBack: () => void;
//   onConfirm: (selectedVariation: number, resizedHtml: string) => void;
//   isResizing: boolean;
// }

// export const ResizeSidePanel = ({
//   selectedTemplate,
//   customWidth,
//   customHeight,
//   currentPreviewHtml,
//   currentCanvasScreenshot,
//   onBack,
//   onConfirm,
//   isResizing,
// }: ResizeSidePanelProps) => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>("");
//   const [variation1Html, setVariation1Html] = useState<string>("");
//   const [variation2Html, setVariation2Html] = useState<string>("");
//   const [selectedVariation, setSelectedVariation] = useState<number | null>(
//     null
//   );

//   // Get target dimensions
//   const getTargetDimensions = () => {
//     if (customWidth && customHeight) {
//       return {
//         width: parseInt(customWidth),
//         height: parseInt(customHeight),
//       };
//     }

//     const { CANVAS_TEMPLATES } = require("@/lib/constants");
//     const templateConfig = CANVAS_TEMPLATES[selectedTemplate];

//     return {
//       width: templateConfig?.width || 1920,
//       height: templateConfig?.height || 1080,
//     };
//   };

//   useEffect(() => {
//     generateResizedPreviews();
//   }, []);

//   const generateResizedPreviews = async () => {
//     setLoading(true);
//     setError("");

//     const { width, height } = getTargetDimensions();

//     console.log("🔄 Generating resized previews...");
//     console.log("- Target size:", `${width}×${height}`);
//     console.log("- Preview HTML length:", currentPreviewHtml?.length || 0);
//     console.log("- Screenshot:", currentCanvasScreenshot ? "✅" : "❌");

//     try {
//       const response = await fetch("/api/ai/resize-preview", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           currentPreviewHtml,
//           canvasScreenshot: currentCanvasScreenshot,
//           targetWidth: width,
//           targetHeight: height,
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setVariation1Html(result.variation1Html);
//         setVariation2Html(result.variation2Html);
//         console.log("✅ Received 2 variations successfully");
//       } else {
//         setError(result.error || "Failed to generate resized previews");
//         console.error("❌ Error:", result.error);
//       }
//     } catch (err) {
//       console.error("Resize preview generation error:", err);
//       setError("Failed to generate resized previews");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleConfirm = () => {
//     if (selectedVariation === null) return;

//     const selectedHtml =
//       selectedVariation === 1 ? variation1Html : variation2Html;
//     onConfirm(selectedVariation, selectedHtml);
//   };

//   const { width, height } = getTargetDimensions();

//   return (
//     <div className="w-[780px] border-l bg-gray-50 p-4 max-h-[700px] overflow-y-auto">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-lg">Choose Resize Variation</h3>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onBack}
//             className="h-8 w-8 p-0"
//             disabled={loading || isResizing}
//           >
//             <X className="h-4 w-4" />
//           </Button>
//         </div>

//         {/* Dimensions Info */}
//         <div className="p-3 border rounded-lg bg-white">
//           <div className="text-sm">
//             <span className="text-gray-600">Target Size:</span>
//             <span className="ml-2 font-medium">
//               {width} × {height} px
//             </span>
//           </div>
//           {selectedTemplate && (
//             <div className="text-sm mt-1">
//               <span className="text-gray-600">Template:</span>
//               <span className="ml-2 font-medium">
//                 {require("@/lib/constants").CANVAS_TEMPLATES[selectedTemplate]
//                   ?.label || selectedTemplate}
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Preview Variations */}
//         <div className="space-y-3">
//           <Label className="text-sm font-semibold">
//             Select Your Preferred Layout
//           </Label>

//           {loading ? (
//             <div className="p-12 border-2 border-dashed rounded-lg text-center bg-white flex flex-col items-center gap-4">
//               <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//               <p className="text-sm text-gray-500">
//                 Generating 2 AI variations...
//               </p>
//               <p className="text-xs text-gray-400">
//                 Creating optimized layouts for {width}×{height}px
//               </p>
//             </div>
//           ) : error ? (
//             <div className="p-8 border-2 border-red-200 rounded-lg text-center bg-red-50">
//               <p className="text-sm text-red-600 mb-4">{error}</p>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={generateResizedPreviews}
//               >
//                 Retry
//               </Button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 gap-4">
//               {/* Variation 1 */}
//               <button
//                 onClick={() => setSelectedVariation(1)}
//                 className={`relative border-2 rounded-lg overflow-hidden transition-all ${
//                   selectedVariation === 1
//                     ? "border-indigo-600 ring-2 ring-indigo-200"
//                     : "border-gray-200 hover:border-indigo-300"
//                 }`}
//               >
//                 {selectedVariation === 1 && (
//                   <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 z-10">
//                     <Check className="h-4 w-4" />
//                   </div>
//                 )}
//                 <div className="bg-white p-3">
//                   <div className="text-xs font-semibold mb-2 text-left">
//                     Variation 1
//                   </div>
//                   <div
//                     className="relative bg-gray-100 rounded overflow-hidden"
//                     style={{
//                       height: "200px",
//                     }}
//                   >
//                     <div
//                       style={{
//                         transform: `scale(${Math.min(
//                           330 / width,
//                           200 / height
//                         )})`,
//                         transformOrigin: "top left",
//                       }}
//                       dangerouslySetInnerHTML={{ __html: variation1Html }}
//                     />
//                   </div>
//                 </div>
//               </button>

//               {/* Variation 2 */}
//               <button
//                 onClick={() => setSelectedVariation(2)}
//                 className={`relative border-2 rounded-lg overflow-hidden transition-all ${
//                   selectedVariation === 2
//                     ? "border-indigo-600 ring-2 ring-indigo-200"
//                     : "border-gray-200 hover:border-indigo-300"
//                 }`}
//               >
//                 {selectedVariation === 2 && (
//                   <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 z-10">
//                     <Check className="h-4 w-4" />
//                   </div>
//                 )}
//                 <div className="bg-white p-3">
//                   <div className="text-xs font-semibold mb-2 text-left">
//                     Variation 2
//                   </div>
//                   <div
//                     className="relative bg-gray-100 rounded overflow-hidden"
//                     style={{
//                       height: "200px",
//                     }}
//                   >
//                     <div
//                       style={{
//                         transform: `scale(${Math.min(
//                           330 / width,
//                           200 / height
//                         )})`,
//                         transformOrigin: "top left",
//                       }}
//                       dangerouslySetInnerHTML={{ __html: variation2Html }}
//                     />
//                   </div>
//                 </div>
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-3 pt-4">
//           <Button
//             variant="outline"
//             onClick={onBack}
//             className="flex-1"
//             disabled={loading || isResizing}
//           >
//             Back
//           </Button>
//           <Button
//             onClick={handleConfirm}
//             disabled={
//               loading || !!error || selectedVariation === null || isResizing
//             }
//             className="flex-1"
//           >
//             {isResizing ? (
//               <>
//                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                 Applying...
//               </>
//             ) : selectedVariation === null ? (
//               "Select a Variation"
//             ) : (
//               `Confirm Variation ${selectedVariation}`
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Loader2, Check } from "lucide-react";

interface ResizeSidePanelProps {
  selectedTemplate: string;
  customWidth: string;
  customHeight: string;
  currentPreviewHtml: string;
  currentCanvasScreenshot: string | null;
  onBack: () => void;
  onConfirm: (selectedVariation: number, resizedHtml: string) => void;
  isResizing: boolean;
}

export const ResizeSidePanel = ({
  selectedTemplate,
  customWidth,
  customHeight,
  currentPreviewHtml,
  currentCanvasScreenshot,
  onBack,
  onConfirm,
  isResizing,
}: ResizeSidePanelProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [variation1Html, setVariation1Html] = useState<string>("");
  const [variation2Html, setVariation2Html] = useState<string>("");
  const [selectedVariation, setSelectedVariation] = useState<number | null>(
    null
  );

  // Get target dimensions
  const getTargetDimensions = () => {
    if (customWidth && customHeight) {
      return {
        width: parseInt(customWidth),
        height: parseInt(customHeight),
      };
    }

    const { CANVAS_TEMPLATES } = require("@/lib/constants");
    const templateConfig = CANVAS_TEMPLATES[selectedTemplate];

    return {
      width: templateConfig?.width || 1920,
      height: templateConfig?.height || 1080,
    };
  };

  useEffect(() => {
    generateResizedPreviews();
  }, []);

  const generateResizedPreviews = async () => {
    setLoading(true);
    setError("");

    const { width, height } = getTargetDimensions();

    console.log("🔄 Generating resized previews...");
    console.log("- Target size:", `${width}×${height}`);
    console.log("- Preview HTML length:", currentPreviewHtml?.length || 0);
    console.log("- Screenshot:", currentCanvasScreenshot ? "✅" : "❌");

    try {
      const response = await fetch("/api/ai/resize-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPreviewHtml,
          canvasScreenshot: currentCanvasScreenshot,
          targetWidth: width,
          targetHeight: height,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVariation1Html(result.variation1Html);
        setVariation2Html(result.variation2Html);
        console.log("✅ Received 2 variations successfully");
      } else {
        setError(result.error || "Failed to generate resized previews");
        console.error("❌ Error:", result.error);
      }
    } catch (err) {
      console.error("Resize preview generation error:", err);
      setError("Failed to generate resized previews");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedVariation === null) return;

    const selectedHtml =
      selectedVariation === 1 ? variation1Html : variation2Html;
    onConfirm(selectedVariation, selectedHtml);
  };

  const { width, height } = getTargetDimensions();

  return (
    <div className="w-[780px] border-l bg-gray-50 p-4 max-h-[700px] overflow-y-auto relative">
      {/* ✅ Loading Overlay for Resizing */}
      {isResizing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Applying variation...</p>
            <p className="text-xs text-gray-500">This may take a moment</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Choose Resize Variation</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
            disabled={loading || isResizing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Dimensions Info */}
        <div className="p-3 border rounded-lg bg-white">
          <div className="text-sm">
            <span className="text-gray-600">Target Size:</span>
            <span className="ml-2 font-medium">
              {width} × {height} px
            </span>
          </div>
          {selectedTemplate && (
            <div className="text-sm mt-1">
              <span className="text-gray-600">Template:</span>
              <span className="ml-2 font-medium">
                {require("@/lib/constants").CANVAS_TEMPLATES[selectedTemplate]
                  ?.label || selectedTemplate}
              </span>
            </div>
          )}
        </div>

        {/* Preview Variations */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            Select Your Preferred Layout
          </Label>

          {loading ? (
            <div className="p-12 border-2 border-dashed rounded-lg text-center bg-white flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-gray-500">
                Generating 2 AI variations...
              </p>
              <p className="text-xs text-gray-400">
                Creating optimized layouts for {width}×{height}px
              </p>
            </div>
          ) : error ? (
            <div className="p-8 border-2 border-red-200 rounded-lg text-center bg-red-50">
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={generateResizedPreviews}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Variation 1 */}
              <button
                onClick={() => setSelectedVariation(1)}
                className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                  selectedVariation === 1
                    ? "border-indigo-600 ring-2 ring-indigo-200"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                {selectedVariation === 1 && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 z-10">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div className="bg-white p-3">
                  <div className="text-xs font-semibold mb-2 text-left">
                    Variation 1
                  </div>
                  <div
                    className="relative bg-gray-100 rounded overflow-hidden flex items-center justify-center"
                    style={{
                      height: "300px",
                    }}
                  >
                    <div
                      style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        transform: `scale(${Math.min(
                          330 / width,
                          300 / height
                        )})`,
                        transformOrigin: "center center",
                      }}
                      dangerouslySetInnerHTML={{ __html: variation1Html }}
                    />
                  </div>
                </div>
              </button>

              {/* Variation 2 */}
              <button
                onClick={() => setSelectedVariation(2)}
                className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                  selectedVariation === 2
                    ? "border-indigo-600 ring-2 ring-indigo-200"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                {selectedVariation === 2 && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 z-10">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div className="bg-white p-3">
                  <div className="text-xs font-semibold mb-2 text-left">
                    Variation 2
                  </div>
                  <div
                    className="relative bg-gray-100 rounded overflow-hidden flex items-center justify-center"
                    style={{
                      height: "300px",
                    }}
                  >
                    <div
                      style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        transform: `scale(${Math.min(
                          330 / width,
                          300 / height
                        )})`,
                        transformOrigin: "center center",
                      }}
                      dangerouslySetInnerHTML={{ __html: variation2Html }}
                    />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 cursor-pointer"
            disabled={loading || isResizing}
          >
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              loading || !!error || selectedVariation === null || isResizing
            }
            className="flex-1 cursor-pointer"
          >
            {isResizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : selectedVariation === null ? (
              "Select a Variation"
            ) : (
              `Confirm Variation ${selectedVariation}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
