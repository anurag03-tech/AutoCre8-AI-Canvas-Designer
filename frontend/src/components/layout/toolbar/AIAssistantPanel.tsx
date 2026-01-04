// components/layout/toolbar/AIAssistantPanel.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useCanvas } from "@/contexts/CanvasContext";
import { useParams } from "next/navigation";

const AIAssistantPanel = () => {
  const { canvas, canvasActions } = useCanvas();
  const params = useParams();
  const canvasId = params?.canvasId as string;

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick prompt suggestions
  const suggestions = [
    "Make it more modern",
    "Add more vibrant colors",
    "Improve text hierarchy",
    "Make it minimalist",
  ];

  const handleImproveDesign = async () => {
    if (!canvas || !canvasActions || !prompt.trim() || !canvasId) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentCanvasData = canvasActions.getCanvasJSON?.();
      if (!currentCanvasData) {
        throw new Error("Failed to get canvas data");
      }

      const galleryRes = await fetch(
        `/api/imagekit/list/${canvas.project._id}`
      );
      const galleryData = await galleryRes.json();
      const galleryImages = galleryData.success ? galleryData.images : [];

      const response = await fetch("/api/ai/improve-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvasId,
          canvasData: currentCanvasData,
          galleryImages,
          userPrompt: prompt,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to improve design");
      }

      const result = await response.json();
      canvasActions.loadCanvasJSON?.(result.canvasData);

      setPrompt("");
      setError(null);
    } catch (err) {
      console.error("AI improve error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Wand2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">AI Assistant</h4>
          <p className="text-xs text-gray-500">Improve your design</p>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">
          Quick Ideas
        </Label>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div>
        <Label className="text-xs font-medium text-gray-700 mb-2 block">
          Your Request
        </Label>
        <Textarea
          placeholder="Describe what you want to change..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="text-sm resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={handleImproveDesign}
        disabled={loading || !prompt.trim()}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="default"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Design...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Send
          </>
        )}
      </Button>
    </div>
  );
};

// ✅ Add Label import
import { Label } from "@/components/ui/label";

export default AIAssistantPanel;
