# app/routes/images.py

"""
Test endpoints for image services
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.pixabay_service import pixabay_service
from app.services.imagekit_service import imagekit_service
from app.services.image_service import image_service
from app.models.image import ImageRequest
from app.models.brand import BrandIdentity

router = APIRouter()


class PixabaySearchRequest(BaseModel):
    query: str
    per_page: int = 8


class ImageKitUploadRequest(BaseModel):
    image_url: str
    project_id: str
    file_name: Optional[str] = None


class ImageAcquisitionRequest(BaseModel):
    description: str
    purpose: str  # "background", "hero_image", "decoration"
    project_id: str
    brand_id: Optional[str] = None
    user_gallery: List[str] = []


@router.post("/test/pixabay")
async def test_pixabay_search(req: PixabaySearchRequest):
    """Test Pixabay search"""
    results = await pixabay_service.search_images(
        query=req.query,
        per_page=req.per_page
    )
    
    return {
        "success": True,
        "count": len(results),
        "images": [
            {
                "id": img.id,
                "preview": str(img.preview_url),
                "large": str(img.large_url),
                "tags": img.tags,
            }
            for img in results
        ]
    }


@router.post("/test/imagekit-upload")
async def test_imagekit_upload(req: ImageKitUploadRequest):
    """Test ImageKit upload"""
    result = await imagekit_service.upload_from_url(
        image_url=req.image_url,
        project_id=req.project_id,
        file_name=req.file_name,
    )
    
    if result:
        return {
            "success": True,
            "file_id": result.file_id,
            "url": str(result.url),
            "thumbnail": str(result.thumbnail) if result.thumbnail else None,
        }
    else:
        raise HTTPException(status_code=500, detail="Upload failed")


@router.post("/test/acquire-image")
async def test_image_acquisition(req: ImageAcquisitionRequest):
    """Test complete image acquisition workflow"""
    
    # Create test brand
    brand = BrandIdentity(
        id="test",
        name="Test Brand",
        primaryColor="#3b82f6",
        secondaryColor="#8b5cf6",
        accentColor="#ec4899",
        preferredFonts=["Inter"],
        logoUrls=[],
    )
    
    # Create image request
    image_request = ImageRequest(
        id="test_1",
        description=req.description,
        purpose=req.purpose,
        requirements={},
        constraints={},
    )
    
    # Acquire image
    final_url = await image_service.acquire_image(
        request=image_request,
        brand=brand,
        project_id=req.project_id,
        user_gallery=req.user_gallery,
    )
    
    if final_url:
        return {
            "success": True,
            "url": final_url,
        }
    else:
        raise HTTPException(status_code=404, detail="No suitable image found")