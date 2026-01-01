import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Canvas from "@/models/Canvas";
import Project from "@/models/Project";

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

    const { name, description, template } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Canvas name required" },
        { status: 400 }
      );
    }

    const CANVAS_TEMPLATES: Record<
      string,
      { width: number; height: number; unit: string }
    > = {
      "instagram-post": { width: 1080, height: 1080, unit: "px" },
      "instagram-story": { width: 1080, height: 1920, unit: "px" },
      "facebook-post": { width: 1200, height: 630, unit: "px" },
      "twitter-post": { width: 1200, height: 675, unit: "px" },
      "linkedin-post": { width: 1200, height: 627, unit: "px" },
      "youtube-thumbnail": { width: 1280, height: 720, unit: "px" },
      poster: { width: 18, height: 24, unit: "in" },
      flyer: { width: 8.5, height: 11, unit: "in" },
      "business-card": { width: 3.5, height: 2, unit: "in" },
      "presentation-slide": { width: 1920, height: 1080, unit: "px" },
      "web-banner": { width: 728, height: 90, unit: "px" },
      custom: { width: 1920, height: 1080, unit: "px" },
    };

    const templateConfig =
      CANVAS_TEMPLATES[template] || CANVAS_TEMPLATES.custom;

    const canvas = await Canvas.create({
      name,
      description,
      template,
      project: projectId,
      owner: userId,
      unit: templateConfig.unit,
      canvasData: {
        version: "1.0.0",
        objects: [],
        background: "#ffffff",
        width: templateConfig.width,
        height: templateConfig.height,
      },
    });

    return NextResponse.json({ success: true, canvas });
  } catch (e: any) {
    console.error("❌ Canvas POST error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
