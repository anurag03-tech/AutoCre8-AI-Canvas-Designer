# app/utils/validation_utils.py

from typing import Dict, List, Any
from app.models.canvas import CanvasData
from app.utils.color_utils import ColorUtils


class ValidationUtils:
    """Design validation utilities"""
    
    @staticmethod
    def validate_element_bounds(
        element: Dict[str, Any],
        canvas_width: int,
        canvas_height: int
    ) -> bool:
        """Check if element is within canvas bounds"""
        left = element.get("left", 0)
        top = element.get("top", 0)
        
        if left < 0 or top < 0:
            return False
        
        if left >= canvas_width or top >= canvas_height:
            return False
        
        return True
    
    @staticmethod
    def validate_text_contrast(
        text_color: str,
        background_color: str,
        min_ratio: float = 4.5
    ) -> bool:
        """Check if text has sufficient contrast"""
        if not ColorUtils.is_valid_hex(text_color) or not ColorUtils.is_valid_hex(background_color):
            return False
        
        contrast = ColorUtils.calculate_contrast(text_color, background_color)
        return contrast >= min_ratio
    
    @staticmethod
    def validate_safe_margins(
        element: Dict[str, Any],
        canvas_width: int,
        canvas_height: int,
        margin_percent: float = 0.05
    ) -> bool:
        """Check if element respects safe margins"""
        margin_x = canvas_width * margin_percent
        margin_y = canvas_height * margin_percent
        
        left = element.get("left", 0)
        top = element.get("top", 0)
        
        if left < margin_x or top < margin_y:
            return False
        
        if left > (canvas_width - margin_x) or top > (canvas_height - margin_y):
            return False
        
        return True