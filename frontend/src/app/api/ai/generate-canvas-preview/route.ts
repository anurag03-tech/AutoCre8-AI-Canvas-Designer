import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { canvasData, canvasScreenshot } = body;

    if (!canvasData) {
      return NextResponse.json(
        { error: "Missing canvas data" },
        { status: 400 }
      );
    }

    // Call FastAPI backend
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const response = await fetch(`${fastApiUrl}/api/preview/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.FASTAPI_API_KEY || "",
      },
      body: JSON.stringify({
        canvas_data: canvasData,
        //canvas_screenshot: canvasScreenshot,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("FastAPI error:", error);
      return NextResponse.json(
        { error: error.detail || "Failed to generate preview" },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      previewHtml: result.preview_html,
    });
  } catch (error) {
    console.error("Preview API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
