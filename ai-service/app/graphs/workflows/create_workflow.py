# app/graphs/workflows/create_workflow.py (COMPLETE FILE)

from langgraph.graph import StateGraph, END
from app.models.state import DesignAgentState
from app.graphs.nodes.analysis.analyze_brand import analyze_brand_node
from app.graphs.nodes.analysis.analyze_intent import analyze_intent_node
from app.graphs.nodes.planning.plan_content import plan_content_node
from app.graphs.nodes.planning.plan_image_needs import plan_image_needs_node
from app.graphs.nodes.planning.plan_layout import plan_layout_node
from app.graphs.nodes.generation.acquire_images import acquire_images_node
from app.graphs.nodes.building.build_canvas import build_canvas_node
from app.graphs.nodes.building.finalize_canvas import finalize_canvas_node


def create_create_workflow():
    """
    CREATE_NEW workflow - simplified image handling
    """
    
    workflow = StateGraph(DesignAgentState)
    
    # Add nodes
    workflow.add_node("analyze_intent", analyze_intent_node)
    workflow.add_node("analyze_brand", analyze_brand_node)
    workflow.add_node("plan_content", plan_content_node)
    workflow.add_node("plan_image", plan_image_needs_node)
    workflow.add_node("select_image", acquire_images_node)
    workflow.add_node("plan_layout", plan_layout_node)
    workflow.add_node("build_canvas", build_canvas_node)
    workflow.add_node("finalize", finalize_canvas_node)
    
    # Define flow
    workflow.set_entry_point("analyze_intent")
    workflow.add_edge("analyze_intent", "analyze_brand")
    workflow.add_edge("analyze_brand", "plan_content")
    workflow.add_edge("plan_content", "plan_image")
    workflow.add_edge("plan_image", "select_image")
    workflow.add_edge("select_image", "plan_layout")
    workflow.add_edge("plan_layout", "build_canvas")
    workflow.add_edge("build_canvas", "finalize")
    workflow.add_edge("finalize", END)
    
    return workflow.compile()