# app/graphs/workflows/resize_workflow.py

"""
INTELLIGENT RESIZE - AI sees canvas JSON + visual screenshot
"""

from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
from typing import List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from app.models.state import DesignAgentState
from app.models.canvas import CanvasData
from app.graphs.nodes.analysis.analyze_canvas import analyze_canvas_node
from app.graphs.nodes.building.finalize_canvas import finalize_canvas_node
from app.services.llm_service import llm_service, TaskComplexity
import json


class DimensionExtraction(BaseModel):
    """Target dimensions"""
    target_width: int
    target_height: int


class ResizedCanvasOutput(BaseModel):
    """Complete resized canvas - AI returns full Fabric.js JSON"""
    width: int = Field(..., description="New canvas width in pixels")
    height: int = Field(..., description="New canvas height in pixels")
    background: str = Field(..., description="Canvas background color")
    objects: List[dict] = Field(
        ..., 
        description="REQUIRED: Complete array of ALL Fabric.js objects. Must include all original objects.",
        min_items=1
    )


async def extract_dimensions(state: DesignAgentState) -> DesignAgentState:
    """Extract target dimensions"""
    
    print("📏 Extracting dimensions...")
    
    user_prompt = state["user_prompt"]
    canvas = state["canvas"]
    
    import re
    match = re.search(r'(\d+)\s*[x×]\s*(\d+)', user_prompt)
    
    if match:
        width, height = int(match.group(1)), int(match.group(2))
        state["target_dimensions"] = {"width": width, "height": height}
        print(f"   ✅ {canvas.width}×{canvas.height} → {width}×{height}")
    else:
        state["target_dimensions"] = {"width": canvas.width, "height": canvas.height}
        print(f"   ⚠️  No dimensions found, keeping current size")
    
    return state

