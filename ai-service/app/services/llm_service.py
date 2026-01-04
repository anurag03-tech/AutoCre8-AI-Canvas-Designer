# app/services/llm_service.py

"""
Multi-model LLM service with structured output support
Uses LangChain 0.3.x with_structured_output()
"""

import os
from typing import Any, List, Optional, Type
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import BaseMessage
from app.constants.models import ModelType, TaskComplexity, LLMProvider


class LLMService:
    """Unified LLM service with structured output support"""
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY")
        
        self.claude_provider = self._determine_claude_provider()
        self.models = {}
        self._initialize_models()
    
    def _determine_claude_provider(self) -> Optional[LLMProvider]:
        """Determine which provider to use for Claude"""
        if self.anthropic_key:
            print("🔧 Using Anthropic Direct API for Claude")
            return LLMProvider.ANTHROPIC_DIRECT
        elif self.openrouter_key:
            print("🔧 Using OpenRouter for Claude")
            return LLMProvider.OPENROUTER
        else:
            print("⚠️  No Claude API key found, will use GPT-4o as fallback")
            return None
    
    def _initialize_models(self):
        """Initialize all available models"""
        
        if self.openai_key:
            self.models[ModelType.GPT4O] = ChatOpenAI(
                model="gpt-4o",
                temperature=0.7,
                api_key=self.openai_key
            )
            
            self.models[ModelType.GPT4O_MINI] = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.7,
                api_key=self.openai_key
            )
        
        if self.claude_provider == LLMProvider.ANTHROPIC_DIRECT:
            try:
                self.models[ModelType.CLAUDE_SONNET] = ChatAnthropic(
                    model="claude-sonnet-4-20250514",
                    temperature=0.7,
                    anthropic_api_key=self.anthropic_key,
                    max_tokens=4096
                )
                print("✅ Claude Sonnet 4 initialized (Anthropic Direct)")
            except Exception as e:
                print(f"❌ Failed to initialize Claude via Anthropic: {e}")
                self.claude_provider = None
        
        elif self.claude_provider == LLMProvider.OPENROUTER:
            try:
                self.models[ModelType.CLAUDE_SONNET_OPENROUTER] = ChatOpenAI(
                    model="anthropic/claude-3.7-sonnet:thinking",
                    temperature=0.7,
                    api_key=self.openrouter_key,
                    base_url="https://openrouter.ai/api/v1",
                    default_headers={
                        "HTTP-Referer": "https://autocre8.ai",
                        "X-Title": "AutoCre8 Design Agent"
                    }
                )
                print("✅ Claude Sonnet 4 initialized (OpenRouter)")
            except Exception as e:
                print(f"❌ Failed to initialize Claude via OpenRouter: {e}")
                self.claude_provider = None
    
    def get_claude_model(self) -> Optional[Any]:
        """Get Claude model"""
        if self.claude_provider == LLMProvider.ANTHROPIC_DIRECT:
            return self.models.get(ModelType.CLAUDE_SONNET)
        elif self.claude_provider == LLMProvider.OPENROUTER:
            return self.models.get(ModelType.CLAUDE_SONNET_OPENROUTER)
        return None
    
    def get_model_for_task(self, task_complexity: TaskComplexity) -> Any:
        """Auto-select best model for task"""
        
        if task_complexity == TaskComplexity.SIMPLE:
            return self.models.get(ModelType.GPT4O_MINI, self.models[ModelType.GPT4O])
        
        elif task_complexity == TaskComplexity.VISION:
            if ModelType.GPT4O not in self.models:
                raise ValueError("GPT-4o required for vision tasks")
            return self.models[ModelType.GPT4O]
        
        elif task_complexity == TaskComplexity.COMPLEX:
            claude_model = self.get_claude_model()
            if claude_model:
                return claude_model
            if ModelType.GPT4O in self.models:
                return self.models[ModelType.GPT4O]
            raise ValueError("No suitable model for complex tasks")
        
        else:  # MEDIUM
            if ModelType.GPT4O in self.models:
                return self.models[ModelType.GPT4O]
            raise ValueError("GPT-4o required")
    
    async def ainvoke(
        self,
        messages: List[BaseMessage],
        task_complexity: TaskComplexity = TaskComplexity.MEDIUM,
        **kwargs
    ):
        """Invoke with automatic model selection"""
        try:
            model = self.get_model_for_task(task_complexity)
            return await model.ainvoke(messages, **kwargs)
        except Exception as e:
            print(f"❌ LLM invocation error: {e}")
            raise
    
    # ✅ NEW: Structured output support
    async def ainvoke_structured(
        self,
        messages: List[BaseMessage],
        response_model: Type[BaseModel],
        task_complexity: TaskComplexity = TaskComplexity.MEDIUM,
    ) -> BaseModel:
        """
        Invoke with structured output (returns Pydantic model directly)
        
        Uses LangChain's with_structured_output() - no manual JSON parsing!
        
        Example:
            result = await llm_service.ainvoke_structured(
                messages=[...],
                response_model=TaskClassification,
                task_complexity=TaskComplexity.SIMPLE
            )
            # result is already a TaskClassification instance!
        """
        try:
            base_model = self.get_model_for_task(task_complexity)
            
            # Use with_structured_output for type-safe responses
            structured_model = base_model.with_structured_output(response_model)
            
            result = await structured_model.ainvoke(messages)
            return result
            
        except Exception as e:
            print(f"❌ Structured output error: {e}")
            raise
    
    # Convenience methods
    async def plan_layout(self, messages: List[BaseMessage]):
        """Use Claude for complex layout planning"""
        return await self.ainvoke(messages, TaskComplexity.COMPLEX)
    
    async def analyze_image(self, messages: List[BaseMessage]):
        """Use GPT-4o for vision tasks"""
        return await self.ainvoke(messages, TaskComplexity.VISION)
    
    async def generate_content(self, messages: List[BaseMessage]):
        """Use cheap model for content generation"""
        return await self.ainvoke(messages, TaskComplexity.SIMPLE)
    
    def get_available_models(self) -> dict:
        """Get list of available models"""
        return {
            "openai_available": ModelType.GPT4O in self.models,
            "claude_provider": self.claude_provider.value if self.claude_provider else None,
            "claude_available": self.get_claude_model() is not None,
            "total_models": len(self.models),
            "models_list": [model.value for model in self.models.keys()]
        }


# Singleton instance
llm_service = LLMService()