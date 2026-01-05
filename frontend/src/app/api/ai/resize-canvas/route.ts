// frontend/src/app/api/ai/resize-canvas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { canvasData, targetWidth, targetHeight, canvasScreenshot } = body;

    // Validate inputs
    if (!canvasData || !targetWidth || !targetHeight) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call FastAPI backend
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const response = await fetch(`${fastApiUrl}/api/resize-canvas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add API key if needed
        "X-API-Key": process.env.FASTAPI_API_KEY || "",
      },
      body: JSON.stringify({
        canvas_data: canvasData,
        target_width: targetWidth,
        target_height: targetHeight,
        canvas_screenshot: canvasScreenshot,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("FastAPI error:", error);
      return NextResponse.json(
        { error: error.detail || "Failed to resize canvas" },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      previewHtml: result.preview_html,
      resizedCanvasData: result.resized_canvas_data,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error("Resize API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
