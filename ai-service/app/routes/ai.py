# app/routes/ai.py

from fastapi import APIRouter, HTTPException, Header
from app.models.request import ImproveDesignRequest, ImproveDesignResponse
from app.services.design_agent import run_design_agent
from app.services.brand_service import brand_service
import os

router = APIRouter()

INTERNAL_SECRET = os.getenv("INTERNAL_API_SECRET")

@router.post("/improve-design", response_model=ImproveDesignResponse)
async def improve_design(
    req: ImproveDesignRequest,
    x_internal_secret: str = Header(None)
):
    # 🔍 DEBUG: Log request
    print("\n" + "="*60)
    print("📥 RECEIVED REQUEST FROM NEXT.JS:")
    print("="*60)
    print(f"userId: {req.userId}")
    print(f"canvasId: {req.canvasId}")
    print(f"projectId: {req.projectId}")
    print(f"brandId: {req.brandId or 'NULL (no brand)'}")
    print(f"userPrompt: {req.userPrompt}")
    print(f"Canvas: {req.canvasData.width}x{req.canvasData.height}, {len(req.canvasData.objects)} objects")
    
    # ✅ NEW: Log screenshot
    if req.canvasScreenshot:
        screenshot_size = len(req.canvasScreenshot)
        print(f"📸 Canvas screenshot: {screenshot_size:,} bytes")
    else:
        print(f"📸 Canvas screenshot: Not provided")
    
    print(f"Gallery: {len(req.galleryImages)} images")
    print("="*60 + "\n")
    
    try:
        # 1. Get brand identity (or default if no brand)
        brand = None
        
        if req.brandId:
            print(f"🔍 Fetching brand with ID: {req.brandId}")
            brand = await brand_service.get_brand_identity(req.brandId)
            
            if brand:
                print(f"✅ Brand found: {brand.name}")
            else:
                print(f"⚠️  Brand {req.brandId} not found in database")
        else:
            print(f"ℹ️  No brand associated with this project")
        
        # Use default brand if none found
        if not brand:
            print(f"💡 Using default brand identity")
            brand = brand_service.get_default_brand(req.projectId)
        
        print(f"🎨 Using brand: {brand.name}")
        print(f"   Colors: {brand.primaryColor}, {brand.secondaryColor}, {brand.accentColor}")
        print(f"   Fonts: {', '.join(brand.preferredFonts[:3])}")
        
        # 2. Run design agent with screenshot 
        improved_canvas = await run_design_agent(
            canvas=req.canvasData,
            canvas_screenshot=req.canvasScreenshot,  
            brand=brand,
            gallery_images=req.galleryImages,
            user_prompt=req.userPrompt,
        )
        
        print("✅ Design improved successfully\n")
        
        return ImproveDesignResponse(
            success=True,
            canvasData=improved_canvas,
            message=f"Design improved using {brand.name}",
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in improve_design: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))