# app/routes/brand.py
from fastapi import APIRouter, HTTPException
from app.models.brand_request import GenerateBrandGuidelinesRequest, GenerateBrandGuidelinesResponse
from app.services.brand_guidelines_agent import generate_brand_guidelines

router = APIRouter()

@router.post("/generate-guidelines", response_model=GenerateBrandGuidelinesResponse)
async def generate_guidelines(req: GenerateBrandGuidelinesRequest):
    """
    Analyze brand info (logo, description, etc.) and generate comprehensive guidelines.
    """
    print("\n" + "="*60)
    print("🎨 GENERATING BRAND GUIDELINES")
    print("="*60)
    print(f"Brand: {req.name}")
    print(f"Logo: {req.logoUrl}")
    print(f"Industry: {req.industry}")
    print("="*60 + "\n")
    
    try:
        # Call AI agent to analyze brand and generate guidelines
        guidelines = await generate_brand_guidelines(
            brand_name=req.name,
            logo_url=req.logoUrl,
            tagline=req.tagline,
            description=req.description,
            industry=req.industry,
            keywords=req.keywords,
            values=req.values,
        )
        
        print("✅ Guidelines generated successfully\n")
        
        return GenerateBrandGuidelinesResponse(
            success=True,
            guidelines=guidelines,
            message="Brand guidelines generated successfully"
        )
    
    except Exception as e:
        print(f"❌ Error generating guidelines: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
