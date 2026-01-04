# app/constants/text_styles.py (CREATE NEW FILE)

"""
Advanced text styles from UI - AI can choose which fits best
"""

from typing import Dict, Any


class TextStyles:
    """Professional text styles with gradients, shadows, strokes"""
    
    STYLES = {
        "fire_gradient": {
            "name": "Fire Gradient",
            "fontFamily": "Impact",
            "fontSize_scale": "5xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 180,
                "colors": ["#ff0080", "#ff8c00"],
            },
            "stroke": "#000000",
            "strokeWidth": 2,
            "use_case": "Bold headlines, attention-grabbing",
        },
        
        "neon_glow": {
            "name": "Neon Glow",
            "fontFamily": "Arial",
            "fontSize_scale": "4xl",
            "fontWeight": "bold",
            "fill": "#00ffff",
            "stroke": "#0080ff",
            "strokeWidth": 3,
            "shadow": {
                "color": "#00ffff",
                "blur": 25,
                "offsetX": 0,
                "offsetY": 0,
            },
            "use_case": "Modern, tech, nightlife",
        },
        
        "gold_3d": {
            "name": "Gold 3D",
            "fontFamily": "Impact",
            "fontSize_scale": "5xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 180,
                "colors": ["#ffd700", "#ff8c00"],
            },
            "stroke": "#8B4513",
            "strokeWidth": 4,
            "shadow": {
                "color": "#000000",
                "blur": 8,
                "offsetX": 4,
                "offsetY": 4,
            },
            "use_case": "Luxury, premium, celebration",
        },
        
        "comic_book": {
            "name": "Comic Book",
            "fontFamily": "Impact",
            "fontSize_scale": "4xl",
            "fontWeight": "bold",
            "fill": "#ff0000",
            "stroke": "#000000",
            "strokeWidth": 6,
            "shadow": {
                "color": "#ffff00",
                "blur": 0,
                "offsetX": 5,
                "offsetY": 5,
            },
            "use_case": "Playful, energetic, bold",
        },
        
        "ocean_wave": {
            "name": "Ocean Wave",
            "fontFamily": "Arial",
            "fontSize_scale": "4xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 180,
                "colors": ["#667eea", "#764ba2"],
            },
            "stroke": "#ffffff",
            "strokeWidth": 2,
            "use_case": "Calm, professional, trustworthy",
        },
        
        "sunset": {
            "name": "Sunset",
            "fontFamily": "Georgia",
            "fontSize_scale": "4xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 180,
                "colors": ["#ff6b6b", "#feca57"],
            },
            "use_case": "Warm, friendly, creative",
        },
        
        "mint_fresh": {
            "name": "Mint Fresh",
            "fontFamily": "Verdana",
            "fontSize_scale": "3xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 180,
                "colors": ["#48c6ef", "#6f86d6"],
            },
            "stroke": "#ffffff",
            "strokeWidth": 3,
            "use_case": "Fresh, clean, health",
        },
        
        "chrome_metal": {
            "name": "Chrome Metal",
            "fontFamily": "Impact",
            "fontSize_scale": "5xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 180,
                "colors": ["#bdc3c7", "#2c3e50", "#bdc3c7"],
            },
            "stroke": "#34495e",
            "strokeWidth": 2,
            "use_case": "Industrial, tech, modern",
        },
        
        "rainbow": {
            "name": "Rainbow",
            "fontFamily": "Arial",
            "fontSize_scale": "4xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 90,
                "colors": ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#9400d3"],
            },
            "stroke": "#ffffff",
            "strokeWidth": 3,
            "use_case": "Celebration, diversity, joy",
        },
        
        "retro_80s": {
            "name": "Retro 80s",
            "fontFamily": "Impact",
            "fontSize_scale": "4xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 180,
                "colors": ["#f857a6", "#ff5858"],
            },
            "stroke": "#000000",
            "strokeWidth": 4,
            "shadow": {
                "color": "#00ffff",
                "blur": 15,
                "offsetX": 3,
                "offsetY": 3,
            },
            "use_case": "Retro, nostalgic, vibrant",
        },
        
        "ice_cold": {
            "name": "Ice Cold",
            "fontFamily": "Arial",
            "fontSize_scale": "4xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 180,
                "colors": ["#e0f7fa", "#006064"],
            },
            "stroke": "#b2ebf2",
            "strokeWidth": 2,
            "use_case": "Cool, refreshing, water",
        },
        
        "lava": {
            "name": "Lava",
            "fontFamily": "Impact",
            "fontSize_scale": "5xl",
            "fontWeight": "bold",
            "gradient": {
                "type": "linear",
                "angle": 180,
                "colors": ["#ff4e00", "#ec9f05"],
            },
            "shadow": {
                "color": "#ff0000",
                "blur": 30,
                "offsetX": 0,
                "offsetY": 0,
            },
            "use_case": "Hot, intense, dramatic",
        },
    }
    
    @classmethod
    def get_style_for_mood(cls, mood: str) -> str:
        """Suggest text style based on mood/theme"""
        mood_mapping = {
            "bold": "fire_gradient",
            "modern": "neon_glow",
            "luxury": "gold_3d",
            "playful": "comic_book",
            "professional": "ocean_wave",
            "warm": "sunset",
            "fresh": "mint_fresh",
            "tech": "chrome_metal",
            "vibrant": "rainbow",
            "retro": "retro_80s",
            "cool": "ice_cold",
            "intense": "lava",
        }
        
        return mood_mapping.get(mood.lower(), "ocean_wave")