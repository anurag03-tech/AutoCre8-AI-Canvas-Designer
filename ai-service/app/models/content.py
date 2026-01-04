# app/models/content.py

"""
Content planning models for design generation
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ContentPlan(BaseModel):
    """Planned content for design"""
    
    headline: Optional[str] = Field(None, description="Main headline text")
    subheadline: Optional[str] = Field(None, description="Supporting headline")
    body: Optional[str] = Field(None, description="Body text")
    cta: Optional[str] = Field(None, description="Call to action")
    
    reasoning: str = Field(..., description="Why this content was chosen")

class LayoutElement(BaseModel):
    """Single element in layout plan"""
    
    element_id: str
    element_type: str  # "textbox", "image", "logo", "rectangle", "circle"
    content: Optional[str] = None
    image_id: Optional[str] = None
    
    # Position (relative 0-1)
    x: float = Field(..., ge=0, le=1)
    y: float = Field(..., ge=0, le=1)
    width: float = Field(..., ge=0, le=1)
    height: float = Field(..., ge=0, le=1)
    
    # Styling
    font_family: Optional[str] = None  # ✅ Can be style name like "fire_gradient"
    font_size: Optional[int] = None
    font_weight: Optional[str] = None
    color: Optional[str] = None
    text_align: Optional[str] = None
    
    # Layer
    z_index: int = 0

# class LayoutPlan(BaseModel):
#     """Complete layout plan for canvas"""
    
#     background_type: str = Field(..., description="solid/image/gradient")
#     background_value: Optional[str] = Field(None, description="Color or image ID")
    
#     elements: List[LayoutElement] = Field(default_factory=list)
    
#     reasoning: str = Field(..., description="Design decisions explanation")

# app/models/content.py 

class LayoutPlan(BaseModel):
    """Complete layout plan for canvas"""
    
    background_type: str = Field(..., description="solid/image/gradient")
    background_value: Optional[str] = Field(None, description="Color or image ID")
    
    elements: List[LayoutElement] = Field(default_factory=list)
    
    reasoning: str = Field(default="", description="Design decisions explanation") 