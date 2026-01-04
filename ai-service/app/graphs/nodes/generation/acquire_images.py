# app/graphs/nodes/generation/acquire_images.py (SUPER SIMPLE)

"""
Image acquisition - Pick best from gallery if needed
"""

from app.models.state import DesignAgentState
from app.services.image_service import image_service


async def acquire_images_node(state: DesignAgentState) -> DesignAgentState:
    """Select best gallery image if needed"""
    
    print("🎨 Image selection...")
    
    use_gallery = state.get("use_gallery_image", False)
    gallery_images = state.get("gallery_images", [])
    brand = state.get("brand")
    user_prompt = state["user_prompt"]
    
    if not use_gallery or not gallery_images:
        print("   Skipping gallery images")
        state["selected_gallery_image"] = None
        return state
    
    # Convert to URLs
    gallery_urls = [img.url for img in gallery_images]
    
    # Select best image
    selected_url = await image_service.select_from_gallery(
        gallery_urls=gallery_urls,
        purpose="design element",
        description=user_prompt,
        brand=brand
    )
    
    state["selected_gallery_image"] = selected_url
    
    if selected_url:
        print(f"   ✅ Selected gallery image")
    
    return state