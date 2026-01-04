/// (dashboard)/canvas/[canvasId]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCanvas } from "@/contexts/CanvasContext";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useCanvasKeyboard } from "@/hooks/useCanvasKeyboard";

const CanvasPage = () => {
  const params = useParams();
  const router = useRouter();
  const canvasId = params.canvasId as string;

  const { canvas, setCanvas } = useCanvas();
  const [loading, setLoading] = useState(true);

  useCanvasKeyboard();

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/canvas/${canvasId}`);
        const data = await res.json();

        if (data.success) {
          setCanvas(data.canvas);
        } else {
          router.push("/project");
        }
      } catch (e) {
        console.error("Error fetching canvas:", e);
        router.push("/project");
      } finally {
        setLoading(false);
      }
    };

    fetchCanvas();
  }, [canvasId, router, setCanvas]);

  // Pass canvasId + canvasData to hook
  const { canvasRef, containerRef, fabricCanvasRef, scale } = useFabricCanvas({
    canvasId,
    canvasData: canvas?.canvasData || {
      width: 800,
      height: 600,
      background: "#ffffff",
      objects: [],
    },
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-b-2 border-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!canvas) return null;

  return (
    <div className="flex-1 flex flex-col bg-gray-100 h-full">
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden p-4"
      >
        <div className="bg-white shadow-xl border border-gray-200">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-xs text-gray-600">
        <span>
          {canvas.canvasData.width} × {canvas.canvasData.height} {canvas.unit}
        </span>
        <span>Zoom: {Math.round(scale * 100)}%</span>
        <span className="text-gray-400">
          Objects: {fabricCanvasRef.current?.getObjects().length || 0}
        </span>
      </div>
    </div>
  );
};

export default CanvasPage;
