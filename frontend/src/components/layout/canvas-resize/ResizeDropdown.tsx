"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Maximize2, Sparkles, Loader2, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CANVAS_TEMPLATES } from "@/lib/constants";
import { ResizeSidePanel } from "./ResizeSidePanel";

interface ResizeDropdownProps {
  currentTemplate: string;
  currentWidth: number;
  currentHeight: number;
  canvasData: any;
  canvasId: string;
  onResize: (
    template: string,
    customSize?: { width: number; height: number }
  ) => Promise<void>;
  isResizing: boolean;
  isAnySidePanelOpen: boolean;
  onSidePanelChange: (isOpen: boolean) => void;
}

export const ResizeDropdown = ({
  currentTemplate,
  currentWidth,
  currentHeight,
  canvasData,
  canvasId, // ✅ ADD THIS
  onResize,
  isResizing,
  isAnySidePanelOpen,
  onSidePanelChange,
}: ResizeDropdownProps) => {
  const [step, setStep] = useState<"start" | "configure" | "confirm">("start");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Preview states
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [currentPreviewHtml, setCurrentPreviewHtml] = useState<string>("");
  const [previewError, setPreviewError] = useState<string>("");
  const [canvasScreenshot, setCanvasScreenshot] = useState<string | null>(null);
  const [currentCanvasScreenshot, setCurrentCanvasScreenshot] = useState<
    string | null
  >(null);

  const [isApplying, setIsApplying] = useState(false);

  // Group templates
  const socialMediaTemplates = Object.entries(CANVAS_TEMPLATES).filter(
    ([key]) =>
      key.includes("instagram") ||
      key.includes("facebook") ||
      key.includes("twitter") ||
      key.includes("linkedin") ||
      key.includes("youtube")
  );

  const otherTemplates = Object.entries(CANVAS_TEMPLATES).filter(
    ([key]) =>
      !key.includes("instagram") &&
      !key.includes("facebook") &&
      !key.includes("twitter") &&
      !key.includes("linkedin") &&
      !key.includes("youtube") &&
      key !== "custom"
  );

  // Capture screenshot when dropdown opens
  useEffect(() => {
    if (dropdownOpen && step === "start") {
      // Get FRESH canvas data directly from fabric
      const fabricCanvas = (window as any).__fabricCanvas;

      let freshCanvasData = canvasData;

      if (fabricCanvas) {
        // Get fresh data directly from fabric canvas
        const json = fabricCanvas.toJSON();
        freshCanvasData = {
          version: json.version,
          objects: json.objects,
          background: fabricCanvas.backgroundColor || "#ffffff",
          width: canvasData?.width || fabricCanvas.getWidth(),
          height: canvasData?.height || fabricCanvas.getHeight(),
        };

        console.log("🎨 Fresh canvas data:", freshCanvasData);
        console.log("📦 Objects count:", freshCanvasData.objects?.length);
      }

      const screenshot = captureCanvasScreenshot();
      setCanvasScreenshot(screenshot);
      generatePreview(freshCanvasData, screenshot);
    }
  }, [dropdownOpen, step]);

  const captureCanvasScreenshot = () => {
    const fabricCanvas = (window as any).__fabricCanvas;
    if (!fabricCanvas) return null;

    try {
      return fabricCanvas.toDataURL({
        format: "png",
        quality: 0.8,
        multiplier: 1,
      });
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      return null;
    }
  };

  // Generate preview from backend
  const generatePreview = async (data: any, screenshot: string | null) => {
    setPreviewLoading(true);
    setPreviewError("");
    setCurrentCanvasScreenshot(screenshot);

    console.log("=== DEBUG: Canvas Data ===");
    console.log("canvasData:", data);
    console.log("canvasData.objects:", data?.objects);
    console.log("Number of objects:", data?.objects?.length || 0);
    console.log("========================");

    try {
      const response = await fetch("/api/ai/generate-canvas-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasData: data,
          canvasScreenshot: screenshot,
        }),
      });

      const result = await response.json();
      console.log("API Result:", result);

      if (result.success) {
        setPreviewHtml(result.previewHtml);
        setCurrentPreviewHtml(result.previewHtml);
      } else {
        setPreviewError(result.error || "Failed to generate preview");
      }
    } catch (err) {
      console.error("Preview generation error:", err);
      setPreviewError("Failed to generate preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle retry - regenerate preview
  const handleRetryPreview = () => {
    const fabricCanvas = (window as any).__fabricCanvas;
    let freshData = canvasData;

    if (fabricCanvas) {
      const json = fabricCanvas.toJSON();
      freshData = {
        version: json.version,
        objects: json.objects,
        background: fabricCanvas.backgroundColor || "#ffffff",
        width: canvasData?.width || fabricCanvas.getWidth(),
        height: canvasData?.height || fabricCanvas.getHeight(),
      };
    }

    const screenshot = captureCanvasScreenshot();
    setCanvasScreenshot(screenshot);
    generatePreview(freshData, screenshot);
  };

  const handleStart = () => {
    setStep("configure");
  };

  const handleTemplateSelect = (templateKey: string) => {
    if (step === "confirm") return;
    setSelectedTemplate(templateKey);
    setCustomWidth("");
    setCustomHeight("");
  };

  const handleCustomSizeChange = () => {
    if (step === "confirm") return;
    setSelectedTemplate("");
  };

  const isCreateEnabled = () => {
    if (selectedTemplate) return true;
    if (customWidth && customHeight) {
      const w = parseInt(customWidth);
      const h = parseInt(customHeight);
      return w > 0 && h > 0 && w <= 10000 && h <= 10000;
    }
    return false;
  };

  const handleCreateClick = () => {
    setStep("confirm");
    onSidePanelChange(true);
  };

  const handleBack = () => {
    setStep("configure");
    onSidePanelChange(false);
  };

  // Updated to receive selected variation and resized HTML
  // const handleFinalResize = async (
  //   selectedVariation: number,
  //   resizedHtml: string
  // ) => {
  //   console.log(`✅ User selected variation ${selectedVariation}`);
  //   console.log("📄 Resized HTML:", resizedHtml);

  //   // TODO: You can store the resizedHtml or use it for further processing
  //   // For now, proceed with the actual resize
  //   if (selectedTemplate) {
  //     await onResize(selectedTemplate);
  //   } else if (customWidth && customHeight) {
  //     const width = parseInt(customWidth);
  //     const height = parseInt(customHeight);
  //     await onResize("custom", { width, height });
  //   }

  //   setDropdownOpen(false);
  //   onSidePanelChange(false);
  //   resetState();
  // };

  // const handleFinalResize = async (
  //   selectedVariation: number,
  //   resizedHtml: string
  // ) => {
  //   console.log(`✅ User selected variation ${selectedVariation}`);

  //   // Get target dimensions
  //   const getTargetDimensions = () => {
  //     if (customWidth && customHeight) {
  //       return {
  //         width: parseInt(customWidth),
  //         height: parseInt(customHeight),
  //       };
  //     }

  //     const templateConfig = CANVAS_TEMPLATES[selectedTemplate];
  //     return {
  //       width: templateConfig?.width || 1920,
  //       height: templateConfig?.height || 1080,
  //     };
  //   };

  //   const { width, height } = getTargetDimensions();

  //   try {
  //     // Get current canvas ID from the canvas context
  //     const fabricCanvas = (window as any).__fabricCanvas;
  //     const currentCanvas = canvasData; // This should have _id

  //     if (!currentCanvas) {
  //       alert("Canvas not found");
  //       return;
  //     }

  //     // Create new canvas with resized variation
  //     const response = await fetch("/api/canvas/duplicate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         originalCanvasId: currentCanvas._id, // You'll need to pass this
  //         htmlContent: resizedHtml,
  //         targetWidth: width,
  //         targetHeight: height,
  //         variationNumber: selectedVariation,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to create resized canvas");
  //     }

  //     const result = await response.json();

  //     if (result.success && result.canvasId) {
  //       // Open new canvas in new tab
  //       window.open(`/canvas/${result.canvasId}`, "_blank");

  //       // Close dropdown and reset
  //       setDropdownOpen(false);
  //       onSidePanelChange(false);
  //       resetState();

  //       // Optional: Show success notification
  //       console.log(`✅ New canvas created: ${result.canvas.name}`);
  //     }
  //   } catch (error) {
  //     console.error("Failed to create resized canvas:", error);
  //     alert("Failed to create resized canvas. Please try again.");
  //   }
  // };

  // const handleFinalResize = async (
  //   selectedVariation: number,
  //   resizedHtml: string
  // ) => {
  //   const getTargetDimensions = () => {
  //     if (customWidth && customHeight) {
  //       return {
  //         width: parseInt(customWidth),
  //         height: parseInt(customHeight),
  //       };
  //     }

  //     const templateConfig = CANVAS_TEMPLATES[selectedTemplate];
  //     return {
  //       width: templateConfig?.width || 1920,
  //       height: templateConfig?.height || 1080,
  //     };
  //   };

  //   const { width, height } = getTargetDimensions();
  //   console.log();

  //   try {
  //     const response = await fetch("/api/canvas/duplicate", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         originalCanvasId: canvasId, // Use the prop
  //         htmlContent: resizedHtml,
  //         targetWidth: width,
  //         targetHeight: height,
  //         variationNumber: selectedVariation,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to create resized canvas");
  //     }

  //     const result = await response.json();

  //     if (result.success && result.canvasId) {
  //       window.open(`/canvas/${result.canvasId}`, "_blank");
  //       setDropdownOpen(false);
  //       onSidePanelChange(false);
  //       resetState();
  //     }
  //   } catch (error) {
  //     console.error("Failed to create resized canvas:", error);
  //     alert("Failed to create resized canvas. Please try again.");
  //   }
  // };

  const handleFinalResize = async (
    selectedVariation: number,
    resizedHtml: string
  ) => {
    const getTargetDimensions = () => {
      if (customWidth && customHeight) {
        return {
          width: parseInt(customWidth),
          height: parseInt(customHeight),
        };
      }

      const templateConfig = CANVAS_TEMPLATES[selectedTemplate];
      return {
        width: templateConfig?.width || 1920,
        height: templateConfig?.height || 1080,
      };
    };

    const { width, height } = getTargetDimensions();

    // ✅ SET LOADING STATE TO TRUE
    setIsApplying(true);

    try {
      const response = await fetch("/api/canvas/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalCanvasId: canvasId,
          htmlContent: resizedHtml,
          targetWidth: width,
          targetHeight: height,
          variationNumber: selectedVariation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create resized canvas");
      }

      const result = await response.json();

      if (result.success && result.canvasId) {
        window.open(`/canvas/${result.canvasId}`, "_blank");
        setDropdownOpen(false);
        onSidePanelChange(false);
        resetState();
      }
    } catch (error) {
      console.error("Failed to create resized canvas:", error);
      alert("Failed to create resized canvas. Please try again.");
    } finally {
      // ✅ RESET LOADING STATE
      setIsApplying(false);
    }
  };

  const resetState = () => {
    setStep("start");
    setSelectedTemplate("");
    setCustomWidth("");
    setCustomHeight("");
    setPreviewLoading(false);
    setPreviewHtml("");
    setCurrentPreviewHtml("");
    setCurrentCanvasScreenshot(null);
    setPreviewError("");
    setCanvasScreenshot(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (open && isAnySidePanelOpen) {
      return;
    }

    setDropdownOpen(open);
    if (!open) {
      onSidePanelChange(false);
      setTimeout(resetState, 200);
    }
  };

  const isSidePanelOpen = step === "confirm";

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs cursor-pointer"
          disabled={isResizing || isAnySidePanelOpen}
        >
          <span className="text-sm font-medium text-blue-600">
            Resize Canvas
          </span>
          <Maximize2 className="w-3 h-3 mr-1" />
          {currentTemplate || "custom"} • {currentWidth}×{currentHeight}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="p-0"
        style={{
          width: step === "confirm" ? "1020px" : "320px",
        }}
      >
        <div className="flex">
          {/* Left Panel - Main Selection */}
          <div
            className={`${
              step === "confirm" ? "w-[360px]" : "w-full"
            } max-h-[700px] overflow-y-auto ${
              isSidePanelOpen ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {step === "start" ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold">Ready to resize?</h3>
                  <p className="text-xs text-gray-500">
                    {previewLoading
                      ? "Generating AI preview..."
                      : previewError
                      ? "Preview failed"
                      : "Choose a template or custom size"}
                  </p>
                </div>

                {/* Show loading in Start button */}
                {previewLoading ? (
                  <Button size="sm" className="w-full" disabled>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading Preview...
                  </Button>
                ) : previewError ? (
                  <div className="w-full space-y-2">
                    <p className="text-xs text-red-600 text-center">
                      {previewError}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      variant="outline"
                      onClick={handleRetryPreview}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                    <Button size="sm" className="w-full" onClick={handleStart}>
                      Continue Anyway
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" className="w-full" onClick={handleStart}>
                    Start
                  </Button>
                )}

                {/* Show preview HTML if available */}
                {!previewLoading && previewHtml && !previewError && (
                  <div className="w-full mt-4 space-y-3">
                    {/* Preview Box */}
                    <div className="p-3 border rounded-lg bg-white">
                      <Label className="text-xs font-semibold mb-2 block">
                        AI Preview
                      </Label>
                      <div
                        className="relative w-full overflow-hidden bg-gray-100 rounded"
                        style={{
                          height: "150px",
                        }}
                      >
                        <div
                          style={{
                            transform: `scale(${Math.min(
                              270 / currentWidth,
                              150 / currentHeight
                            )})`,
                            transformOrigin: "top left",
                          }}
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      </div>
                    </div>

                    {/* Retry Button Below Preview */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={handleRetryPreview}
                      disabled={previewLoading}
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Regenerate Preview
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-4">
                {/* Social Media Section */}
                <div className="space-y-2">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-700">
                    Social Media
                  </div>
                  <div className="space-y-1">
                    {socialMediaTemplates.map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => handleTemplateSelect(key)}
                        disabled={isSidePanelOpen}
                        className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          selectedTemplate === key
                            ? "bg-indigo-100 text-indigo-900 font-medium"
                            : "hover:bg-gray-100"
                        } ${
                          isSidePanelOpen
                            ? "cursor-not-allowed"
                            : "hover:bg-indigo-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{config.label}</span>
                          <span className="text-xs text-gray-500">
                            {config.width}×{config.height}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Other Templates Section */}
                {otherTemplates.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <div className="px-2 py-1 text-xs font-semibold text-gray-700">
                        Other
                      </div>
                      <div className="space-y-1">
                        {otherTemplates.map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => handleTemplateSelect(key)}
                            disabled={isSidePanelOpen}
                            className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                              selectedTemplate === key
                                ? "bg-indigo-100 text-indigo-900 font-medium"
                                : "hover:bg-gray-100"
                            } ${
                              isSidePanelOpen
                                ? "cursor-not-allowed"
                                : "hover:bg-indigo-50"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{config.label}</span>
                              <span className="text-xs text-gray-500">
                                {config.width}×{config.height}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Custom Size Section */}
                <div className="space-y-3 px-2">
                  <div className="text-xs font-semibold text-gray-700">
                    Custom Size
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="width" className="text-xs text-gray-600">
                        Width (px)
                      </Label>
                      <Input
                        id="width"
                        type="number"
                        min="1"
                        max="10000"
                        placeholder="1920"
                        value={customWidth}
                        onChange={(e) => {
                          setCustomWidth(e.target.value);
                          handleCustomSizeChange();
                        }}
                        disabled={isSidePanelOpen}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="height" className="text-xs text-gray-600">
                        Height (px)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        min="1"
                        max="10000"
                        placeholder="1080"
                        value={customHeight}
                        onChange={(e) => {
                          setCustomHeight(e.target.value);
                          handleCustomSizeChange();
                        }}
                        disabled={isSidePanelOpen}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Create Button */}
                <div className="px-2">
                  <Button
                    onClick={handleCreateClick}
                    disabled={!isCreateEnabled() || isSidePanelOpen}
                    className="w-full"
                    size="sm"
                  >
                    Create
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Confirmation (separate component) */}
          {step === "confirm" && (
            <ResizeSidePanel
              selectedTemplate={selectedTemplate}
              customWidth={customWidth}
              customHeight={customHeight}
              currentPreviewHtml={currentPreviewHtml}
              currentCanvasScreenshot={currentCanvasScreenshot}
              onBack={handleBack}
              onConfirm={handleFinalResize}
              isResizing={isApplying}
            />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
