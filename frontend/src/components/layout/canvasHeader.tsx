"use client";

import React, { useState } from "react";
import {
  Menu,
  Download,
  ChevronDown,
  Check,
  FileImage,
  Image as ImageIcon,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "../shared/Logo";
import { useCanvas } from "@/contexts/CanvasContext";
import { useRouter } from "next/navigation";
import { ResizeDropdown } from "./canvas-resize/ResizeDropdown";

const CanvasHeader = ({
  onToggleSidebar,
  isSidebarOpen,
}: {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}) => {
  const { canvas, updateCanvasName, canvasActions, updateCanvas } = useCanvas();
  const router = useRouter();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAnySidePanelOpen, setIsAnySidePanelOpen] = useState(false);

  // Download Settings State
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg">("png");
  const [downloadQuality, setDownloadQuality] = useState<
    "normal" | "optimized" | "high"
  >("high");

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

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await canvasActions.saveCanvas();
      setSaveSuccess(true);

      // Reset success indicator after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save canvas");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResizeCanvas = async (
    template: string,
    customSize?: { width: number; height: number }
  ) => {
    if (!canvasActions?.getCanvasJSON) return;
    setIsResizing(true);
    setTimeout(() => {
      setIsResizing(false);
      alert("Resize logic would run here");
    }, 1000);
  };

  const normalizeCanvasContent = (fabricCanvas: any) => {
    const objects = fabricCanvas
      .getObjects()
      .filter((o: any) => o !== fabricCanvas.backgroundImage);
    if (!objects.length) return;
    let minY = Infinity;
    let maxY = -Infinity;
    objects.forEach((obj: any) => {
      const rect = obj.getBoundingRect(true);
      minY = Math.min(minY, rect.top);
      maxY = Math.max(maxY, rect.top + rect.height);
    });
    const contentHeight = maxY - minY;
    if (contentHeight < fabricCanvas.height) {
      const offsetY = (fabricCanvas.height - contentHeight) / 2 - minY;
      objects.forEach((obj: any) => {
        obj.top += offsetY;
        obj.setCoords();
      });
    }
  };

  const downloadCanvas = () => {
    const fabricCanvas = (window as any).__fabricCanvas;
    if (!fabricCanvas || !canvas) {
      alert("Canvas not ready");
      return;
    }

    setIsDownloading(true);

    const originalZoom = fabricCanvas.getZoom();
    const originalVp = fabricCanvas.viewportTransform
      ? [...fabricCanvas.viewportTransform]
      : null;
    const originalObjects = fabricCanvas
      .getObjects()
      .map((o: any) => ({ obj: o, top: o.top }));

    try {
      fabricCanvas.setZoom(1);
      fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      normalizeCanvasContent(fabricCanvas);
      fabricCanvas.renderAll();

      let dataURL = "";
      let finalFormat = downloadFormat;
      let multiplier = 1;

      switch (downloadQuality) {
        case "high":
          multiplier = 3;
          dataURL = fabricCanvas.toDataURL({
            format: downloadFormat,
            quality: 1,
            multiplier: multiplier,
          });
          break;

        case "normal":
          multiplier = 1;
          dataURL = fabricCanvas.toDataURL({
            format: downloadFormat,
            quality: 1,
            multiplier: multiplier,
          });
          break;

        case "optimized":
          multiplier = 1;

          if (downloadFormat === "png") {
            const qualitySteps = [0.85, 0.75, 0.65, 0.55, 0.45];
            for (const q of qualitySteps) {
              const testURL = fabricCanvas.toDataURL({
                format: "jpeg",
                quality: q,
                multiplier: 1,
              });
              const sizeKB = (testURL.length * 0.75) / 1024;
              if (sizeKB <= 500) {
                dataURL = testURL;
                finalFormat = "jpeg";
                break;
              }
            }
          } else {
            const qualitySteps = [0.85, 0.75, 0.65, 0.55, 0.45];
            for (const q of qualitySteps) {
              const testURL = fabricCanvas.toDataURL({
                format: "jpeg",
                quality: q,
                multiplier: 1,
              });
              const sizeKB = (testURL.length * 0.75) / 1024;
              if (sizeKB <= 500) {
                dataURL = testURL;
                break;
              }
            }
          }

          if (!dataURL) {
            dataURL = fabricCanvas.toDataURL({
              format: "jpeg",
              quality: 0.4,
              multiplier: 1,
            });
            finalFormat = "jpeg";
          }
          break;
      }

      if (!dataURL) throw new Error("Failed to generate image");

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `${canvas.name}_${downloadQuality}.${finalFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed");
    } finally {
      originalObjects.forEach(({ obj, top }) => {
        obj.top = top;
        obj.setCoords();
      });
      fabricCanvas.setZoom(originalZoom);
      if (originalVp) fabricCanvas.setViewportTransform(originalVp);
      fabricCanvas.renderAll();
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2.5">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className={`w-9 h-9 p-0 rounded-lg transition-all ${
              isSidebarOpen
                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
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
              className="w-48 h-8 text-sm border-indigo-300 focus:border-indigo-500"
              autoFocus
            />
          ) : (
            <button
              onClick={handleNameClick}
              className="text-sm font-semibold hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
            >
              {canvas?.name || "Untitled Canvas"}
            </button>
          )}

          {canvas && canvasActions && (
            <ResizeDropdown
              currentTemplate={canvas.template || "custom"}
              currentWidth={canvas.canvasData.width}
              currentHeight={canvas.canvasData.height}
              canvasData={canvasActions.getCanvasJSON()}
              canvasId={canvas._id}
              onResize={handleResizeCanvas}
              isResizing={isResizing}
              isAnySidePanelOpen={isAnySidePanelOpen}
              onSidePanelChange={setIsAnySidePanelOpen}
            />
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Save Button with States */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={`transition-all cursor-pointer border-blue-500 ${
              saveSuccess
                ? "bg-green-50 border-green-500 text-green-700 hover:bg-green-100"
                : ""
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                Save
              </>
            )}
          </Button>

          {/* Project Badge */}
          {canvas?.project && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/project/${canvas.project._id}`)}
              className="border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
            >
              <span className="max-w-32 truncate">{canvas.project.name}</span>
            </Button>
          )}

          {/* Enhanced Download Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading || isAnySidePanelOpen}
                className="bg-indigo-600 text-white border-none shadow-sm hover:bg-indigo-700 hover:text-white active:text-white focus:text-white data-[state=open]:text-white cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1.5" />
                )}
                {isDownloading ? "Exporting..." : "Export"}
                <ChevronDown className="w-3 h-3 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0">
              {/* Header */}
              <div className="px-4 py-3 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="font-semibold text-sm text-gray-900">
                  Export Design
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Choose your preferred format and quality
                </p>
              </div>

              <div className="p-4 space-y-4">
                {/* Format Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    File Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDownloadFormat("png")}
                      className={`flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg border-2 transition-all ${
                        downloadFormat === "png"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      PNG
                    </button>
                    <button
                      onClick={() => setDownloadFormat("jpeg")}
                      className={`flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-lg border-2 transition-all ${
                        downloadFormat === "jpeg"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FileImage className="w-4 h-4" />
                      JPEG
                    </button>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-3" />

                {/* Quality Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Export Quality
                  </label>
                  <div className="space-y-1.5">
                    {[
                      {
                        key: "normal",
                        label: "Normal",
                        desc: "1× resolution • Best for web",
                      },
                      {
                        key: "optimized",
                        label: "Optimized",
                        desc: "Compressed < 500KB • Smallest file",
                      },
                      {
                        key: "high",
                        label: "High Quality",
                        desc: "3× resolution • Print ready",
                      },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() =>
                          setDownloadQuality(
                            option.key as typeof downloadQuality
                          )
                        }
                        className={`w-full text-left px-3 py-3 text-sm rounded-lg transition-all flex items-start justify-between group border-2 ${
                          downloadQuality === option.key
                            ? "bg-indigo-50 border-indigo-200"
                            : "hover:bg-gray-50 border-transparent"
                        }`}
                      >
                        <div>
                          <div
                            className={`font-semibold ${
                              downloadQuality === option.key
                                ? "text-indigo-700"
                                : "text-gray-800"
                            }`}
                          >
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {option.desc}
                          </div>
                        </div>
                        {downloadQuality === option.key && (
                          <Check className="w-5 h-5 text-indigo-600 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={downloadCanvas}
                  disabled={isDownloading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating {downloadFormat.toUpperCase()}...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download {downloadFormat.toUpperCase()}
                    </>
                  )}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default CanvasHeader;
