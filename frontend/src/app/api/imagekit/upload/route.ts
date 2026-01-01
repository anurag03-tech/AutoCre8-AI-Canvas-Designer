import { NextRequest, NextResponse } from "next/server";
import { imagekitServer } from "@/lib/imagekit-server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const projectId = formData.get("projectId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID required" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    //  Upload to project-specific folder
    const result = await imagekitServer.upload({
      file: base64,
      fileName: fileName || file.name,
      folder: `/projects/${projectId}/images`, // Organized by project
      tags: ["canvas-image", projectId], // For easy filtering
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
    console.error("ImageKit upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
