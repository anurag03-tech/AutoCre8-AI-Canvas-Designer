# app/models/brand_guidelines.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ColorSystem(BaseModel):
    primary: str
    secondary: str
    accent: List[str]
    neutral: List[str]
    gradients: Optional[List[str]] = []

class Fonts(BaseModel):
    heading: str
    body: str
    suggested: List[str]

class Spacing(BaseModel):
    baseUnit: str
    scale: List[float]

class BrandGuidelines(BaseModel):
    # Logo Analysis
    logoDescription: str
    logoColors: List[str]
    logoStyle: str
    
    # Color System
    colors: ColorSystem
    
    # Typography
    fonts: Fonts
    
    # Brand Identity
    personality: List[str]
    style: str
    mood: List[str]
    
    # Design Rules
    visualElements: List[str]
    designDos: List[str]
    designDonts: List[str]
    
    # Design Tokens
    spacing: Spacing
    borderRadius: List[str]
    
    # AI-Generated Content
    suggestedTagline: Optional[str] = None
    enhancedDescription: Optional[str] = None
    suggestedKeywords: Optional[List[str]] = []
    brandValues: Optional[List[str]] = []
    suggestedMission: Optional[str] = None
    suggestedVision: Optional[str] = None
    
    generatedAt: datetime = datetime.now()
