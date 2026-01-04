# app/services/canvas_builder.py 

from typing import Dict, Optional
from app.models.canvas import CanvasData
from app.models.content import LayoutPlan
from app.models.brand import BrandIdentity
from app.constants.fabric_elements import FabricElementConfig
from app.constants.text_styles import TextStyles


def build_canvas_from_layout(
    original_canvas: CanvasData,
    layout_plan: LayoutPlan,
    brand: BrandIdentity,
    selected_gallery_image: Optional[str] = None
) -> CanvasData:
    """Build canvas - solid colors only, preserve image aspect ratio"""
    
    print(f"   🏗️  Building canvas...")
    
    canvas = CanvasData(
        width=original_canvas.width,
        height=original_canvas.height,
        objects=[],
        background=None
    )
    
    # ✅ SOLID COLORS ONLY
    if layout_plan.background_value:
        canvas.background = layout_plan.background_value
    else:
        canvas.background = brand.primaryColor if brand else "#3b82f6"
    print(f"   ✅ Background: {canvas.background}")
    
    # Build elements
    for elem in sorted(layout_plan.elements, key=lambda e: e.z_index):
        
        left = elem.x * canvas.width
        top = elem.y * canvas.height
        width = elem.width * canvas.width
        height = elem.height * canvas.height
        
        if elem.element_type in ["text", "textbox"]:
            obj = _create_text_object(elem, left, top, width, height, canvas.height, brand)
            canvas.objects.append(obj)
            print(f"   📝 Text: '{elem.content[:30] if elem.content else ''}' ({elem.font_size}px)")
        
        # app/services/canvas_builder.py (FIX image check)

        elif elem.element_type == "image":
            # ✅ FIX: Check for ANY image_id, not just "selected_gallery"
            if selected_gallery_image and (
                elem.image_id == "selected_gallery" or 
                elem.image_id == "gallery_image" or
                "gallery" in elem.image_id.lower()
            ):
                canvas.objects.append({
                    "type": "Image",
                    "version": "5.3.0",
                    "originX": "left",
                    "originY": "top",
                    "left": left,
                    "top": top,
                    "scaleX": 1,
                    "scaleY": 1,
                    "src": selected_gallery_image,
                    "crossOrigin": "anonymous",
                    "angle": 0,
                    "opacity": 1,
                    "visible": True,
                    "selectable": True,
                    "evented": True,
                })
                print(f"   🖼️  Gallery image added (aspect ratio preserved)")
            else:
                print(f"   ⚠️  Image element skipped - image_id: {elem.image_id}, selected: {selected_gallery_image is not None}")
        
        elif elem.element_type == "rectangle":
            canvas.objects.append({
                **FabricElementConfig.get_default_properties("rectangle"),
                "left": left,
                "top": top,
                "width": width,
                "height": height,
                "fill": elem.color or (brand.accentColor if brand else "#ec4899"),
            })
            print(f"   🟦 Rectangle")
        
        elif elem.element_type == "circle":
            canvas.objects.append({
                **FabricElementConfig.get_default_properties("circle"),
                "left": left + width/2,
                "top": top + height/2,
                "radius": min(width, height) / 2,
                "fill": elem.color or (brand.accentColor if brand else "#ec4899"),
            })
            print(f"   ⭕ Circle")
    
    print(f"   ✅ Built {len(canvas.objects)} objects")
    return canvas


def _create_text_object(elem, left, top, width, height, canvas_height, brand):
    """Create text object"""
    
    base_obj = FabricElementConfig.get_default_properties("textbox")
    
    obj = {
        **base_obj,
        "text": elem.content or "",
        "left": left,
        "top": top,
        "width": width,
        "fontSize": elem.font_size or 24,
        "fontFamily": elem.font_family or (brand.preferredFonts[0] if brand and brand.preferredFonts else "Inter"),
        "fontWeight": elem.font_weight or "normal",
        "fill": elem.color or (brand.primaryColor if brand else "#000000"),
        "textAlign": elem.text_align or "left",
    }
    
    return obj