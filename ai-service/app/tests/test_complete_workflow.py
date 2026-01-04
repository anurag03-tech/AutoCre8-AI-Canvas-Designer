# tests/test_complete_workflow.py

import pytest
from app.models.canvas import CanvasData
from app.models.brand import BrandIdentity
from app.services.design_agent import run_design_agent


@pytest.mark.asyncio
async def test_create_workflow_end_to_end():
    """Test complete CREATE_NEW workflow"""
    
    canvas = CanvasData(
        width=1080,
        height=1080,
        objects=[],
        background="#ffffff"
    )
    
    brand = BrandIdentity(
        id="test",
        name="Coffee Shop",
        primaryColor="#6F4E37",
        secondaryColor="#C8B092",
        accentColor="#D4A574",
        preferredFonts=["Georgia", "serif"],
        logoUrls=[],
    )
    
    result = await run_design_agent(
        canvas=canvas,
        brand=brand,
        gallery_images=[],
        user_prompt="Create an Instagram post for our new espresso blend"
    )
    
    # Should return a canvas with content
    assert result is not None
    assert result.width == 1080
    assert result.height == 1080
    # May or may not have objects depending on if image acquisition worked
    # At minimum should have background set


@pytest.mark.asyncio
async def test_improve_workflow():
    """Test IMPROVE_DESIGN workflow"""
    
    canvas = CanvasData(
        width=1080,
        height=1080,
        objects=[
            {
                "type": "textbox",
                "text": "Hello World",
                "left": 100,
                "top": 100,
                "width": 200,
                "fontSize": 24,
            }
        ],
        background="#ffffff"
    )
    
    brand = BrandIdentity(
        id="test",
        name="Test Brand",
        primaryColor="#3b82f6",
        secondaryColor="#8b5cf6",
        accentColor="#ec4899",
        preferredFonts=["Inter"],
        logoUrls=[],
    )
    
    result = await run_design_agent(
        canvas=canvas,
        brand=brand,
        gallery_images=[],
        user_prompt="Make this more professional"
    )
    
    # Should return modified canvas
    assert result is not None
    assert result.width == 1080
    assert result.height == 1080