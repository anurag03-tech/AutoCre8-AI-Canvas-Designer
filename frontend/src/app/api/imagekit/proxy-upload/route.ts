import { NextRequest, NextResponse } from "next/server";
import { imagekitServer } from "@/lib/imagekit-server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, projectId, fileName } = await req.json();

    if (!imageUrl || !projectId) {
      return NextResponse.json(
        { success: false, error: "Image URL and Project ID required" },
        { status: 400 }
      );
    }

    // Fetch the external image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    //  Upload to project-specific folder
    const result = await imagekitServer.upload({
      file: base64,
      fileName: fileName || `external-${Date.now()}.jpg`,
      folder: `/projects/${projectId}/images`,
      tags: ["canvas-image", projectId, "external"],
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        projectId: projectId,
      },
    });
  } catch (error: any) {
    console.error("ImageKit proxy upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
