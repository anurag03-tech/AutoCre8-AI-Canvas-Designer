# app/graphs/nodes/planning/plan_layout.py

"""
Layout planning node - calculates element positions
"""

from langchain_core.messages import HumanMessage, SystemMessage
from app.models.state import DesignAgentState  
from app.models.content import LayoutPlan, LayoutElement  
from app.services.llm_service import llm_service, TaskComplexity
from app.services.layout_engine import layout_engine
from app.constants.prompts import PromptLibrary

# app/graphs/nodes/planning/plan_layout.py 

async def plan_layout_node(state: DesignAgentState) -> DesignAgentState:
    """Plan layout with better AI guidance"""
    
    print("📐 Planning layout...")
    
    canvas = state["canvas"]
    brand = state.get("brand")
    content = state.get("planned_content")
    selected_image = state.get("selected_gallery_image")
    
    font_sizes = layout_engine.calculate_font_sizes(canvas.height, brand)
    
    user_message = f"""Create a professional YouTube thumbnail layout.

Canvas: {canvas.width}×{canvas.height}px

Content:
- Headline: "{content.headline if content else 'None'}"
- Subheadline: "{content.subheadline if content else 'None'}"
- CTA: "{content.cta if content else 'None'}"

Gallery image available: {'YES - use it prominently' if selected_image else 'NO - use shapes/text only'}

Brand:
- Primary: {brand.primaryColor if brand else '#3b82f6'}
- Secondary: {brand.secondaryColor if brand else '#8b5cf6'}
- Accent: {brand.accentColor if brand else '#ec4899'}

Font sizes (calculated):
- Headline: {font_sizes['headline']}px
- Subheadline: {font_sizes['subheadline']}px

REQUIREMENTS:
1. Make text LARGE and BOLD - this is a thumbnail!
2. Use FULL canvas space
3. {'Include the gallery image prominently (right side or center)' if selected_image else 'Use colorful shapes and gradients'}
4. Create visual hierarchy
5. Use brand colors

Return LayoutPlan with:
- background_type: "gradient" or "solid"
- background_value: gradient string or color
- elements: Array of LayoutElement objects

For gallery image, use:
- element_type: "image"
- image_id: "selected_gallery"
- x, y, width, height in 0-1 range

Make it VISUALLY STRIKING!"""
    
    try:
        layout_plan = await llm_service.ainvoke_structured(
            messages=[
                SystemMessage(content=PromptLibrary.LAYOUT_PLANNER_SYSTEM),
                HumanMessage(content=user_message)
            ],
            response_model=LayoutPlan,
            task_complexity=TaskComplexity.COMPLEX
        )
        
        state["layout_plan"] = layout_plan
        
        print(f"   Background: {layout_plan.background_type}")
        print(f"   Elements: {len(layout_plan.elements)}")
        print(f"   ✅ Layout plan created")
        
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        # Fallback layout with large text
        elements = []
        
        if content and content.headline:
            elements.append(LayoutElement(
                element_id="headline",
                element_type="textbox",
                content=content.headline,
                x=0.1, y=0.3, width=0.8, height=0.2,
                font_size=font_sizes['headline'],
                color=brand.primaryColor if brand else "#000000",
                text_align="center",
                font_weight="bold",
                z_index=5
            ))
        
        if selected_image:
            elements.append(LayoutElement(
                element_id="product",
                element_type="image",
                image_id="selected_gallery",
                x=0.55, y=0.5, width=0.4, height=0.8,
                z_index=3
            ))
        
        state["layout_plan"] = LayoutPlan(
            background_type="gradient",
            background_value=f"linear-gradient(135deg, {brand.primaryColor if brand else '#3b82f6'}, {brand.secondaryColor if brand else '#8b5cf6'})",
            elements=elements,
            reasoning="Fallback bold layout"
        )
    
    return state