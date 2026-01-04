// src/app/api/brand/[brandId]/remove-viewer/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import { Brand } from "@/models";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;

    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    if (!auth.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    if (brand.owner.toString() !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: "Only owner can remove viewers" },
        { status: 403 }
      );
    }

    // ✅ FIXED: Use any with eslint-disable comment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    brand.viewers = brand.viewers.filter((v: any) => v.toString() !== userId);
    await brand.save();

    return NextResponse.json({
      success: true,
      message: "Viewer removed successfully",
    });
  } catch (error) {
    console.error("Error removing viewer:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to remove viewer",
      },
      { status: 500 }
    );
  }
}
