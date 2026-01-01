import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Project from "@/models/Project";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { userId } = await req.json();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner.toString() !== auth.user?.id) {
      return NextResponse.json(
        { error: "Only owner can remove" },
        { status: 403 }
      );
    }

    project.collaborators = project.collaborators?.filter(
      (c: any) => c.toString() !== userId
    );
    await project.save();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
