from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import (
    PreviewRequest, PreviewResponse,
    ResizeRequest, ResizeResponse,
    EditRequest, EditResponse
)
from app.services.llm_service import LLMService
from app.schemas import ConversionRequest, FabricOutput


app = FastAPI(title="AutoCre8 AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Service
llm_service = LLMService()

@app.get("/health")
async def health():
    return {"status": "ok", "mode": "Hybrid (OpenAI + Gemini)"}

# 1. CANVAS → HTML (OpenAI)
@app.post("/api/preview/generate", response_model=PreviewResponse)
async def generate_preview(request: PreviewRequest):
    """Generate HTML preview from Fabric.js canvas using OpenAI"""
    canvas_data = request.canvas_data
    width = canvas_data.get("width", 800)
    height = canvas_data.get("height", 600)
    objects = canvas_data.get("objects", [])

    print(f"\n[INFO] Generating preview {width}x{height} with {len(objects)} objects")

    try:
        html = await llm_service.generate_from_canvas(canvas_data)
        print(f"[SUCCESS] Generated HTML ({len(html)} chars)")
        
        return PreviewResponse(
            success=True,
            preview_html=html,
            width=width,
            height=height,
            object_count=len(objects)
        )
    except Exception as e:
        print(f"[ERROR] Canvas generation failed: {str(e)}")
        bg = canvas_data.get("background", "#ffffff")
        if not isinstance(bg, str):
            bg = "#ffffff"
        return PreviewResponse(
            success=False,
            preview_html=f'<div style="position:relative;width:{width}px;height:{height}px;background:{bg};"><p style="color:red;padding:20px;">Error generating preview</p></div>',
            width=width,
            height=height,
            object_count=len(objects)
        )

# 2. RESIZE (Gemini)
@app.post("/api/preview/resize", response_model=ResizeResponse)
async def resize_preview(request: ResizeRequest):
    """Generate 2 layout variations for new canvas size using Gemini"""
    print(f"\n[INFO] Resizing to {request.target_width}x{request.target_height}")
    
    try:
        result = await llm_service.generate_resize_variations(
            request.current_preview_html,
            request.target_width,
            request.target_height
        )
        print(f"[SUCCESS] Generated 2 resize variations")
        
        return ResizeResponse(
            success=True,
            variation_1_html=result.variation_1_html,
            variation_2_html=result.variation_2_html
        )
    except Exception as e:
        print(f"[ERROR] Resize failed: {str(e)}")
        fallback = f'<div style="position:relative;width:{request.target_width}px;height:{request.target_height}px;background:#ffffff;"><p style="color:red;padding:20px;">Error resizing</p></div>'
        return ResizeResponse(
            success=False,
            variation_1_html=fallback,
            variation_2_html=fallback
        )

# 3. AI CHAT ASSISTANT (Gemini Multimodal)
@app.post("/api/ai/assistant", response_model=EditResponse)
async def edit_design(request: EditRequest):
    """
    Multimodal AI editing using Gemini:
    - Takes HTML + User Prompt + Chat History
    - Optionally: Assets (Images) + Screenshot
    - Returns: Updated HTML + Explanation 
    """
    print(f"\n[INFO] AI Edit request: '{request.user_prompt[:50]}...'")
    print(f"[INFO] Assets: {len(request.selected_assets)}, Screenshot: {bool(request.current_render_image)}")
     # Debug log for brand
    if request.brand_context:
        print(f"[INFO] Using Brand Context: {request.brand_context}")
    
    try:
        result = await llm_service.edit_design_multimodal(
            current_html=request.current_html,
            user_prompt=request.user_prompt,
            chat_history=request.chat_history,
            assets=request.selected_assets,
            screenshot=request.current_render_image,
            brand_context=request.brand_context
        )
        
        print(f"[SUCCESS] AI Edit completed")
        
        return EditResponse(
            success=True,
            html=result.html,
            explanation=result.explanation or "Design updated successfully."
        )
    except Exception as e:
        print(f"[ERROR] AI Edit failed: {str(e)}")
        return EditResponse(
            success=False, 
            html=request.current_html, 
            explanation=f"Error: {str(e)}"
        )
    


# 4. CONVERT HTML -> CANVAS (OpenAI)

@app.post("/api/conversion/html-to-fabric", response_model=FabricOutput)
async def convert_to_fabric(request: ConversionRequest):
    """
    Takes the AI-generated HTML and converts it back to 
    Fabric.js objects so they are editable on the canvas.
    """
    print(f"\n[INFO] Converting HTML to Fabric Objects...")
    print(f"[INFO] Canvas size: {request.canvas_width}x{request.canvas_height}")
    
    try:
        result = await llm_service.convert_html_to_fabric(
            html_content=request.html_content,
            canvas_width=request.canvas_width,
            canvas_height=request.canvas_height
        )
        print(f"[SUCCESS] Converted {len(result.objects)} objects.")
        print(result)
        return result
    except Exception as e:
        print(f"[ERROR] Conversion failed: {str(e)}")
        # Return empty safe fallback
        return FabricOutput(objects=[], background="#ffffff")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)