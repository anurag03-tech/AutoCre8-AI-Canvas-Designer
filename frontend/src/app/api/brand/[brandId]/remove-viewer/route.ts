import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";

// Import models from index
import { Brand } from "@/models";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;

    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
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

    // Only owner can remove viewers
    if (brand.owner.toString() !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: "Only owner can remove viewers" },
        { status: 403 }
      );
    }

    // Remove viewer
    brand.viewers = brand.viewers.filter((v: any) => v.toString() !== userId);
    await brand.save();

    return NextResponse.json({
      success: true,
      message: "Viewer removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing viewer:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove viewer" },
      { status: 500 }
    );
  }
}
