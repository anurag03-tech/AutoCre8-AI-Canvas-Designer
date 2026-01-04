# tests/test_task_classification.py

import pytest
from app.models.canvas import CanvasData
from app.models.state import DesignAgentState
from app.models.task import TaskType
from app.graphs.nodes.classification.classify_task import classify_task_node


@pytest.mark.asyncio
async def test_create_new_classification():
    """Test classification of create new request"""
    
    state: DesignAgentState = {
        "user_prompt": "Create an Instagram post for coffee shop",
        "canvas": CanvasData(width=1080, height=1080, objects=[]),
        "brand": None,
        "project_id": "test",
        "gallery_images": [],
        "errors": [],
        "warnings": [],
        "metadata": {},
    }
    
    result = await classify_task_node(state)
    
    # Should classify as CREATE_NEW (empty canvas + creation request)
    assert result["task_type"] == TaskType.CREATE_NEW


@pytest.mark.asyncio
async def test_resize_classification():
    """Test classification of resize request"""
    
    state: DesignAgentState = {
        "user_prompt": "Resize this to YouTube thumbnail size",
        "canvas": CanvasData(width=1080, height=1080, objects=[{"type": "rect"}]),
        "brand": None,
        "project_id": "test",
        "gallery_images": [],
        "errors": [],
        "warnings": [],
        "metadata": {},
    }
    
    result = await classify_task_node(state)
    
    # Should classify as RESIZE_CANVAS
    assert result["task_type"] == TaskType.RESIZE_CANVAS


@pytest.mark.asyncio
async def test_improve_classification():
    """Test classification of improve request"""
    
    state: DesignAgentState = {
        "user_prompt": "Make this more modern and professional",
        "canvas": CanvasData(width=1080, height=1080, objects=[{"type": "textbox"}]),
        "brand": None,
        "project_id": "test",
        "gallery_images": [],
        "errors": [],
        "warnings": [],
        "metadata": {},
    }
    
    result = await classify_task_node(state)
    
    # Should classify as IMPROVE_DESIGN
    assert result["task_type"] == TaskType.IMPROVE_DESIGN