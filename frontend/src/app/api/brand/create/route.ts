// app/api/brand/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Brand from "@/models/Brand";
import User from "@/models/Brand";
import connectDB from "@/lib/connectDB";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();
    const body = await req.json();

    console.log("Creating Brand with Payload:", body);

    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const brand = new Brand({
      name: body.name,
      logoUrl: body.logoUrl || "",
      tagline: body.tagline || "",
      description: body.description || "",

      // Explicitly mapping visual fields
      brandIdentity: body.brandIdentity || "",
      fontType: body.fontType || "",
      colorTheme: body.colorTheme || "",
      backgroundImageUrl: body.backgroundImageUrl || "",

      owner: auth.user?.id,
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
