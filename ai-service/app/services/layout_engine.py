# app/services/layout_engine.py

"""
Layout engine - calculates professional layouts using design principles
"""

from typing import List, Tuple, Dict
from app.constants.design_system import DesignSystem
from app.models.brand import BrandIdentity


class LayoutEngine:
    """Professional layout calculation"""
    
    @staticmethod
    def calculate_grid(
        canvas_width: int,
        canvas_height: int,
        columns: int = 3
    ) -> Dict:
        """Calculate rule-of-thirds grid"""
        return DesignSystem.calculate_grid_positions(canvas_width, canvas_height, columns)
    
    @staticmethod
    def get_safe_area(
        canvas_width: int,
        canvas_height: int,
        margin_type: str = "normal"
    ) -> Dict[str, int]:
        """Get safe area boundaries"""
        margins = DesignSystem.get_safe_margin_pixels(
            canvas_width, canvas_height, margin_type
        )
        
        return {
            "left": margins["left"],
            "top": margins["top"],
            "right": canvas_width - margins["right"],
            "bottom": canvas_height - margins["bottom"],
            "width": canvas_width - margins["left"] - margins["right"],
            "height": canvas_height - margins["top"] - margins["bottom"],
        }
    
    @staticmethod
    def calculate_text_position(
        role: str,  # "headline", "subheadline", "body"
        canvas_width: int,
        canvas_height: int,
        safe_area: Dict[str, int]
    ) -> Tuple[float, float, float]:
        """
        Calculate optimal text position (returns relative 0-1)
        
        Returns: (x, y, width) as percentages
        """
        
        if role == "headline":
            # Top third, centered, 80% width
            return (0.1, 0.15, 0.8)
        
        elif role == "subheadline":
            # Below headline
            return (0.1, 0.35, 0.8)
        
        elif role == "body":
            # Middle area
            return (0.1, 0.5, 0.8)
        
        elif role == "cta":
            # Bottom area
            return (0.2, 0.75, 0.6)
        
        else:
            # Default center
            return (0.1, 0.4, 0.8)
    
    @staticmethod
    def calculate_logo_position(
        canvas_width: int,
        canvas_height: int,
        position: str = "top-right"
    ) -> Tuple[float, float, float]:
        """
        Calculate logo position (returns relative 0-1)
        
        Returns: (x, y, width) as percentages
        """
        
        logo_width = 0.12  # 12% of canvas width
        margin = 0.05  # 5% margin
        
        if position == "top-right":
            return (1 - margin - logo_width, margin, logo_width)
        elif position == "top-left":
            return (margin, margin, logo_width)
        elif position == "bottom-right":
            return (1 - margin - logo_width, 1 - margin - logo_width, logo_width)
        elif position == "bottom-left":
            return (margin, 1 - margin - logo_width, logo_width)
        else:
            # Default top-right
            return (1 - margin - logo_width, margin, logo_width)
    
    @staticmethod
    def calculate_font_sizes(
        canvas_height: int,
        brand: BrandIdentity
    ) -> Dict[str, int]:
        """Calculate font sizes for all text roles"""
        
        return {
            "headline": DesignSystem.get_font_size_for_role("headline", canvas_height),
            "subheadline": DesignSystem.get_font_size_for_role("subheadline", canvas_height),
            "body": DesignSystem.get_font_size_for_role("body", canvas_height),
            "caption": DesignSystem.get_font_size_for_role("caption", canvas_height),
        }


# Singleton
layout_engine = LayoutEngine()