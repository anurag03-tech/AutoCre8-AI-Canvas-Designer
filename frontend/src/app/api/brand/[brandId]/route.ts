// frontend/src/app/api/brand/[brandId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import mongoose from "mongoose";

// Import all models from index to ensure proper registration
import { User, Brand } from "@/models";

// GET - Get brand by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    // Fetch brand without population first
    const brand = await Brand.findById(brandId);

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // Check access BEFORE populating (owner is ObjectId here)
    const userId = auth.user?.id;
    const isOwner = brand.owner.toString() === userId;
    const isViewer = brand.viewers?.some((v: any) => v.toString() === userId);
    const hasAccess = isOwner || isViewer;

    console.log("🔍 Access Check:", {
      userId,
      ownerId: brand.owner.toString(),
      isOwner,
      isViewer,
      hasAccess,
    });

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // NOW populate after access check passes
    await brand.populate("owner", "name email image");
    await brand.populate("viewers", "name email image");

    // Only populate projects if you have a Project model
    // If you don't have a Project model yet, comment this out
    // if (brand.projects && brand.projects.length > 0) {
    //   await brand.populate("projects");
    // }

    return NextResponse.json({
      success: true,
      brand,
      isOwner,
    });
  } catch (error: any) {
    console.error("❌ Error fetching brand:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch brand" },
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

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // Only owner can update
    if (brand.owner.toString() !== auth.user?.id) {
      return NextResponse.json(
        { success: false, error: "Only owner can update brand" },
        { status: 403 }
      );
    }

    const updates = await req.json();

    // Update allowed fields
    const allowedFields = [
      "name",
      "logoUrl",
      "tagline",
      "description",
      "industry",
      "keywords",
      "values",
      "mission",
      "vision",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        brand[field] = updates[field];
      }
    });

    await brand.save();

    return NextResponse.json({
      success: true,
      brand,
      message: "Brand updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update brand" },
      { status: 500 }
    );
  }
}

// DELETE - Delete brand
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

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // Only owner can delete
    if (brand.owner.toString() !== auth.user?.id) {
      return NextResponse.json(
        { success: false, error: "Only owner can delete brand" },
        { status: 403 }
      );
    }

    await Brand.findByIdAndDelete(brandId);

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}
