import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import { Canvas, Project, Brand } from "@/models";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;

    const body = await req.json();

    // 2. Extract Data
    const {
      canvasId, // We received this from frontend now
      current_html,
      user_prompt,
      chat_history,
      selected_assets,
      current_render_image,
    } = body;

    let brandContext = null;

    // 3. Fetch Brand Context if Canvas ID exists
    if (canvasId && auth.authorized) {
      try {
        await connectDB();

        // Find Canvas
        const canvas = await Canvas.findById(canvasId);

        if (canvas && canvas.project) {
          // Find Project
          const project = await Project.findById(canvas.project);

          if (project && project.brand) {
            // Find Brand
            const brand = await Brand.findById(project.brand);

            if (brand) {
              brandContext = {
                name: brand.name,
                description: brand.description,
                identity: brand.brandIdentity,
                fontPreferences: brand.fontType,
                colorTheme: brand.colorTheme,
                backgroundUrl: brand.backgroundImageUrl,
                logoUrl: brand.logoUrl,
              };

              console.log(`✅ Found Brand Context: ${brand.name}`);
            }
          }
        }
      } catch (dbError) {
        console.error("⚠️ Failed to fetch brand context:", dbError);
        // We continue even if DB fails, just without brand context
      }
    }

    // 4. Construct Payload for FastAPI
    const payload = {
      current_html: current_html || "<div></div>",
      user_prompt: user_prompt || "",
      chat_history: chat_history || [],
      selected_assets: selected_assets || [],
      current_render_image: current_render_image || null,
      brand_context: brandContext,
    };

    const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

    // 5. Call FastAPI
    const response = await fetch(`${fastApiUrl}/api/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("FastAPI Error:", err);
      return NextResponse.json(
        { error: "AI Service Error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Server Proxy Error:", error);
    return NextResponse.json(
      { error: "Server Internal Error" },
      { status: 500 }
    );
  }
}
