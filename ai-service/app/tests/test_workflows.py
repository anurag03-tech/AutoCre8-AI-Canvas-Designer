# tests/test_workflows.py

import pytest
from app.models.canvas import CanvasData
from app.models.brand import BrandIdentity
from app.models.state import DesignAgentState
from app.graphs.workflows.task_router import master_graph


@pytest.mark.asyncio
async def test_master_graph_create():
    """Test master graph with CREATE_NEW task"""
    
    state: DesignAgentState = {
        "user_prompt": "Create Instagram post for coffee",
        "canvas": CanvasData(width=1080, height=1080, objects=[]),
        "brand": BrandIdentity(
            id="test",
            name="Test Brand",
            primaryColor="#3b82f6",
            secondaryColor="#8b5cf6",
            accentColor="#ec4899",
            preferredFonts=["Inter"],
            logoUrls=[],
        ),
        "project_id": "test",
        "gallery_images": [],
        "errors": [],
        "warnings": [],
        "metadata": {},
    }
    
    result = await master_graph.ainvoke(state)
    
    # Should complete without error
    assert "final_canvas" in result or "canvas" in result
    assert "metadata" in result


def test_workflow_imports():
    """Test that all workflow components import correctly"""
    from app.graphs.workflows.create_workflow import create_create_workflow
    from app.graphs.workflows.resize_workflow import create_resize_workflow
    from app.graphs.workflows.improve_workflow import create_improve_workflow
    
    assert create_create_workflow is not None
    assert create_resize_workflow is not None
    assert create_improve_workflow is not None