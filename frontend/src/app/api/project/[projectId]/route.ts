// frontend/src/app/api/project/[projectId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Project from "@/models/Project";
import User from "@/models/User";
import Brand from "@/models/Brand";

// GET - Get project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const userId = auth.user?.id;
    const isOwner = project.owner.toString() === userId;
    const isCollaborator = project.collaborators?.some(
      (c: any) => c.toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await project.populate("owner", "name email image");
    await project.populate("collaborators", "name email image");
    await project.populate("brand", "name logoUrl");

    return NextResponse.json({ success: true, project, isOwner });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PATCH - Update project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner.toString() !== auth.user?.id) {
      return NextResponse.json(
        { error: "Only owner can update" },
        { status: 403 }
      );
    }

    const updates = await req.json();

    // Update allowed fields
    if (updates.name) project.name = updates.name;
    if (updates.description !== undefined)
      project.description = updates.description;
    if (updates.brand !== undefined) project.brand = updates.brand;
    if (updates.guidelines) project.guidelines = updates.guidelines;

    await project.save();

    return NextResponse.json({ success: true, project });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner.toString() !== auth.user?.id) {
      return NextResponse.json(
        { error: "Only owner can delete" },
        { status: 403 }
      );
    }

    await Project.findByIdAndDelete(projectId);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
