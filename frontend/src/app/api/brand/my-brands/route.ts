import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Brand from "@/models/Brand";
import connectDB from "@/lib/connectDB";

export async function GET(req: NextRequest) {
  try {
    //  Auth check
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;
    console.log("Auth successful", auth);
    await connectDB();

    // Find brands where user is owner
    const ownedBrands = await Brand.find({ owner: auth.user?.id })
      .select("name logoUrl tagline description industry createdAt updatedAt")
      .sort({ updatedAt: -1 });

    // Find brands where user is viewer
    const sharedBrands = await Brand.find({ viewers: auth.user?.id })
      .select(
        "name logoUrl tagline description industry owner createdAt updatedAt"
      )
      .populate("owner", "name email image")
      .sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      ownedBrands,
      sharedBrands,
    });
  } catch (error: any) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
