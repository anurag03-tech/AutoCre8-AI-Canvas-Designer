# app/graphs/nodes/building/build_canvas.py 

from app.models.state import DesignAgentState
from app.services.canvas_builder import build_canvas_from_layout


def build_canvas_node(state: DesignAgentState) -> DesignAgentState:
    """Build Fabric.js canvas from layout plan"""
    
    print("🏗️  Building canvas...")
    print(f"   🔍 State keys: {list(state.keys())}")
    
    canvas = state["canvas"]
    brand = state.get("brand")
    layout_plan = state.get("layout_plan")
    selected_image = state.get("selected_gallery_image")
    
    if layout_plan:
        print(f"   ✅ Layout plan found: {len(layout_plan.elements)} elements")
        print(f"      Background: {layout_plan.background_type} = {layout_plan.background_value}")
        for elem in layout_plan.elements:
            print(f"      Element: {elem.element_type} - {elem.content[:30] if elem.content else elem.image_id}")
    else:
        print(f"   ❌ NO layout_plan!")
        state["final_canvas"] = canvas
        return state
    
    try:
        final_canvas = build_canvas_from_layout(
            original_canvas=canvas,
            layout_plan=layout_plan,
            brand=brand,
            selected_gallery_image=selected_image
        )
        
        state["final_canvas"] = final_canvas
        
        print(f"   ✅ Built canvas with {len(final_canvas.objects)} objects")
        
    except Exception as e:
        print(f"   ❌ Canvas building error: {e}")
        import traceback
        traceback.print_exc()
        state["final_canvas"] = canvas
    
    return state