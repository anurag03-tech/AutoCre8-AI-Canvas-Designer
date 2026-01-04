// frontend/src/app/api/project/[projectId]/canvas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Canvas from "@/models/Canvas";
import Project from "@/models/Project";
import { CANVAS_TEMPLATES } from "@/lib/constants";

// GET - List canvases
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
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

    const canvases = await Canvas.find({ project: projectId })
      .select("name description thumbnail template createdAt updatedAt")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, canvases });
  } catch (e: any) {
    console.error("❌ Canvas GET error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST - Create canvas
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
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

    const { name, description, template, customWidth, customHeight } =
      await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Canvas name required" },
        { status: 400 }
      );
    }

    // ✅ Handle custom dimensions
    let width: number;
    let height: number;
    let unit: string;

    if (template === "custom") {
      // Custom canvas - use provided dimensions
      if (!customWidth || !customHeight) {
        return NextResponse.json(
          { error: "Custom canvas requires width and height" },
          { status: 400 }
        );
      }

      // Validate dimensions
      const w = parseInt(customWidth);
      const h = parseInt(customHeight);

      if (isNaN(w) || isNaN(h) || w < 1 || w > 10000 || h < 1 || h > 10000) {
        return NextResponse.json(
          { error: "Canvas dimensions must be between 1 and 10000 pixels" },
          { status: 400 }
        );
      }

      width = w;
      height = h;
      unit = "px";
    } else {
      // Preset template - use template config
      const templateConfig =
        CANVAS_TEMPLATES[template as keyof typeof CANVAS_TEMPLATES];

      if (!templateConfig) {
        return NextResponse.json(
          { error: "Invalid template" },
          { status: 400 }
        );
      }

      width = templateConfig.width;
      height = templateConfig.height;
      unit = templateConfig.unit;
    }

    // Create canvas
    const canvas = await Canvas.create({
      name,
      description,
      template,
      project: projectId,
      owner: userId,
      unit,
      canvasData: {
        version: "1.0.0",
        objects: [],
        background: "#ffffff",
        width,
        height,
      },
    });

    return NextResponse.json({ success: true, canvas });
  } catch (e: any) {
    console.error("❌ Canvas POST error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
