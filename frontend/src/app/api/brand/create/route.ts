// app/api/brand/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Brand from "@/models/Brand";
import connectDB from "@/lib/connectDB";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

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
      autoGenerateGuidelines = true,
    } = body;

    if (!name || !logoUrl) {
      return NextResponse.json(
        { error: "Name and logo URL are required" },
        { status: 400 }
      );
    }

    // Create brand
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
      owner: auth?.user?.id,
      viewers: [],
    });

    await brand.save();

    console.log("✅ Brand created:", brand._id);

    // ✅ Generate guidelines directly (not via HTTP call)
    if (autoGenerateGuidelines) {
      console.log("🤖 Generating guidelines...");

      try {
        const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";

        const response = await fetch(
          `${fastApiUrl}/brand/generate-guidelines`,
          {
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
              keywords: brand.keywords || [],
              values: brand.values || [],
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();

          // Update brand with guidelines
          brand.guidelines = result.guidelines;
          await brand.save();

          console.log("✅ Guidelines generated and saved");
        } else {
          console.error("❌ Failed to generate guidelines");
        }
      } catch (error) {
        console.error("❌ Error generating guidelines:", error);
        // Don't fail brand creation if guidelines fail
      }
    }

    return NextResponse.json({
      success: true,
      brand,
      message:
        "Brand created successfully" +
        (brand.guidelines ? " with AI-generated guidelines" : ""),
    });
  } catch (error: any) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}
