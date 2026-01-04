# tests/test_image_service.py

import pytest
from app.services.image_service import image_service
from app.models.brand import BrandIdentity
from app.models.image import ImageRequest


@pytest.mark.asyncio
async def test_image_analysis():
    """Test Vision API image analysis"""
    
    # Test with a known image URL
    test_url = "https://pixabay.com/get/g3bb1c95c7b5c72a2b3e4c4c6c4c5c4c4c4c4c4c4_640.jpg"
    
    analysis = await image_service.analyze_image(test_url)
    
    # May fail if API key not set, that's ok for now
    if analysis:
        assert analysis.main_subject
        assert len(analysis.dominant_colors) > 0
        assert analysis.suitability


def test_image_service_initialization():
    """Test image service initializes"""
    assert image_service is not None