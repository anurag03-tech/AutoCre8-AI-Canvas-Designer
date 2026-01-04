# app/constants/fabric_elements.py 

from enum import Enum
from typing import Dict, Any, List


class FabricElementType(Enum):
    """Fabric.js element types"""
    TEXTBOX = "textbox"
    I_TEXT = "IText"
    IMAGE = "Image"
    RECT = "Rect"
    CIRCLE = "Circle"
    ELLIPSE = "Ellipse"


class FabricElementConfig:
    """Configuration for Fabric.js elements"""
    
    DEFAULT_PROPERTIES = {
        "textbox": {
            "type": "IText",
            "version": "5.3.0",
            "fontFamily": "Inter",
            "fontSize": 24,
            "lineHeight": 1.16,
            "fill": "#000000",
            "textAlign": "left",
            "originX": "left",
            "originY": "top",
            "fontWeight": "normal",
            "fontStyle": "normal",
            "stroke": None,
            "strokeWidth": 0,
            "angle": 0,
            "scaleX": 1,
            "scaleY": 1,
            "opacity": 1,
            "visible": True,
            "selectable": True,
            "evented": True,
        },
        "image": {
            "type": "Image",
            "version": "5.3.0",
            "crossOrigin": "anonymous",
            "originX": "left",
            "originY": "top",
            "scaleX": 1,
            "scaleY": 1,
            "angle": 0,
            "opacity": 1,
            "visible": True,
            "selectable": True,
            "evented": True,
        },
        "rectangle": {
            "type": "Rect",
            "version": "5.3.0",
            "fill": "#3b82f6",
            "originX": "left",
            "originY": "top",
            "stroke": None,
            "strokeWidth": 0,
            "rx": 0,
            "ry": 0,
            "angle": 0,
            "scaleX": 1,
            "scaleY": 1,
            "opacity": 1,
            "visible": True,
            "selectable": True,
            "evented": True,
        },
        "circle": {
            "type": "Circle",
            "version": "5.3.0",
            "fill": "#ec4899",
            "originX": "center",
            "originY": "center",
            "stroke": None,
            "strokeWidth": 0,
            "angle": 0,
            "scaleX": 1,
            "scaleY": 1,
            "opacity": 1,
            "visible": True,
            "selectable": True,
            "evented": True,
        },
    }
    
    @staticmethod
    def get_default_properties(element_type: str) -> Dict[str, Any]:
        """Get default properties for element type"""
        return FabricElementConfig.DEFAULT_PROPERTIES.get(element_type, {}).copy()