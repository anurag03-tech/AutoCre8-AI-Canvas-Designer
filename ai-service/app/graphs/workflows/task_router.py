# app/graphs/workflows/task_router.py

"""
Main workflow router - directs tasks to appropriate workflow
"""

from langgraph.graph import StateGraph, END
from app.models.state import DesignAgentState
from app.models.task import TaskType
from app.graphs.nodes.classification.classify_task import classify_task_node
from app.graphs.workflows.create_workflow import create_create_workflow
from app.graphs.workflows.resize_workflow import create_resize_workflow
from app.graphs.workflows.improve_workflow import create_improve_workflow


def route_to_workflow(state: DesignAgentState) -> str:
    """Determine which workflow to execute based on task type"""
    
    task_type = state.get("task_type")
    
    if task_type == TaskType.CREATE_NEW:
        return "create_workflow"
    elif task_type == TaskType.RESIZE_CANVAS:
        return "resize_workflow"
    elif task_type == TaskType.IMPROVE_DESIGN:
        return "improve_workflow"
    elif task_type == TaskType.ADJUST_ELEMENT:
        return "improve_workflow"  
    elif task_type == TaskType.CHANGE_STYLE:
        return "improve_workflow"  
    elif task_type == TaskType.FIX_ISSUE:
        return "improve_workflow"  
    else:
        return "create_workflow" 


def create_master_graph():
    """
    Create the main routing graph
    
    Flow:
    1. Classify task
    2. Route to appropriate workflow
    3. Return result
    """
    
    workflow = StateGraph(DesignAgentState)
    
    # Add classification node
    workflow.add_node("classify_task", classify_task_node)
    
    # Add workflow nodes (these are sub-graphs)
    workflow.add_node("create_workflow", create_create_workflow())
    workflow.add_node("resize_workflow", create_resize_workflow())
    workflow.add_node("improve_workflow", create_improve_workflow())
    
    # Set entry point
    workflow.set_entry_point("classify_task")
    
    # Add conditional routing after classification
    workflow.add_conditional_edges(
        "classify_task",
        route_to_workflow,
        {
            "create_workflow": "create_workflow",
            "resize_workflow": "resize_workflow",
            "improve_workflow": "improve_workflow",
        }
    )
    
    # All workflows end
    workflow.add_edge("create_workflow", END)
    workflow.add_edge("resize_workflow", END)
    workflow.add_edge("improve_workflow", END)
    
    return workflow.compile()


# Singleton instance
master_graph = create_master_graph()