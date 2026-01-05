from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any, Union

class PreviewRequest(BaseModel):
    canvas_data: dict
    canvas_screenshot: Optional[str] = None

class PreviewResponse(BaseModel):
    success: bool
    preview_html: str
    width: float
    height: float
    object_count: int

class ResizeRequest(BaseModel):
    current_preview_html: str
    target_width: int
    target_height: int

class ResizeResponse(BaseModel):
    success: bool
    variation_1_html: str
    variation_2_html: str

# ============  (CHAT & ASSETS) ============

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class Asset(BaseModel):
    """An image selected from user's gallery"""
    id: str
    url: str
    type: Literal["image", "logo", "background"] = "image"

class BrandContext(BaseModel):
    name: str
    description: Optional[str] = None
    identity: Optional[str] = None
    fontPreferences: Optional[str] = None
    colorTheme: Optional[str] = None
    backgroundUrl: Optional[str] = None
    logoUrl: Optional[str] = None

class EditRequest(BaseModel):
    """Request for Chat-based editing with Visual Context"""
    current_html: str
    user_prompt: str
    chat_history: List[ChatMessage] = []
    
    # VISUAL INPUTS
    current_render_image: Optional[str] = Field(
        None, description="Screenshot of current state for correction loop"
    )
    selected_assets: List[Asset] = Field(
        [], description="Images to inject into the design"
    )

    brand_context: Optional[BrandContext] = None


class EditResponse(BaseModel):
    success: bool
    html: str
    explanation: str

# ============ LLM OUTPUT STRUCTURES ============

class HTMLOutput(BaseModel):
    html: str = Field(description="The complete HTML string with container div and all elements")
    explanation: Optional[str] = Field(description="Brief explanation of changes (b/w 10-20 words only)")

class ResizeOutput(BaseModel):
    variation_1_html: str = Field(description="First layout - proportional scaling")
    variation_2_html: str = Field(description="Second layout - optimized arrangement")



# ============ 4. CONVERSION MODELS (HTML -> FABRIC) ============

class ConversionRequest(BaseModel):
    html_content: str
    canvas_width: int = 1080
    canvas_height: int = 1080

class FabricOutput(BaseModel):
    version: str = Field(default="6.0.0", description="Fabric.js version")
    width: int = Field(default=1080)
    height: int = Field(default=1080)
    
    # Background can be a hex string OR a complex gradient object
    background: Union[str, Dict[str, Any]] = Field(default="#ffffff")
    
    # Objects list
    objects: List[Dict[str, Any]] = Field(default=[], description="List of Fabric objects")