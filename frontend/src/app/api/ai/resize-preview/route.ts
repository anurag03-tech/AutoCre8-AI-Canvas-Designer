import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { currentPreviewHtml, canvasScreenshot, targetWidth, targetHeight } =
      body;

    // Validate required fields
    if (!currentPreviewHtml || !targetWidth || !targetHeight) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: currentPreviewHtml, targetWidth, targetHeight",
        },
        { status: 400 }
      );
    }

    console.log("📤 Sending to FastAPI:");
    console.log("- Preview HTML length:", currentPreviewHtml.length);
    console.log(
      "- Screenshot:",
      canvasScreenshot ? "✅ Included" : "❌ Missing"
    );
    console.log("- Target dimensions:", `${targetWidth}×${targetHeight}`);

    // Call FastAPI backend
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const response = await fetch(`${fastApiUrl}/api/preview/resize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.FASTAPI_API_KEY || "",
      },
      body: JSON.stringify({
        current_preview_html: currentPreviewHtml,
        canvas_screenshot: canvasScreenshot,
        target_width: targetWidth,
        target_height: targetHeight,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("FastAPI error:", error);
      return NextResponse.json(
        { error: error.detail || "Failed to generate resized previews" },
        { status: response.status }
      );
    }

    const result = await response.json();

    console.log("📥 Received from FastAPI:");
    console.log(
      "- Variation 1 HTML length:",
      result.variation_1_html?.length || 0
    );
    console.log(
      "- Variation 2 HTML length:",
      result.variation_2_html?.length || 0
    );

    return NextResponse.json({
      success: true,
      variation1Html: result.variation_1_html,
      variation2Html: result.variation_2_html,
    });
  } catch (error) {
    console.error("Resize preview API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
