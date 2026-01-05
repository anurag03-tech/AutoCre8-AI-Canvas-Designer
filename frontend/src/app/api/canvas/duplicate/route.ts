import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Canvas from "@/models/Canvas";
import Project from "@/models/Project";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const {
      originalCanvasId,
      htmlContent,
      targetWidth,
      targetHeight,
      variationNumber,
    } = body;

    await connectDB();

    const userId = auth.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get original canvas
    const originalCanvas = await Canvas.findById(originalCanvasId);
    if (!originalCanvas) {
      return NextResponse.json(
        { error: "Original canvas not found" },
        { status: 404 }
      );
    }

    // Convert HTML to Fabric.js
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const conversionResponse = await fetch(
      `${fastApiUrl}/api/conversion/html-to-fabric`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.FASTAPI_API_KEY || "",
        },
        body: JSON.stringify({
          html_content: htmlContent,
          canvas_width: targetWidth,
          canvas_height: targetHeight,
        }),
      }
    );

    if (!conversionResponse.ok) {
      throw new Error("Failed to convert HTML to canvas");
    }

    const canvasData = await conversionResponse.json();

    // Generate unique name
    const baseName = originalCanvas.name.replace(/ \(\d+\)$/, "");
    const existingCanvases = await Canvas.find({
      project: originalCanvas.project,
      name: new RegExp(`^${baseName}( \\(\\d+\\))?$`),
    });

    let maxNumber = 0;
    existingCanvases.forEach((canvas: any) => {
      const match = canvas.name.match(/\((\d+)\)$/);
      if (match) {
        maxNumber = Math.max(maxNumber, parseInt(match[1]));
      }
    });

    const newName = `${baseName} (${maxNumber + 1})`;

    // Create new canvas with correct owner field
    const newCanvas = await Canvas.create({
      name: newName,
      description: `Resized variation ${variationNumber} - ${targetWidth}×${targetHeight}px`,
      project: originalCanvas.project,
      owner: userId,
      template: originalCanvas.template,
      canvasData: {
        version: canvasData.version || "6.0.0",
        width: targetWidth,
        height: targetHeight,
        background: canvasData.background || "#ffffff",
        objects: canvasData.objects || [],
      },
      thumbnail: originalCanvas.thumbnail,
      complianceRules: originalCanvas.complianceRules,
    });

    // Add to project's canvases array
    await Project.findByIdAndUpdate(originalCanvas.project, {
      $push: { canvases: newCanvas._id },
    });

    return NextResponse.json({
      success: true,
      canvas: newCanvas,
      canvasId: newCanvas._id,
    });
  } catch (error) {
    console.error("Canvas duplication error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
