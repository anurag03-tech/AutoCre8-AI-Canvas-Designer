// frontend/src/app/(dashboard)/canvas/[canvasId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCanvas } from "@/contexts/CanvasContext";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useAIPreview } from "@/contexts/AIPreviewContext";
import { useCanvasKeyboard } from "@/hooks/useCanvasKeyboard";

const CanvasPage = () => {
  const params = useParams();
  const router = useRouter();
  const canvasId = params.canvasId as string;

  const { canvas, setCanvas } = useCanvas();
  const { isPreviewMode, previewHtml } = useAIPreview();
  const [loading, setLoading] = useState(true);

  useCanvasKeyboard();

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/canvas/${canvasId}`);
        const data = await res.json();
        if (data.success) setCanvas(data.canvas);
        else router.push("/project");
      } catch (e) {
        router.push("/project");
      } finally {
        setLoading(false);
      }
    };
    fetchCanvas();
  }, [canvasId, router, setCanvas]);

  const { canvasRef, containerRef, fabricCanvasRef, scale } = useFabricCanvas({
    canvasId,
    canvasData: canvas?.canvasData,
  });

  if (loading || !canvas) {
    return (
      <div className="flex-1 flex items-center justify-center">Loading...</div>
    );
  }

  const canvasWidth = canvas.canvasData.width;
  const canvasHeight = canvas.canvasData.height;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden ">
      {/* Main Container: Measures available space */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative p-8"
      >
        <div
          className={`
            bg-white shadow-2xl relative
            ${
              isPreviewMode
                ? "border-4 border-purple-600"
                : "border border-gray-200"
            }
          `}
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* FABRIC CANVAS - No transform here, just display control */}
          <div
            style={{
              display: isPreviewMode ? "none" : "block",
              width: "100%",
              height: "100%",
            }}
          >
            <canvas ref={canvasRef} />
          </div>

          {/* AI PREVIEW */}
          {isPreviewMode && previewHtml && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>
      </div>

      {/* FOOTER STATUS BAR */}
      <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-xs text-gray-600">
        <div className="flex gap-4">
          <span>
            <strong>Dimensions:</strong> {canvasWidth} × {canvasHeight}px
          </span>
          <span>
            <strong>Zoom:</strong> {Math.round(scale * 100)}%
          </span>
        </div>
        <div>
          {isPreviewMode
            ? "✨ AI Preview"
            : `Objects: ${fabricCanvasRef.current?.getObjects().length || 0}`}
        </div>
      </div>
    </div>
  );
};

export default CanvasPage;
