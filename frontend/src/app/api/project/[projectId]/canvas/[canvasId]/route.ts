import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import { requireAuth } from "@/lib/auth";
import { Canvas, Project, Brand, User } from "@/models";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ projectId: string; canvasId: string }> }
) {
  try {
    const { projectId, canvasId } = await context.params;

    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner.toString() !== auth.user!.id) {
      return NextResponse.json(
        { error: "Only owner can delete canvas" },
        { status: 403 }
      );
    }

    const canvas = await Canvas.findOne({
      _id: canvasId,
      project: projectId,
    });

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    // ✅ Delete canvas
    await canvas.deleteOne();

    // ✅ Optional but recommended: remove ref from project
    await Project.findByIdAndUpdate(projectId, {
      $pull: { canvases: canvas._id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ DELETE canvas error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
