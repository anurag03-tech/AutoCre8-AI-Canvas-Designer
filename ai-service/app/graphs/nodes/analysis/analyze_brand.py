# app/graphs/nodes/analysis/analyze_brand.py

"""
Brand analysis node - extracts key brand information
"""

from app.models.state import DesignAgentState


def analyze_brand_node(state: DesignAgentState) -> DesignAgentState:
    """Extract key brand identity information"""
    
    print("🎨 Analyzing brand...")
    
    brand = state.get("brand")
    
    if not brand:
        state["brand_analysis"] = "No brand identity available"
        print("   ⚠️  No brand identity")
        return state
    
    analysis = f"""Brand Identity:
- Name: {brand.name}
- Primary color: {brand.primaryColor}
- Secondary color: {brand.secondaryColor}
- Accent color: {brand.accentColor}
- Fonts: {', '.join(brand.preferredFonts[:3])}
- Logo available: {'Yes' if brand.logoUrls else 'No'}
"""
    
    state["brand_analysis"] = analysis
    print(f"   {analysis.strip()}")
    
    return state