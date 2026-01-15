// app/api/canvas/[canvasId]/auto-fix-compliance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import { Canvas, Project, Brand, User } from "@/models";
import { autoFixCanvasCompliance } from "@/lib/langchain";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const { canvasId } = await params;

    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    if (!auth.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get canvas
    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    // Check access
    const project = await Project.findById(canvas.project);
    const userId = auth.user.id;
    const isOwner = project.owner.toString() === userId;
    const isCollaborator = project.collaborators?.some(
      (c: any) => c.toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if compliance rules exist
    if (!canvas.complianceRules || canvas.complianceRules.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "No compliance rules set for this canvas",
        },
        { status: 400 }
      );
    }

    // Get canvas screenshot from request body (optional)
    const body = await req.json();
    const canvasScreenshot = body.canvasScreenshot || null;

    console.log("🔧 Auto-fixing canvas:", canvasId);
    console.log("📋 Rules length:", canvas.complianceRules.length);
    console.log("📸 Screenshot provided:", !!canvasScreenshot);

    // Call LangChain auto-fix
    const autoFixResult = await autoFixCanvasCompliance(
      canvas.complianceRules,
      canvas.canvasData,
      canvasScreenshot
    );

    console.log("✅ Auto-fix complete:", {
      fixed: autoFixResult.fixed,
      changesCount: autoFixResult.changesMade.length,
      unfixableCount: autoFixResult.unfixableIssues.length,
    });

    // Return the fixed canvas data (DON'T save to DB - user decides)
    return NextResponse.json({
      success: true,
      autoFix: {
        fixed: autoFixResult.fixed,
        canvasData: autoFixResult.canvasData,
        changesMade: autoFixResult.changesMade,
        unfixableIssues: autoFixResult.unfixableIssues,
      },
    });
  } catch (error) {
    console.error("❌ Auto-fix error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to auto-fix canvas",
      },
      { status: 500 }
    );
  }
}
