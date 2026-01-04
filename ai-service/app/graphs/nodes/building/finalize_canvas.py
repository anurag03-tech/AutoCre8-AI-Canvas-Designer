# app/graphs/nodes/building/finalize_canvas.py

"""
Finalization node - prepares canvas for return to frontend
"""

from app.models.state import DesignAgentState


def finalize_canvas_node(state: DesignAgentState) -> DesignAgentState:
    """Finalize canvas and prepare for return"""
    
    print("✨ Finalizing canvas...")
    
    # Get the design plan or use original canvas
    final_canvas = state.get("final_canvas", state["canvas"])
    
    # Add metadata
    metadata = state.get("metadata", {})
    metadata["total_objects"] = len(final_canvas.objects)
    metadata["canvas_size"] = f"{final_canvas.width}x{final_canvas.height}"
    
    state["final_canvas"] = final_canvas
    state["metadata"] = metadata
    
    print(f"   ✅ Final canvas: {metadata['canvas_size']}, {metadata['total_objects']} objects")
    
    return state