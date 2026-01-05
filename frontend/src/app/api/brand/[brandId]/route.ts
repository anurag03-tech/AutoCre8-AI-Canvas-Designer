// app/api/brand/[brandId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import Brand from "@/models/Brand";
import User from "@/models/User";

// GET - Get brand details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const brand = await Brand.findById(brandId)
      .populate("owner", "name email image")
      .populate("viewers", "name email image");

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    const userId = auth.user?.id;
    const isOwner = brand.owner._id.toString() === userId;
    const isViewer = brand.viewers?.some(
      (v: any) => v._id.toString() === userId
    );

    if (!isOwner && !isViewer) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, brand, isOwner });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update brand
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();
    const brand = await Brand.findById(brandId);

    if (!brand)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    if (brand.owner.toString() !== auth.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("Updating Brand:", brandId, body);

    // Explicitly defining allowed fields for update
    const allowedFields = [
      "name",
      "logoUrl",
      "tagline",
      "description",
      "brandIdentity",
      "fontType",
      "colorTheme",
      "backgroundImageUrl",
    ];

    allowedFields.forEach((field) => {
      // Allow empty strings to clear values, but ignore undefined
      if (body[field] !== undefined) {
        brand[field] = body[field];
      }
    });

    await brand.save();

    return NextResponse.json({ success: true, brand });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();
    const brand = await Brand.findById(brandId);

    if (!brand)
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    if (brand.owner.toString() !== auth.user?.id)
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );

    await Brand.findByIdAndDelete(brandId);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
