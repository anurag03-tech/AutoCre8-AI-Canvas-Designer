# app/constants/design_system.py

"""
Central design system constants
Based on professional design principles
"""

from typing import Dict, List, Tuple


class DesignSystem:
    """Professional design system constants"""
    
    # Typography Scale (Major Third - 1.25 ratio)
    FONT_SCALE = {
        "xs": 12,
        "sm": 15,
        "base": 19,
        "lg": 24,
        "xl": 30,
        "2xl": 37,
        "3xl": 46,
        "4xl": 58,
        "5xl": 72,
        "6xl": 90,
    }
    
    # Font weight mappings
    FONT_WEIGHTS = {
        "light": 300,
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700,
        "extrabold": 800,
    }
    
    # Default font families by style
    FONT_FAMILIES = {
        "sans": ["Inter", "Arial", "Helvetica", "sans-serif"],
        "serif": ["Georgia", "Times New Roman", "serif"],
        "mono": ["Monaco", "Courier New", "monospace"],
        "display": ["Impact", "Helvetica Neue", "sans-serif"],
    }
    
    # Golden Ratio
    GOLDEN_RATIO = 1.618
    
    # Safe margins (as percentage of canvas dimension)
    SAFE_MARGINS = {
        "none": 0.0,
        "tight": 0.05,
        "normal": 0.08,
        "loose": 0.12,
        "extra_loose": 0.15,
    }
    
    # Spacing scale (based on 8px base unit)
    SPACING_SCALE = {
        "0": 0,
        "1": 4,
        "2": 8,
        "3": 12,
        "4": 16,
        "5": 20,
        "6": 24,
        "8": 32,
        "10": 40,
        "12": 48,
        "16": 64,
        "20": 80,
        "24": 96,
    }
    
    # Z-index layers
    Z_INDEX = {
        "background": 0,
        "background_image": 1,
        "decorative": 2,
        "content": 3,
        "images": 4,
        "text": 5,
        "logo": 6,
        "overlay": 7,
    }
    
    @staticmethod
    def calculate_grid_positions(
        canvas_width: int,
        canvas_height: int,
        columns: int = 3
    ) -> Dict[str, List[float]]:
        """Calculate grid positions based on rule of thirds"""
        
        col_width = canvas_width / columns
        row_height = canvas_height / columns
        
        x_positions = [i * col_width for i in range(columns + 1)]
        y_positions = [i * row_height for i in range(columns + 1)]
        
        return {
            "x_positions": x_positions,
            "y_positions": y_positions,
            "column_width": col_width,
            "row_height": row_height,
        }
    
    @staticmethod
    def get_font_size_for_role(role: str, canvas_height: int) -> int:
        """Calculate font size based on role and canvas height"""
        ratios = {
            "headline": 0.08,
            "subheadline": 0.05,
            "body": 0.035,
            "caption": 0.025,
        }
        
        base_size = int(canvas_height * ratios.get(role, 0.035))
        
        min_sizes = {"headline": 32, "subheadline": 24, "body": 16, "caption": 12}
        max_sizes = {"headline": 120, "subheadline": 72, "body": 48, "caption": 24}
        
        min_size = min_sizes.get(role, 16)
        max_size = max_sizes.get(role, 72)
        
        return max(min_size, min(base_size, max_size))
    
    @staticmethod
    def get_safe_margin_pixels(
        canvas_width: int, 
        canvas_height: int, 
        margin_type: str = "normal"
    ) -> Dict[str, int]:
        """Calculate safe margins in pixels"""
        margin_ratio = DesignSystem.SAFE_MARGINS.get(margin_type, 0.08)
        
        return {
            "top": int(canvas_height * margin_ratio),
            "right": int(canvas_width * margin_ratio),
            "bottom": int(canvas_height * margin_ratio),
            "left": int(canvas_width * margin_ratio),
        }