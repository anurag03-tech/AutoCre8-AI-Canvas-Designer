# app/services/design_agent.py

"""
Design agent orchestrator - uses new workflow router
"""

from typing import List, Optional
from app.models.canvas import CanvasData
from app.models.brand import BrandIdentity
from app.models.request import GalleryImage
from app.models.state import DesignAgentState
from app.graphs.workflows.task_router import master_graph


async def run_design_agent(
    canvas: CanvasData,
    brand: BrandIdentity,
    gallery_images: List[GalleryImage],
    user_prompt: str,
    canvas_screenshot: Optional[str] = None,  
) -> CanvasData:
    """
    Run the design agent with new workflow router
    
    Flow:
    1. Create initial state
    2. Execute master graph (classifier → router → workflow)
    3. Extract final canvas
    4. Return to API
    """
    
    print("\n" + "="*60)
    print("🤖 DESIGN AGENT - NEW WORKFLOW SYSTEM")
    print("="*60)
    print(f"User: {user_prompt}")
    print(f"Canvas: {canvas.width}x{canvas.height}, {len(canvas.objects)} objects")
    print(f"Brand: {brand.name if brand else 'None'}")
    
    if canvas_screenshot:
        print(f"📸 Screenshot: Available ({len(canvas_screenshot):,} bytes)")
    else:
        print(f"📸 Screenshot: Not available")
    
    print("="*60 + "\n")
    
    # Create initial state
    initial_state: DesignAgentState = {
        "user_prompt": user_prompt,
        "canvas": canvas,
        "canvas_screenshot": canvas_screenshot, 
        "brand": brand,
        "project_id": "default",
        "gallery_images": gallery_images,
        "errors": [],
        "warnings": [],
        "metadata": {},
    }
    
    try:
        # Execute workflow
        result = await master_graph.ainvoke(initial_state)
        
        # Extract final canvas
        final_canvas = result.get("final_canvas", canvas)
        
        print("\n" + "="*60)
        print("✅ DESIGN AGENT COMPLETED")
        print("="*60)
        print(f"Task type: {result.get('task_type', 'Unknown')}")
        print(f"Final canvas: {final_canvas.width}x{final_canvas.height}")
        print(f"Objects: {len(final_canvas.objects)}")
        print("="*60 + "\n")
        
        return final_canvas
        
    except Exception as e:
        print(f"❌ Design agent error: {e}")
        import traceback
        traceback.print_exc()
        
        # Return original canvas on error
        return canvas