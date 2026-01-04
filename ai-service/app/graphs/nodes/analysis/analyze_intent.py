# app/graphs/nodes/analysis/analyze_intent.py

"""
Intent analysis node - uses structured outputs
"""

from langchain_core.messages import HumanMessage, SystemMessage
from app.models.state import DesignAgentState
from app.models.task import IntentAnalysis
from app.services.llm_service import llm_service, TaskComplexity


async def analyze_intent_node(state: DesignAgentState) -> DesignAgentState:
    """Parse user's intent using structured outputs"""
    
    print("💭 Analyzing user intent...")
    
    user_prompt = state["user_prompt"]
    
    system_prompt = """You are an expert at understanding design requests.
Extract the user's intent from their natural language prompt.

Identify:
- Platform (Instagram, Facebook, YouTube, etc.)
- Content type (ad, post, story, thumbnail, etc.)
- Product or brand mentioned
- Goal (awareness, conversion, engagement, etc.)
- Tone (professional, casual, fun, etc.)

Return null for fields you cannot determine."""
    
    user_message = f'User request: "{user_prompt}"\n\nExtract intent.'
    
    try:
        # ✅ Use structured output
        intent = await llm_service.ainvoke_structured(
            messages=[
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ],
            response_model=IntentAnalysis,
            task_complexity=TaskComplexity.SIMPLE
        )
        
        state["intent"] = intent
        
        print(f"   Platform: {intent.platform or 'Not specified'}")
        print(f"   Type: {intent.content_type or 'Not specified'}")
        print(f"   Product: {intent.product or 'Not specified'}")
        print(f"   Goal: {intent.goal or 'Not specified'}")
        
    except Exception as e:
        print(f"   ⚠️  Intent analysis error: {e}")
        state["intent"] = IntentAnalysis()
    
    return state