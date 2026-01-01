import { NextRequest, NextResponse } from "next/server";
import { imagekitServer } from "@/lib/imagekit-server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID required" },
        { status: 400 }
      );
    }

    const files = await imagekitServer.listFiles({
      path: `/projects/${projectId}/images`,
      limit: 100,
    });

    return NextResponse.json({
      success: true,
      images: files.map((file: any) => ({
        fileId: file.fileId,
        name: file.name,
        url: file.url,
        thumbnail: file.thumbnail,
        createdAt: file.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("ImageKit list error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
