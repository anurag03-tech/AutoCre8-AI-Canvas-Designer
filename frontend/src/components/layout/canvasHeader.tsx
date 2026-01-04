// components/canvas/CanvasHeader.tsx
"use client";

import React, { useState } from "react";
import {
  Menu,
  Undo,
  Redo,
  Download,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Logo from "../shared/Logo";
import { useCanvas } from "@/contexts/CanvasContext";
import { useRouter } from "next/navigation";
import { CANVAS_TEMPLATES } from "@/lib/constants";

const CanvasHeader = ({
  onToggleSidebar,
  isSidebarOpen,
}: {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}) => {
  const { canvas, updateCanvasName, canvasActions, updateCanvas } = useCanvas();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  // Resize states
  const [isResizing, setIsResizing] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);

  const handleNameClick = () => {
    if (canvas) {
      setTempName(canvas.name);
      setIsEditing(true);
    }
  };

  const handleNameSave = async () => {
    if (!canvas || !tempName.trim()) return;

    try {
      const res = await fetch(`/api/canvas/${canvas._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tempName }),
      });

      if (res.ok) {
        updateCanvasName(tempName);
        setIsEditing(false);
      }
    } catch (e) {
      alert("Failed to update name");
    }
  };

  const handleSave = async () => {
    if (!canvasActions?.saveCanvas) return;
    await canvasActions.saveCanvas();
  };

  const handleResizeCanvas = async (
    template: string,
    customSize?: { width: number; height: number }
  ) => {
    if (!canvas || !canvasActions?.getCanvasJSON) {
      alert("Canvas not ready");
      return;
    }

    setIsResizing(true);

    try {
      let targetWidth: number;
      let targetHeight: number;

      if (customSize) {
        targetWidth = customSize.width;
        targetHeight = customSize.height;
      } else {
        const templateConfig =
          CANVAS_TEMPLATES[template as keyof typeof CANVAS_TEMPLATES];
        if (!templateConfig) {
          alert("Invalid template");
          return;
        }
        targetWidth = templateConfig.width;
        targetHeight = templateConfig.height;
      }

      const currentCanvasJSON = canvasActions.getCanvasJSON();
      const fabricCanvas = (window as any).__fabricCanvas;
      let canvasImageBase64 = null;

      if (fabricCanvas) {
        try {
          canvasImageBase64 = fabricCanvas.toDataURL({
            format: "png",
            quality: 0.8,
            multiplier: 1,
          });
          console.log("📸 Captured canvas screenshot");
        } catch (error) {
          console.error("Failed to capture canvas screenshot:", error);
        }
      }

      const response = await fetch("/api/ai/improve-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user",
          canvasId: canvas._id,
          projectId: canvas.project._id,
          brandId: canvas.project.brandId || null,
          canvasData: currentCanvasJSON,
          canvasScreenshot: canvasImageBase64,
          galleryImages: [],
          userPrompt: `Resize this design to ${targetWidth}x${targetHeight}px while maintaining the layout and proportions`,
        }),
      });

      const result = await response.json();

      if (result.success && result.canvasData) {
        const updateRes = await fetch(`/api/canvas/${canvas._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canvasData: result.canvasData,
            template: customSize ? "custom" : template,
          }),
        });

        if (updateRes.ok) {
          const fetchRes = await fetch(`/api/canvas/${canvas._id}`);
          const fetchData = await fetchRes.json();

          if (fetchData.success) {
            updateCanvas(fetchData.canvas);
            alert("Canvas resized successfully!");
          }
        }
      } else {
        alert("Failed to resize canvas");
      }
    } catch (error) {
      console.error("Resize error:", error);
      alert("Error resizing canvas");
    } finally {
      setIsResizing(false);
      setShowCustomDialog(false);
    }
  };

  const handleCustomResize = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      alert("Please enter valid dimensions");
      return;
    }

    if (width < 1 || width > 10000 || height < 1 || height > 10000) {
      alert("Canvas dimensions must be between 1 and 10000 pixels");
      return;
    }

    handleResizeCanvas("custom", { width, height });
  };

  // ✅ NEW: Download functions
  const downloadCanvas = (
    format: "png" | "jpeg",
    quality: "optimized" | "original"
  ) => {
    const fabricCanvas = (window as any).__fabricCanvas;
    if (!fabricCanvas || !canvas) {
      alert("Canvas not ready");
      return;
    }

    setIsDownloading(true);

    try {
      // Reset zoom to 1:1 for export
      const currentZoom = fabricCanvas.getZoom();
      const currentVpTransform = fabricCanvas.viewportTransform
        ? [...fabricCanvas.viewportTransform]
        : null;

      fabricCanvas.setZoom(1);
      fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      let dataURL: string;
      let fileName: string;

      if (quality === "optimized") {
        // Optimized version - compress to < 500KB
        let qualityValue = format === "jpeg" ? 0.8 : 1.0;
        let multiplier = 1.0;

        // Try different quality settings to get under 500KB
        for (let q = qualityValue; q >= 0.3; q -= 0.1) {
          dataURL = fabricCanvas.toDataURL({
            format: format,
            quality: q,
            multiplier: multiplier,
          });

          // Estimate file size (base64 length * 0.75 / 1024)
          const estimatedSize = (dataURL.length * 0.75) / 1024;

          if (estimatedSize < 500) {
            console.log(
              `✅ Optimized ${format.toUpperCase()} size: ~${Math.round(
                estimatedSize
              )}KB`
            );
            break;
          }

          // If still too large, reduce multiplier
          if (q <= 0.3 && multiplier > 0.5) {
            multiplier -= 0.1;
            q = qualityValue; // Reset quality and try with lower resolution
          }
        }

        fileName = `${canvas.name}_optimized.${format}`;
      } else {
        // Original high quality version
        dataURL = fabricCanvas.toDataURL({
          format: format,
          quality: 1.0,
          multiplier: 1.0,
        });

        const estimatedSize = (dataURL!.length * 0.75) / 1024;
        console.log(
          `📦 Original ${format.toUpperCase()} size: ~${Math.round(
            estimatedSize
          )}KB`
        );

        fileName = `${canvas.name}_original.${format}`;
      }

      // Restore original zoom and viewport
      fabricCanvas.setZoom(currentZoom);
      if (currentVpTransform) {
        fabricCanvas.setViewportTransform(currentVpTransform);
      }
      fabricCanvas.renderAll();

      // Download the image
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataURL!;
      link.click();

      console.log(`✅ Downloaded: ${fileName}`);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download canvas");
    } finally {
      setIsDownloading(false);
    }
  };

  // Group templates by category
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

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-2 py-2">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className={`w-9 h-9 p-0 rounded-lg transition-all ${
                isSidebarOpen
                  ? "bg-indigo-100 text-indigo-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Logo />

            {isEditing ? (
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSave();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="w-48 h-8 text-sm"
                autoFocus
              />
            ) : (
              <button
                onClick={handleNameClick}
                className="text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded"
              >
                {canvas?.name || "Untitled"}
              </button>
            )}

            {/* Size dropdown */}
            {canvas && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={isResizing}
                  >
                    <Maximize2 className="w-3 h-3 mr-1" />
                    {canvas.template || "custom"} • {canvas.canvasData.width}×
                    {canvas.canvasData.height}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {/* Social Media Templates */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                    Social Media
                  </div>
                  {socialMediaTemplates.map(([key, config]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => handleResizeCanvas(key)}
                    >
                      {config.label}
                    </DropdownMenuItem>
                  ))}

                  {/* Other Templates */}
                  {otherTemplates.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                        Other
                      </div>
                      {otherTemplates.map(([key, config]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handleResizeCanvas(key)}
                        >
                          {config.label}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowCustomDialog(true)}>
                    Custom Size...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Center - Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0 rounded-lg"
              disabled
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0 rounded-lg"
              disabled
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              Save
            </Button>

            {canvas?.project && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/project/${canvas.project._id}`)}
              >
                {canvas.project.name}
              </Button>
            )}

            {/* ✅ Download dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isDownloading}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                  Optimized (&lt;500KB)
                </div>
                <DropdownMenuItem
                  onClick={() => downloadCanvas("png", "optimized")}
                >
                  PNG - Optimized
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => downloadCanvas("jpeg", "optimized")}
                >
                  JPEG - Optimized
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                  High Quality (Original)
                </div>
                <DropdownMenuItem
                  onClick={() => downloadCanvas("png", "original")}
                >
                  PNG - Original Quality
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => downloadCanvas("jpeg", "original")}
                >
                  JPEG - Original Quality
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Custom size dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Canvas Size</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                min="1"
                max="10000"
                placeholder="1920"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                min="1"
                max="10000"
                placeholder="1080"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
              />
            </div>

            <p className="text-xs text-gray-500">Maximum size: 10000×10000px</p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomDialog(false);
                setCustomWidth("");
                setCustomHeight("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCustomResize} disabled={isResizing}>
              {isResizing ? "Resizing..." : "Resize Canvas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CanvasHeader;
