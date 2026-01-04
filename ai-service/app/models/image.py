# app/models/image.py (COMPLETE FIXED VERSION)

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Dict, Optional


class PixabayImage(BaseModel):
    """Pixabay image result"""
    
    id: int
    preview_url: HttpUrl
    large_url: HttpUrl
    full_url: HttpUrl
    width: int
    height: int
    tags: List[str]
    views: int
    downloads: int


class ImageKitImage(BaseModel):
    """ImageKit uploaded image"""
    
    file_id: str
    name: str
    url: HttpUrl
    thumbnail: Optional[HttpUrl] = None
    file_path: str
    project_id: str


class ImageAnalysis(BaseModel):
    """Image analysis from Vision API"""
    
    main_subject: str
    background_type: str
    dominant_colors: List[str]
    visual_style: str
    suitability: Dict[str, float] = Field(
        default_factory=lambda: {"background": 0.5, "hero_image": 0.5, "decoration": 0.5},
        description="Suitability scores for different uses"
    )
    text_safe_zones: List[Dict[str, float]] = Field(default_factory=list)
    why: str


class ImageRequest(BaseModel):
    """Request for image acquisition"""
    
    id: str
    description: str
    purpose: str  # "background", "hero_image", "decoration"
    requirements: Dict[str, any] = Field(default_factory=dict)
    constraints: Dict[str, any] = Field(default_factory=dict)