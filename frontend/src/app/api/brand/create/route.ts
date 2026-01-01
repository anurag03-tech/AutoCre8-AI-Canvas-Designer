import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Brand from "@/models/Brand";
import connectDB from "@/lib/connectDB";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    console.log("Creating brand with owner ID:", auth.user.id);
    console.log("User sub (should NOT use this):", auth.user.sub);

    await connectDB();

    const body = await req.json();
    const {
      name,
      logoUrl,
      tagline,
      description,
      industry,
      keywords,
      values,
      mission,
      vision,
    } = body;

    if (!name || !logoUrl) {
      return NextResponse.json(
        { error: "Name and logo URL are required" },
        { status: 400 }
      );
    }

    // CRITICAL: Use auth.user.id (NOT auth.user?.id or auth.user.sub)
    const brand = new Brand({
      name,
      logoUrl,
      tagline,
      description,
      industry,
      keywords,
      values,
      mission,
      vision,
      owner: auth.user.id,
      viewers: [],
    });

    await brand.save();

    return NextResponse.json({
      success: true,
      brand,
      message: "Brand created successfully",
    });
  } catch (error: any) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}
