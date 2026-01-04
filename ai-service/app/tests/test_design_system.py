# tests/test_design_system.py

import pytest
from app.constants.design_system import DesignSystem


def test_font_size_calculation():
    """Test font size calculation for different roles"""
    
    canvas_height = 1080
    
    # Headline should be largest
    headline_size = DesignSystem.get_font_size_for_role("headline", canvas_height)
    subheadline_size = DesignSystem.get_font_size_for_role("subheadline", canvas_height)
    body_size = DesignSystem.get_font_size_for_role("body", canvas_height)
    
    assert headline_size > subheadline_size > body_size
    assert headline_size >= 32  # Minimum headline size
    assert headline_size <= 120  # Maximum headline size


def test_safe_margins():
    """Test safe margin calculation"""
    
    margins = DesignSystem.get_safe_margin_pixels(1080, 1080, "normal")
    
    assert margins["top"] == 86  # 8% of 1080
    assert margins["right"] == 86
    assert margins["bottom"] == 86
    assert margins["left"] == 86