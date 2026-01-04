# app/graphs/workflows/improve_workflow.py

"""
COMPLETE IMPROVE_DESIGN workflow - enhance existing design
"""

from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
from typing import List
from langchain_core.messages import HumanMessage, SystemMessage
from app.models.state import DesignAgentState
from app.graphs.nodes.analysis.analyze_canvas import analyze_canvas_node
from app.graphs.nodes.analysis.analyze_brand import analyze_brand_node
from app.graphs.nodes.building.finalize_canvas import finalize_canvas_node
from app.services.llm_service import llm_service, TaskComplexity


class ImprovementPlan(BaseModel):
    """Plan for improving design"""
    
    changes_needed: List[str] = Field(..., description="List of specific changes to make")
    reasoning: str = Field(..., description="Why these changes will improve the design")


async def analyze_current_design(state: DesignAgentState) -> DesignAgentState:
    """Analyze current design to identify improvements"""
    
    print("🔍 Analyzing current design for improvements...")
    
    canvas = state["canvas"]
    user_prompt = state["user_prompt"]
    
    # Count elements
    text_count = sum(1 for o in canvas.objects if o.get("type") in ["textbox", "i-text"])
    image_count = sum(1 for o in canvas.objects if o.get("type") == "image")
    
    system_prompt = """You are a design expert analyzing existing designs.
Identify what improvements are needed based on:
- User's request
- Current design state
- Design best practices

Suggest specific, actionable changes."""
    
    user_message = f"""
Current design:
- Canvas: {canvas.width}x{canvas.height}px
- Text elements: {text_count}
- Images: {image_count}
- Background: {canvas.background or 'None'}

User request: "{user_prompt}"

What improvements are needed?
"""
    
    try:
        improvement_plan = await llm_service.ainvoke_structured(
            messages=[
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ],
            response_model=ImprovementPlan,
            task_complexity=TaskComplexity.SIMPLE
        )
        
        state["improvement_plan"] = improvement_plan
        
        print(f"   Changes needed: {len(improvement_plan.changes_needed)}")
        for i, change in enumerate(improvement_plan.changes_needed[:3], 1):
            print(f"   {i}. {change}")
        
    except Exception as e:
        print(f"   ⚠️  Analysis error: {e}")
        state["improvement_plan"] = ImprovementPlan(
            changes_needed=["Maintain current design"],
            reasoning="Unable to analyze"
        )
    
    return state


def apply_improvements(state: DesignAgentState) -> DesignAgentState:
    """
    Apply improvements to canvas
    (Simplified for now - would apply actual changes in full version)
    """
    
    print("✨ Applying improvements...")
    
    improvement_plan = state.get("improvement_plan")
    canvas = state["canvas"]
    
    # For now, just return original canvas
    # TODO: Implement actual improvements in future iteration
    # Would modify colors, spacing, typography, etc.
    
    print("   ⚠️  Improvements not fully implemented, returning original")
    state["final_canvas"] = canvas
    
    return state


def create_improve_workflow():
    """
    IMPROVE_DESIGN workflow
    
    Flow:
    1. Analyze current canvas
    2. Analyze brand
    3. Analyze what improvements are needed
    4. Apply improvements (simplified)
    5. Finalize
    
    Full implementation would:
    - Actually modify element properties
    - Adjust colors for brand consistency
    - Fix spacing and alignment
    - Improve typography
    """
    
    workflow = StateGraph(DesignAgentState)
    
    workflow.add_node("analyze_canvas", analyze_canvas_node)
    workflow.add_node("analyze_brand", analyze_brand_node)
    workflow.add_node("analyze_improvements", analyze_current_design)
    workflow.add_node("apply_improvements", apply_improvements)
    workflow.add_node("finalize", finalize_canvas_node)
    
    workflow.set_entry_point("analyze_canvas")
    workflow.add_edge("analyze_canvas", "analyze_brand")
    workflow.add_edge("analyze_brand", "analyze_improvements")
    workflow.add_edge("analyze_improvements", "apply_improvements")
    workflow.add_edge("apply_improvements", "finalize")
    workflow.add_edge("finalize", END)
    
    return workflow.compile()