async def ai_resize_with_vision(state: DesignAgentState) -> DesignAgentState:
    """
    AI analyzes canvas JSON + screenshot and generates new canvas
    """
    
    print("🎨 AI resizing with vision analysis...")
    
    canvas = state["canvas"]
    target = state.get("target_dimensions", {})
    canvas_screenshot = state.get("canvas_screenshot")
    brand = state.get("brand")
    
    old_width = canvas.width
    old_height = canvas.height
    new_width = target["width"]
    new_height = target["height"]
    
    # Calculate aspect ratio change
    old_aspect = old_width / old_height
    new_aspect = new_width / new_height
    
    # Determine layout strategy based on aspect change
    if abs(old_aspect - new_aspect) < 0.1:
        change_type = "SIMILAR"
        strategy = "proportional scaling with minimal repositioning"
    elif old_aspect > 1.2 and new_aspect < 0.9:
        change_type = "LANDSCAPE→PORTRAIT"
        strategy = "VERTICAL STACKING - arrange elements top to bottom, use full height"
    elif old_aspect < 0.9 and new_aspect > 1.2:
        change_type = "PORTRAIT→LANDSCAPE"
        strategy = "HORIZONTAL SPREAD - distribute elements left to right, use full width"
    elif abs(old_aspect - 1.0) < 0.2 and new_aspect > 1.3:
        change_type = "SQUARE→LANDSCAPE"
        strategy = "HORIZONTAL COMPOSITION - use left-center-right zones, spread elements wide"
    elif abs(old_aspect - 1.0) < 0.2 and new_aspect < 0.8:
        change_type = "SQUARE→PORTRAIT"
        strategy = "VERTICAL COMPOSITION - use top-center-bottom zones, stack elements"
    elif old_aspect > 1.2 and abs(new_aspect - 1.0) < 0.2:
        change_type = "LANDSCAPE→SQUARE"
        strategy = "CENTERED GRID - bring elements toward center, create balanced square composition"
    else:
        change_type = "ASPECT_CHANGE"
        strategy = "adaptive repositioning based on new aspect ratio"
    
    print(f"   Old: {old_width}×{old_height} (aspect: {old_aspect:.2f})")
    print(f"   New: {new_width}×{new_height} (aspect: {new_aspect:.2f})")
    print(f"   Change: {change_type}")
    print(f"   Strategy: {strategy}")
    
    # Prepare canvas JSON
    canvas_json = {
        "width": old_width,
        "height": old_height,
        "background": canvas.background,
        "objects": canvas.objects
    }
    
    system_prompt = f"""You are a professional designer resizing canvas layouts with expertise in composition and visual hierarchy.

CURRENT SITUATION:
- Original canvas: {old_width}×{old_height}px (aspect: {old_aspect:.2f})
- New canvas: {new_width}×{new_height}px (aspect: {new_aspect:.2f})
- Change type: {change_type}
- Layout strategy: {strategy}

YOUR TASK: Return a ResizedCanvasOutput that INTELLIGENTLY ADAPTS the layout to the new dimensions.

CRITICAL LAYOUT PRINCIPLES:

1. **ASPECT RATIO ADAPTATION STRATEGIES**:

   {change_type} requires: {strategy}
   
   LANDSCAPE→PORTRAIT (wide to tall):
   - Stack elements vertically instead of side-by-side
   - Use top third for headline/hero
   - Use middle third for main content/images
   - Use bottom third for CTA/secondary elements
   - Increase vertical spacing between elements
   
   PORTRAIT→LANDSCAPE (tall to wide):
   - Spread elements horizontally instead of stacked
   - Use left third for hero/images
   - Use center for headline/main text
   - Use right third for CTA/secondary content
   - Increase horizontal spacing between elements
   
   SQUARE→LANDSCAPE (square to wide):
   - Shift from centered to left-right composition
   - Headline: move to left or top-left
   - Images: position left or right (not center)
   - Text: offset to opposite side of images
   - Use rule of thirds: position key elements at 1/3 and 2/3 points
   
   SQUARE→PORTRAIT (square to tall):
   - Shift from centered to top-bottom composition
   - Headline: move to top 20%
   - Hero image: position in top or middle third
   - Body text: middle section
   - CTA: bottom 20%
   
   LANDSCAPE→SQUARE (wide to square):
   - Bring spread elements toward center
   - Create balanced grid or centered composition
   - May need to stack some side-by-side elements
   - Use visual balance: distribute elements evenly
   
   SIMILAR aspect:
   - Scale positions proportionally
   - Maintain relative spacing
   - Slight adjustments for visual balance

2. **PRESERVE IMAGE ASPECT RATIOS**:
   - For Image objects: aspect = (width × scaleX) / (height × scaleY)
   - When resizing, maintain this aspect ratio
   - Scale BOTH width and height proportionally
   - Example: If original image is 400×300 (aspect 1.33), keep it 1.33 in new layout

3. **TYPOGRAPHY HIERARCHY**:
   - Large text (fontSize > 50): Headlines - position prominently
   - Medium text (fontSize 30-50): Subheadings - position near headline
   - Small text (fontSize < 30): Body/CTA - position in secondary zones
   - Scale fontSize proportionally to maintain readability
   - Maintain relative size relationships between text elements

4. **VISUAL HIERARCHY**:
   - Identify most important elements (large images, headlines)
   - Position important elements in prime visual zones:
     * Landscape: Left third or right third
     * Portrait: Top third or center
     * Square: Center or rule-of-thirds intersections
   - Less important elements (decorations, small shapes) fill remaining space
   - Maintain visual balance - don't cluster all elements on one side

5. **SPACING AND BREATHING ROOM**:
   - Don't cram elements - use available space
   - Increase margins for larger canvases
   - For landscape: use horizontal whitespace
   - For portrait: use vertical whitespace
   - Maintain comfortable distance between unrelated elements

6. **BOUNDS CHECKING**:
   - Verify: left + (width × scaleX) ≤ {new_width}
   - Verify: top + (height × scaleY) ≤ {new_height}
   - Add safety margin: keep elements at least 5% away from edges

7. **COMPOSITION RULES**:
   - Rule of thirds: Position key elements at 1/3 or 2/3 points
   - Visual balance: Distribute visual weight evenly
   - Reading flow: 
     * Landscape: Left-to-right or Z-pattern
     * Portrait: Top-to-bottom or inverted pyramid
   - Focal points: Create clear visual hierarchy

RETURN FORMAT:
{{
  "width": {new_width},
  "height": {new_height},
  "background": "{canvas.background}",
  "objects": [
    // ALL {len(canvas.objects)} objects with intelligent repositioning
    // Each object should have ALL original Fabric.js properties
    // Modified properties: left, top, width, height, scaleX, scaleY, fontSize, strokeWidth, radius
  ]
}}

Brand context: Primary {brand.primaryColor if brand else 'N/A'}, Secondary {brand.secondaryColor if brand else 'N/A'}

IMPORTANT: Think carefully about the layout transformation. Don't just scale positions - actually RECOMPOSE the design for the new aspect ratio."""

    # Build message
    message_content = []
    
    if canvas_screenshot:
        if canvas_screenshot.startswith('data:'):
            image_data = canvas_screenshot.split(',')[1]
        else:
            image_data = canvas_screenshot
        
        message_content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{image_data}"
            }
        })
        print(f"   📸 Sending visual screenshot for layout analysis")
    
    message_content.append({
        "type": "text",
        "text": f"""Analyze this canvas and intelligently resize it.

Current canvas JSON ({old_width}×{old_height}):
```json
{json.dumps(canvas_json, indent=2)}
```

**Resize Task**: {old_width}×{old_height}px → {new_width}×{new_height}px

**Aspect Change**: {change_type} 
({old_aspect:.2f} → {new_aspect:.2f})

**Required Strategy**: {strategy}

**Analysis Steps**:
1. Look at the visual screenshot to understand current composition
2. Identify element roles (headline, hero image, body text, decorations, CTA)
3. Determine new positions based on {change_type} strategy
4. Ensure proper spacing and no overlap
5. Maintain visual hierarchy
6. Preserve image aspect ratios

**Return**: Complete ResizedCanvasOutput with all {len(canvas.objects)} objects repositioned intelligently for the new {new_width}×{new_height}px canvas.

Remember: Don't just scale positions - actually REDESIGN the layout for {change_type}!"""
    })
    
    try:
        print(f"   🤖 AI analyzing layout with {change_type} strategy...")
        
        resized_canvas = await llm_service.ainvoke_structured(
            messages=[
                SystemMessage(content=system_prompt),
                HumanMessage(content=message_content)
            ],
            response_model=ResizedCanvasOutput,
            task_complexity=TaskComplexity.COMPLEX
        )
        
        print(f"   ✅ AI redesigned layout: {resized_canvas.width}×{resized_canvas.height}")
        print(f"   ✅ Repositioned: {len(resized_canvas.objects)} objects")
        
        if len(resized_canvas.objects) != len(canvas.objects):
            print(f"   ⚠️  Object count mismatch: expected {len(canvas.objects)}, got {len(resized_canvas.objects)}")
        
        final_canvas = CanvasData(
            width=resized_canvas.width,
            height=resized_canvas.height,
            background=resized_canvas.background,
            objects=resized_canvas.objects
        )
        
        state["final_canvas"] = final_canvas
        print(f"   ✅ Intelligent resize complete!")
        
    except Exception as e:
        print(f"   ❌ AI resize failed: {e}")
        import traceback
        traceback.print_exc()
        
        print(f"   🔄 Using fallback proportional resize...")
        state["final_canvas"] = _fallback_proportional_resize(canvas, new_width, new_height)
    
    return state

