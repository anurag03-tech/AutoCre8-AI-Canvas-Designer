import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Project from "@/models/Project";
import User from "@/models/User";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { email, userId } = await req.json();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.owner.toString() !== auth.user?.id) {
      return NextResponse.json(
        { error: "Only owner can add collaborators" },
        { status: 403 }
      );
    }

    // Find user
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      return NextResponse.json(
        { error: "Provide email or userId" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if owner
    if (user._id.toString() === project.owner.toString()) {
      return NextResponse.json({ error: "User is owner" }, { status: 400 });
    }

    // Check if already collaborator
    if (
      project.collaborators?.some(
        (c: any) => c.toString() === user._id.toString()
      )
    ) {
      return NextResponse.json(
        { error: "Already a collaborator" },
        { status: 400 }
      );
    }

    // Add
    project.collaborators = project.collaborators || [];
    project.collaborators.push(user._id);
    await project.save();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
