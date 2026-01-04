# app/graphs/nodes/analysis/analyze_canvas.py

"""
Canvas analysis node - understands current canvas state
"""

from app.models.state import DesignAgentState


def analyze_canvas_node(state: DesignAgentState) -> DesignAgentState:
    """Analyze existing canvas structure and content"""
    
    print("📊 Analyzing canvas...")
    
    canvas = state["canvas"]
    objects = canvas.objects
    
    # Count object types
    text_objects = sum(1 for o in objects if o.get("type") in ["text", "textbox", "i-text"])
    image_objects = sum(1 for o in objects if o.get("type") == "image")
    shape_objects = sum(1 for o in objects if o.get("type") in ["rect", "circle", "ellipse"])
    
    analysis = f"""Canvas Analysis:
- Dimensions: {canvas.width}x{canvas.height}px
- Total objects: {len(objects)}
- Text elements: {text_objects}
- Images: {image_objects}
- Shapes: {shape_objects}
- Background: {canvas.background or 'None'}
"""
    
    state["canvas_analysis"] = analysis
    print(f"   {analysis.strip()}")
    
    return state