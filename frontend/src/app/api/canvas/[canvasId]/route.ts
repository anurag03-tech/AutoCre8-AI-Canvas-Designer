import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Canvas from "@/models/Canvas";
import Project from "@/models/Project";

// GET - Get canvas
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const { canvasId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const canvas = await Canvas.findById(canvasId).populate("project");

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    const project = await Project.findById(canvas.project);
    const userId = auth.user?.id;
    const isOwner = project.owner.toString() === userId;
    const isCollaborator = project.collaborators?.some(
      (c: any) => c.toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, canvas });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH - Update canvas
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const { canvasId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    const project = await Project.findById(canvas.project);
    const userId = auth.user?.id;
    const isOwner = project.owner.toString() === userId;
    const isCollaborator = project.collaborators?.some(
      (c: any) => c.toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updates = await req.json();

    if (updates.name) canvas.name = updates.name;
    if (updates.description !== undefined)
      canvas.description = updates.description;
    if (updates.canvasData) canvas.canvasData = updates.canvasData;
    if (updates.thumbnail) canvas.thumbnail = updates.thumbnail;

    await canvas.save();

    return NextResponse.json({ success: true, canvas });
  } catch (e: any) {
    console.error("PATCH /api/canvas error:", e); // 👈 add this
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const { canvasId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    if (canvas.owner.toString() !== auth.user?.id) {
      return NextResponse.json(
        { error: "Only owner can delete" },
        { status: 403 }
      );
    }

    await Canvas.findByIdAndDelete(canvasId);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
