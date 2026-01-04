# app/constants/models.py

from enum import Enum


class ModelType(Enum):
    """Available LLM models"""
    # OpenAI Models
    GPT4O = "gpt-4o"
    GPT4O_MINI = "gpt-4o-mini"
    
    # Anthropic Models
    CLAUDE_SONNET = "claude-sonnet-4-20250514"  
    CLAUDE_SONNET_OPENROUTER = "anthropic/claude-3.7-sonnet:thinking" 


class TaskComplexity(Enum):
    """Task complexity levels for model routing"""
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"
    VISION = "vision"


class LLMProvider(Enum):
    """LLM Provider options"""
    OPENAI = "openai"
    ANTHROPIC_DIRECT = "anthropic_direct"
    OPENROUTER = "openrouter"