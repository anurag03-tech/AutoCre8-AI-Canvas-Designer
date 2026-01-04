import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Canvas from "@/models/Canvas";
import Project from "@/models/Project";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    // 2. Parse request body
    const body = await req.json();
    const {
      canvasId,
      canvasData,
      canvasScreenshot,
      galleryImages,
      userPrompt,
    } = body;

    if (!canvasId || !canvasData || !userPrompt) {
      return NextResponse.json(
        { error: "Missing required fields: canvasId, canvasData, userPrompt" },
        { status: 400 }
      );
    }

    //  3. Connect to DB and fetch canvas → project → brand
    await connectDB();

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    // Verify ownership
    if (canvas.owner.toString() !== auth.user?.id) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this canvas" },
        { status: 403 }
      );
    }

    const project = await Project.findById(canvas.project);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectId = project._id.toString();
    const brandId = project.brand ? project.brand.toString() : null;

    // 🔍 DEBUG
    console.log("\n" + "=".repeat(60));
    console.log("📤 SENDING TO FASTAPI:");
    console.log("=".repeat(60));
    console.log("userId:", auth.user?.id);
    console.log("canvasId:", canvasId);
    console.log("projectId:", projectId);
    console.log("brandId:", brandId || "NULL");
    console.log("userPrompt:", userPrompt);
    console.log(
      "Canvas:",
      `${canvasData?.width}x${canvasData?.height}`,
      `${canvasData?.objects?.length || 0} objects`
    );
    console.log(
      "Screenshot:",
      canvasScreenshot
        ? `${(canvasScreenshot.length / 1024).toFixed(0)}KB`
        : "Not provided"
    );
    console.log("Gallery:", `${galleryImages?.length || 0} images`);
    console.log("=".repeat(60) + "\n");

    // 4. Call FastAPI
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";

    const payload = {
      userId: auth.user?.id,
      canvasId,
      projectId,
      brandId,
      canvasData,
      canvasScreenshot,
      galleryImages: galleryImages || [],
      userPrompt,
    };

    const response = await fetch(`${fastApiUrl}/ai/improve-design`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      console.error("❌ FastAPI error:", error);
      return NextResponse.json(
        { error: error.detail || "AI service failed" },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("✅ AI design improved successfully\n");
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
