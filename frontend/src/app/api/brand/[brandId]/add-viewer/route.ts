// src/app/api/brand/[brandId]/add-viewer/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import { User, Brand } from "@/models";

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

    if (brand.owner.toString() !== auth?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Only owner can add viewers" },
        { status: 403 }
      );
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (userToAdd._id.toString() === brand.owner.toString()) {
      return NextResponse.json(
        { success: false, error: "User is already the owner" },
        { status: 400 }
      );
    }

    // ✅ FIXED: Use any with eslint-disable comment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (
      brand.viewers.some((v: any) => v.toString() === userToAdd._id.toString())
    ) {
      return NextResponse.json(
        { success: false, error: "User is already a viewer" },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error("Error adding viewer:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add viewer",
      },
      { status: 500 }
    );
  }
}
