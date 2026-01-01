import { NextResponse } from "next/server";
import { imagekitServer } from "@/lib/imagekit-server";

export async function GET() {
  try {
    const authParams = imagekitServer.getAuthenticationParameters();
    return NextResponse.json(authParams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
