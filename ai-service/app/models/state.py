# app/models/state.py 

from typing import TypedDict, Optional, List, Dict, Any
from app.models.canvas import CanvasData
from app.models.brand import BrandIdentity
from app.models.request import GalleryImage
from app.models.task import TaskType, IntentAnalysis
from app.models.content import ContentPlan, LayoutPlan  


class DesignAgentState(TypedDict, total=False):
    # Input
    user_prompt: str
    canvas: CanvasData
    canvas_screenshot: Optional[str]
    brand: Optional[BrandIdentity]
    project_id: str
    gallery_images: List[GalleryImage]
    
    # Classification
    task_type: Optional[TaskType]
    intent: Optional[IntentAnalysis]
    
    # Analysis
    canvas_analysis: Optional[str]
    brand_analysis: Optional[str]
    
    # Planning
    planned_content: Optional[ContentPlan]
    layout_plan: Optional[LayoutPlan]
    
    # Image handling
    use_gallery_image: bool  
    selected_gallery_image: Optional[str]  
    
    # Resize-specific
    target_dimensions: Optional[Dict[str, int]]
    
    # Final output
    final_canvas: Optional[CanvasData]
    
    # Metadata
    errors: List[str]
    warnings: List[str]
    metadata: Dict[str, Any]