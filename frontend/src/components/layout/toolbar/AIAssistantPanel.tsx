"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Sparkles,
  Send,
  Paperclip,
  X,
  Maximize2,
  Minimize2,
  Download,
  Upload,
} from "lucide-react";
import { useCanvas } from "@/contexts/CanvasContext";
import { useAIPreview } from "@/contexts/AIPreviewContext";
import html2canvas from "html2canvas";

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string;
};

type Asset = {
  id: string;
  url: string;
  type: "image";
};

const AIAssistantPanel = () => {
  const { canvas, canvasActions, setCanvas } = useCanvas();
  const { isPreviewMode, setPreviewMode, setPreviewHtml } = useAIPreview();

  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIX: Separate state for Import and Export
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1080, height: 1080 });

  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvas?.canvasData) {
      setDimensions({
        width: canvas.canvasData.width || 1080,
        height: canvas.canvasData.height || 1080,
      });
    }
  }, [canvas]);

  useEffect(() => {
    setPreviewHtml(generatedHtml);
  }, [generatedHtml, setPreviewHtml]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getDefaultHtml = () => {
    return `<div style="width: ${dimensions.width}px; height: ${dimensions.height}px; background: #ffffff;"></div>`;
  };

  const handleImportToCanvas = async () => {
    if (!canvasActions?.getCanvasJSON) {
      console.error("Editor is not ready");
      return;
    }

    setIsImporting(true);

    try {
      const rawJson = canvasActions.getCanvasJSON();

      const canvasData = {
        ...rawJson,
        width: dimensions.width,
        height: dimensions.height,
        background: rawJson?.background || "#ffffff",
      };

      const res = await fetch("/api/ai/generate-canvas-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvasData }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate");
      }

      const data = await res.json();
      const htmlContent = data.previewHtml;

      if (htmlContent) {
        setGeneratedHtml(htmlContent);
        setMessages([
          {
            role: "assistant",
            content:
              "Canvas imported successfully! You can now preview or edit it.",
          },
        ]);
        setPreviewMode(true);
      } else {
        console.error("AI returned empty result");
      }
    } catch (err: any) {
      console.error("[Frontend] Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message || "Failed to import"}`,
        },
      ]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportToCanvas = async () => {
    if (!generatedHtml) {
      alert("No HTML to export");
      return;
    }

    if (!canvas) {
      alert("Canvas not ready");
      return;
    }

    // ✅ FIX: Use separate export state
    setIsExporting(true);

    try {
      const res = await fetch("/api/ai/html-to-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent: generatedHtml,
          canvasWidth: dimensions.width,
          canvasHeight: dimensions.height,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to convert HTML to canvas");
      }

      const data = await res.json();

      console.log(data);

      if (data.success && data.canvasData) {
        setCanvas({
          ...canvas,
          canvasData: data.canvasData,
        });

        setTimeout(() => {
          setPreviewMode(false);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `✅ Exported to canvas!`,
            },
          ]);
        }, 300);
      }
    } catch (err: any) {
      console.error("❌ Export Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Failed to export: ${err.message}`,
        },
      ]);
    } finally {
      // ✅ FIX: Turn off export loading
      setIsExporting(false);
    }
  };

  const handleChatEdit = async () => {
    if (!prompt.trim()) return;

    const currentPrompt = prompt;
    setPrompt("");
    setIsLoading(true);

    const currentHtml = generatedHtml || getDefaultHtml();

    let screenshotBase64 = null;
    if (previewRef.current) {
      try {
        const canvasSnap = await html2canvas(previewRef.current, {
          useCORS: true,
          allowTaint: true,
          scale: 0.5,
        });
        screenshotBase64 = canvasSnap.toDataURL("image/jpeg", 0.7);
      } catch (e) {
        console.error("Screenshot failed", e);
      }
    }

    const newMsg: Message = {
      role: "user",
      content: currentPrompt,
      image: screenshotBase64 || undefined,
    };
    setMessages((prev) => [...prev, newMsg]);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasId: canvas?._id,
          current_html: currentHtml,
          user_prompt: currentPrompt,
          chat_history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          selected_assets: selectedAssets,
          current_render_image: screenshotBase64,
        }),
      });

      if (!res.ok) throw new Error("Failed to edit");

      const data = await res.json();
      const newHtml = data.html || data.data?.html;
      let explanation =
        data.explanation || data.data?.explanation || "Updated.";

      if (explanation.length > 150) {
        explanation = explanation.substring(0, 147) + "...";
      }

      if (newHtml) {
        setGeneratedHtml(newHtml);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: explanation },
        ]);
        setSelectedAssets([]);
      }
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: `Error: ${error.message || "Failed to edit"}`,
        },
      ]);
      setPrompt(currentPrompt);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreview = () => {
    if (!generatedHtml) {
      console.log("No HTML to preview");
      return;
    }
    setPreviewMode(!isPreviewMode);
  };

  const addTestAsset = () => {
    const url = prompt("Enter Image URL:");
    if (url)
      setSelectedAssets([
        ...selectedAssets,
        { id: Date.now().toString(), url, type: "image" },
      ]);
  };

  const getSidebarScale = () => {
    if (!containerRef.current) return 1;
    const containerWidth = containerRef.current.offsetWidth - 24;
    const containerHeight = containerRef.current.offsetHeight - 24;

    const scaleX = containerWidth / dimensions.width;
    const scaleY = containerHeight / dimensions.height;

    return Math.min(scaleX, scaleY, 1);
  };

  const handleReset = () => {
    setGeneratedHtml(null);
    setPreviewHtml(null);
    setMessages([]);
    setPreviewMode(false);
    setSelectedAssets([]);
    setPrompt("");
  };

  const sidebarScale = getSidebarScale();
  const displayHtml = generatedHtml || getDefaultHtml();

  const displayMessages = messages.slice(-4);

  return (
    <div className="flex flex-col h-full bg-white w-full max-w-[400px] ">
      {/* Header */}
      <div className="px-3 pb-2 border-b flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Designer with AI
        </h2>
        {generatedHtml && (
          <button
            onClick={handleReset}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Reset
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-2 border-b flex gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant={isPreviewMode ? "default" : "outline"}
          onClick={togglePreview}
          className="flex-1 text-xs cursor-pointer"
          disabled={!generatedHtml}
        >
          {isPreviewMode ? (
            <Minimize2 className="w-3 h-3 mr-1" />
          ) : (
            <Maximize2 className="w-3 h-3 mr-1" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleImportToCanvas}
          className="flex-1 text-xs cursor-pointer"
          disabled={isImporting || isExporting}
        >
          {isImporting ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin " />
          ) : (
            <Upload className="w-3 h-3 mr-1" />
          )}
          Import
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportToCanvas}
          className="flex-1 text-xs cursor-pointer"
          disabled={isExporting || isImporting}
        >
          {isExporting ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Download className="w-3 h-3 mr-1 " />
          )}
          Export
        </Button>
      </div>

      {/* Preview Area  */}
      <div
        ref={containerRef}
        className="flex-1 bg-gray-50 p-3 flex items-center justify-center relative overflow-hidden"
        style={{ maxHeight: "220px", minHeight: "200px" }}
      >
        <div
          style={{
            width: `${dimensions.width * sidebarScale}px`,
            height: `${dimensions.height * sidebarScale}px`,
            position: "relative",
          }}
        >
          <div
            ref={previewRef}
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transform: `scale(${sidebarScale})`,
              transformOrigin: "top left",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
            }}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="border-t flex-shrink-0">
        <ScrollArea className="h-48 p-3">
          <div className="space-y-2">
            {displayMessages.length === 0 ? (
              <div className="text-center text text-blue-500 py-4">
                Start creating! Type a message to design with AI
              </div>
            ) : (
              displayMessages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                      m.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-sm text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Selected Assets */}
      {selectedAssets.length > 0 && (
        <div className="px-3 py-2 border-t flex gap-2 overflow-x-auto flex-shrink-0">
          {selectedAssets.map((asset) => (
            <div key={asset.id} className="relative w-10 h-10 shrink-0">
              <img
                src={asset.url}
                className="w-full h-full object-cover rounded"
                alt="asset"
              />
              <button
                onClick={() =>
                  setSelectedAssets(
                    selectedAssets.filter((a) => a.id !== asset.id)
                  )
                }
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-[2px] cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="pt-2 border-t flex gap-2 flex-shrink-0 bg-white">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your design or ask for changes..."
          className="text-xs resize-none max-h-20 transition-colors duration-150 border-blue-300  "
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleChatEdit();
            }
          }}
        />
        <div className="flex gap-1 flex-col ">
          <Button
            size="icon"
            className="h-9 w-9 bg-purple-600 hover:bg-purple-700 cursor-pointer"
            onClick={handleChatEdit}
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={addTestAsset}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
