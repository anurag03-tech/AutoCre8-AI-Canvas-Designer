# app/services/image_service.py 
"""
Image service - Send ALL gallery images to Vision API in ONE call
"""

from typing import List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.llm_service import llm_service, TaskComplexity
from app.models.brand import BrandIdentity
from app.models.image import ImageRequest
from pydantic import BaseModel, Field


class ImageSelection(BaseModel):
    """AI's image selection from gallery"""
    selected_index: int = Field(..., ge=0, description="Index of best image (0-based)")
    reasoning: str = Field(..., description="Why this image was selected")
    all_images_analyzed: int = Field(..., description="Total images analyzed")


class ImageService:
    """Simple image service - one Vision API call for all images"""
    
    async def select_from_gallery(
        self,
        gallery_urls: List[str],
        purpose: str,
        description: str,
        brand: BrandIdentity
    ) -> Optional[str]:
        """
        Send ALL gallery images to Vision API in ONE call
        AI analyzes all and returns best index
        """
        
        if not gallery_urls:
            return None
        
        print(f"   📸 Sending {len(gallery_urls)} images to Vision API in ONE call...")
        
        try:
            # Build message with ALL images at once
            message_content = []
            
            # Add ALL images
            for idx, url in enumerate(gallery_urls):
                message_content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": str(url),
                        "detail": "low"
                    }
                })
                print(f"      Image {idx + 1}: {url[:50]}...")
            
            # Add selection prompt
            message_content.append({
                "type": "text",
                "text": f"""You are looking at {len(gallery_urls)} images above (numbered 1 to {len(gallery_urls)}).

**Task**: Select the BEST image for this purpose.

**Purpose**: {purpose}
**Description**: {description}
**Brand Colors**: {brand.primaryColor if brand else 'N/A'}, {brand.secondaryColor if brand else 'N/A'}

**Instructions**:
1. Look at ALL {len(gallery_urls)} images
2. Consider which best fits the purpose: {purpose}
3. Consider brand colors and style
4. Return the index (0 for image 1, 1 for image 2, etc.)

Return selected_index (0-based) and reasoning."""
            })
            
            #  ONE Vision API call for all images
            selection = await llm_service.ainvoke_structured(
                messages=[
                    SystemMessage(content="Select the best image from the gallery for the design."),
                    HumanMessage(content=message_content)
                ],
                response_model=ImageSelection,
                task_complexity=TaskComplexity.VISION
            )
            
            print(f"   ✅ Selected image #{selection.selected_index + 1}/{len(gallery_urls)}")
            print(f"      Reason: {selection.reasoning[:80]}...")
            
            if 0 <= selection.selected_index < len(gallery_urls):
                return gallery_urls[selection.selected_index]
            
            # Fallback to first image
            print(f"   ⚠️  Invalid index {selection.selected_index}, using first image")
            return gallery_urls[0]
            
        except Exception as e:
            print(f"   ❌ Vision API failed: {e}")
            import traceback
            traceback.print_exc()
            
            # Fallback: return first image
            if gallery_urls:
                print(f"   ⚠️  Using first image as fallback")
                return gallery_urls[0]
            
            return None


# Singleton
image_service = ImageService()