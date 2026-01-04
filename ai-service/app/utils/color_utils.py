# app/utils/color_utils.py

import re
from typing import Tuple


class ColorUtils:
    """Color manipulation and validation utilities"""
    
    @staticmethod
    def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    @staticmethod
    def rgb_to_hex(r: int, g: int, b: int) -> str:
        """Convert RGB to hex color"""
        return f"#{r:02x}{g:02x}{b:02x}"
    
    @staticmethod
    def calculate_luminance(hex_color: str) -> float:
        """Calculate relative luminance (WCAG formula)"""
        r, g, b = ColorUtils.hex_to_rgb(hex_color)
        
        # Normalize to 0-1
        r, g, b = r / 255.0, g / 255.0, b / 255.0
        
        # Apply gamma correction
        r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
        g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
        b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    
    @staticmethod
    def calculate_contrast(color1: str, color2: str) -> float:
        """Calculate contrast ratio between two colors (WCAG)"""
        lum1 = ColorUtils.calculate_luminance(color1)
        lum2 = ColorUtils.calculate_luminance(color2)
        
        lighter = max(lum1, lum2)
        darker = min(lum1, lum2)
        
        return (lighter + 0.05) / (darker + 0.05)
    
    @staticmethod
    def is_valid_hex(color: str) -> bool:
        """Validate hex color format"""
        pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        return bool(re.match(pattern, color))
    
    @staticmethod
    def get_accessible_text_color(bg_color: str) -> str:
        """Get black or white text color with best contrast"""
        contrast_with_black = ColorUtils.calculate_contrast(bg_color, "#000000")
        contrast_with_white = ColorUtils.calculate_contrast(bg_color, "#FFFFFF")
        
        return "#000000" if contrast_with_black > contrast_with_white else "#FFFFFF"