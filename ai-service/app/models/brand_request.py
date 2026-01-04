# app/models/brand_request.py
from pydantic import BaseModel
from typing import List, Optional
from app.models.brand_guidelines import BrandGuidelines

class GenerateBrandGuidelinesRequest(BaseModel):
    brandId: str
    name: str
    logoUrl: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    keywords: Optional[List[str]] = []
    values: Optional[List[str]] = []

class GenerateBrandGuidelinesResponse(BaseModel):
    success: bool
    guidelines: BrandGuidelines
    message: str
