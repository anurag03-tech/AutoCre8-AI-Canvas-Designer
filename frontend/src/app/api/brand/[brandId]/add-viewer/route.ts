import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";

// Import models from index
import { User, Brand } from "@/models";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;

    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const brand = await Brand.findById(brandId);

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // Only owner can add viewers
    if (brand.owner.toString() !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: "Only owner can add viewers" },
        { status: 403 }
      );
    }

    // Find user by email
    const userToAdd = await User.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already owner
    if (userToAdd._id.toString() === brand.owner.toString()) {
      return NextResponse.json(
        { success: false, error: "User is already the owner" },
        { status: 400 }
      );
    }

    // Check if user is already a viewer
    if (
      brand.viewers.some((v: any) => v.toString() === userToAdd._id.toString())
    ) {
      return NextResponse.json(
        { success: false, error: "User is already a viewer" },
        { status: 400 }
      );
    }

    // Add viewer
    brand.viewers.push(userToAdd._id);
    await brand.save();

    return NextResponse.json({
      success: true,
      message: `${userToAdd.name} added as viewer`,
      viewer: {
        id: userToAdd._id,
        name: userToAdd.name,
        email: userToAdd.email,
        image: userToAdd.image,
      },
    });
  } catch (error: any) {
    console.error("Error adding viewer:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add viewer" },
      { status: 500 }
    );
  }
}
