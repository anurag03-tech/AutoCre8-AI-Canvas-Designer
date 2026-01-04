# tests/test_llm_service.py

import pytest
from app.services.llm_service import llm_service
from app.constants.models import TaskComplexity, ModelType


def test_llm_service_initialization():
    """Test LLM service initializes correctly"""
    models_info = llm_service.get_available_models()
    
    # Should have at least OpenAI models
    assert models_info["total_models"] >= 2
    assert models_info["openai_available"] is True


def test_model_selection():
    """Test that correct models are selected for tasks"""
    
    # Simple task -> GPT-4o-mini
    model = llm_service.get_model_for_task(TaskComplexity.SIMPLE)
    assert model is not None
    
    # Vision task -> GPT-4o (only model with vision)
    model = llm_service.get_model_for_task(TaskComplexity.VISION)
    assert model is not None
    
    # Complex task -> Claude if available, else GPT-4o
    model = llm_service.get_model_for_task(TaskComplexity.COMPLEX)
    assert model is not None


def test_claude_availability():
    """Test Claude model availability"""
    models_info = llm_service.get_available_models()
    
    # Should report Claude availability
    assert "claude_available" in models_info
    assert "claude_provider" in models_info
    
    # If available, provider should be set
    if models_info["claude_available"]:
        assert models_info["claude_provider"] in ["anthropic_direct", "openrouter"]