def _fallback_proportional_resize(canvas: CanvasData, new_width: int, new_height: int) -> CanvasData:
    """Simple proportional resize fallback when AI fails"""
    
    print(f"   📐 Fallback: Proportional resize to {new_width}×{new_height}")
    
    scale_x = new_width / canvas.width
    scale_y = new_height / canvas.height
    
    resized_objects = []
    
    for obj in canvas.objects:
        new_obj = obj.copy()
        
        # Scale position
        if "left" in new_obj:
            new_obj["left"] = obj["left"] * scale_x
        if "top" in new_obj:
            new_obj["top"] = obj["top"] * scale_y
        
        # Scale dimensions
        if "width" in new_obj and "height" in new_obj:
            # For images: preserve aspect ratio
            if new_obj.get("type") in ["Image", "image"]:
                current_aspect = (obj["width"] * obj.get("scaleX", 1)) / (obj["height"] * obj.get("scaleY", 1))
                new_obj["width"] = obj["width"] * scale_x
                new_obj["height"] = new_obj["width"] / current_aspect
                new_obj["scaleX"] = obj.get("scaleX", 1)
                new_obj["scaleY"] = obj.get("scaleY", 1)
            else:
                new_obj["width"] = obj["width"] * scale_x
                new_obj["height"] = obj["height"] * scale_y
        
        # Scale radius for circles
        if "radius" in new_obj:
            new_obj["radius"] = obj["radius"] * min(scale_x, scale_y)
        
        # Scale text fontSize
        if new_obj.get("type") in ["IText", "Text", "Textbox", "i-text", "text", "textbox"]:
            if "fontSize" in new_obj:
                new_obj["fontSize"] = int(obj["fontSize"] * min(scale_x, scale_y))
        
        # Scale strokeWidth
        if "strokeWidth" in new_obj:
            new_obj["strokeWidth"] = obj["strokeWidth"] * min(scale_x, scale_y)
        
        resized_objects.append(new_obj)
    
    print(f"   ✅ Fallback complete: {len(resized_objects)} objects resized")
    
    return CanvasData(
        width=new_width,
        height=new_height,
        background=canvas.background,
        objects=resized_objects
    )


def create_resize_workflow():
    """AI-powered resize workflow with fallback"""
    
    workflow = StateGraph(DesignAgentState)
    
    workflow.add_node("analyze_canvas", analyze_canvas_node)
    workflow.add_node("extract_dimensions", extract_dimensions)
    workflow.add_node("ai_resize", ai_resize_with_vision)
    workflow.add_node("finalize", finalize_canvas_node)
    
    workflow.set_entry_point("analyze_canvas")
    workflow.add_edge("analyze_canvas", "extract_dimensions")
    workflow.add_edge("extract_dimensions", "ai_resize")
    workflow.add_edge("ai_resize", "finalize")
    workflow.add_edge("finalize", END)
    
    return workflow.compile()