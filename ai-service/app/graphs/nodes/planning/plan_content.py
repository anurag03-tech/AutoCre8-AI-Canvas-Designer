# app/graphs/nodes/planning/plan_content.py

"""
Content planning node - generates marketing copy
"""

from langchain_core.messages import HumanMessage, SystemMessage
from app.models.state import DesignAgentState
from app.models.content import ContentPlan
from app.services.llm_service import llm_service, TaskComplexity
from app.constants.prompts import PromptLibrary


async def plan_content_node(state: DesignAgentState) -> DesignAgentState:
    """Generate marketing content using structured output"""
    
    print("📝 Planning content...")
    
    intent = state.get("intent")
    brand = state.get("brand")
    user_prompt = state["user_prompt"]
    
    system_prompt = PromptLibrary.CONTENT_GENERATOR_SYSTEM
    
    user_message = f"""
Create marketing content for:

User request: "{user_prompt}"
Platform: {intent.platform if intent else 'General'}
Content type: {intent.content_type if intent else 'post'}
Product: {intent.product if intent else 'Not specified'}
Brand: {brand.name if brand else 'Default'}

Generate concise, engaging content:
- Headline: Main attention-grabbing text (5-8 words)
- Subheadline: Supporting text (optional, 8-12 words)
- CTA: Call to action (2-4 words)

Keep it punchy and brand-appropriate.
"""
    
    try:
        content_plan = await llm_service.ainvoke_structured(
            messages=[
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ],
            response_model=ContentPlan,
            task_complexity=TaskComplexity.SIMPLE
        )
        
        state["planned_content"] = content_plan
        
        print(f"   Headline: {content_plan.headline}")
        print(f"   Subheadline: {content_plan.subheadline}")
        print(f"   CTA: {content_plan.cta}")
        
    except Exception as e:
        print(f"   ⚠️  Content planning error: {e}")
        # Fallback content
        state["planned_content"] = ContentPlan(
            headline=intent.product if intent and intent.product else "Your Brand",
            subheadline="Quality you can trust",
            cta="Learn More",
            reasoning="Fallback content"
        )
    
    return state