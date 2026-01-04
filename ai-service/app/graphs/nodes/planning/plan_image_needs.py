
# app/graphs/nodes/planning/plan_image_needs.py 

"""
Image planning - Simple: Use gallery or not
"""

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field
from app.models.state import DesignAgentState
from app.services.llm_service import llm_service, TaskComplexity


class SimpleImagePlan(BaseModel):
    """Simple: Should we use a gallery image?"""
    use_gallery_image: bool = Field(..., description="Should we include a gallery image in the design?")
    reasoning: str


async def plan_image_needs_node(state: DesignAgentState) -> DesignAgentState:
    """Decide if we should use gallery images"""
    
    print("🖼️  Planning image needs...")
    
    gallery_images = state.get("gallery_images", [])
    user_prompt = state["user_prompt"]
    
    if not gallery_images:
        print("   No gallery images available")
        state["use_gallery_image"] = False
        return state
    
    print(f"   Available: {len(gallery_images)} gallery images")
    
    try:
        plan = await llm_service.ainvoke_structured(
            messages=[
                SystemMessage(content="Decide if the design should include a gallery image."),
                HumanMessage(content=f"""User request: "{user_prompt}"
Gallery images available: {len(gallery_images)}

Should we include a gallery image in this design?""")
            ],
            response_model=SimpleImagePlan,
            task_complexity=TaskComplexity.SIMPLE
        )
        
        state["use_gallery_image"] = plan.use_gallery_image
        print(f"   Use gallery: {plan.use_gallery_image}")
        
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        state["use_gallery_image"] = True  # Default to yes if gallery available
    
    return state