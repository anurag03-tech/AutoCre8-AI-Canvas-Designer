import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import { Canvas, Project, Brand, User } from "@/models";

// GET - List projects
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const ownedProjects = await Project.find({ owner: auth.user?.id })
      .populate("brand", "name logoUrl")
      .sort({ updatedAt: -1 });

    const sharedProjects = await Project.find({
      collaborators: auth.user?.id,
    })
      .populate("owner", "name email image")
      .populate("brand", "name logoUrl")
      .sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      ownedProjects,
      sharedProjects,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST - Create project
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const project = await Project.create({
      name: body.name,
      description: body.description || "",
      brand: body.brandId || null,
      owner: auth.user?.id,
      collaborators: [],
      sharedAssets: [],
      guidelines: body.guidelines || {},
    });

    return NextResponse.json({ success: true, project });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
