import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { htmlContent, canvasWidth, canvasHeight } = body;

    if (!htmlContent || !canvasWidth || !canvasHeight) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call FastAPI backend
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const response = await fetch(
      `${fastApiUrl}/api/conversion/html-to-fabric`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.FASTAPI_API_KEY || "",
        },
        body: JSON.stringify({
          html_content: htmlContent,
          canvas_width: canvasWidth,
          canvas_height: canvasHeight,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("FastAPI error:", error);
      return NextResponse.json(
        { error: "Failed to convert HTML to canvas" },
        { status: response.status }
      );
    }

    const result = await response.json();
    const res = JSON.stringify(result);

    console.log("HTML : ", htmlContent);

    console.log("FastAPI response status:", res);

    //  Return COMPLETE canvas data
    return NextResponse.json({
      success: true,
      canvasData: {
        version: result.version || "6.0.0",
        width: result.width || canvasWidth,
        height: result.height || canvasHeight,
        background: result.background || "#ffffff",
        objects: result.objects || [],
      },
    });
  } catch (error) {
    console.error("HTML to Canvas API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
