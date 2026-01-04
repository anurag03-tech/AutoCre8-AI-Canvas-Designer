// app/api/brand/generate-guidelines/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Brand from "@/models/Brand";
import connectDB from "@/lib/connectDB";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { brandId } = await req.json();

    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 }
      );
    }

    // Fetch brand
    const brand = await Brand.findById(brandId);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Verify ownership
    if (brand.owner.toString() !== auth.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log(`🤖 Generating guidelines for brand: ${brand.name}`);

    // Call FastAPI to generate guidelines
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";

    const response = await fetch(`${fastApiUrl}/brand/generate-guidelines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brandId: brand._id.toString(),
        name: brand.name,
        logoUrl: brand.logoUrl,
        tagline: brand.tagline,
        description: brand.description,
        industry: brand.industry,
        keywords: brand.keywords,
        values: brand.values,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      console.error("❌ FastAPI error:", error);
      return NextResponse.json(
        { error: error.detail || "Failed to generate guidelines" },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Update brand with generated guidelines
    brand.guidelines = result.guidelines;
    await brand.save();

    console.log("✅ Guidelines generated and saved");

    return NextResponse.json({
      success: true,
      guidelines: result.guidelines,
      message: "Brand guidelines generated successfully",
    });
  } catch (error: any) {
    console.error("❌ Error generating guidelines:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate guidelines" },
      { status: 500 }
    );
  }
}
