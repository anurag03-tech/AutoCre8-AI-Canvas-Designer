# app/graphs/nodes/classification/classify_task.py

"""
Task classification node - uses structured outputs
"""

from langchain_core.messages import HumanMessage, SystemMessage
from app.models.state import DesignAgentState
from app.models.task import TaskType, TaskClassification
from app.services.llm_service import llm_service, TaskComplexity


async def classify_task_node(state: DesignAgentState) -> DesignAgentState:
    """
    Classify user's task using structured outputs (no manual JSON parsing!)
    """
    
    print("🔍 Classifying task...")
    
    user_prompt = state["user_prompt"]
    canvas = state["canvas"]
    has_content = len(canvas.objects) > 0
    
    system_prompt = """You are a task classification expert for a design AI.
Analyze the user's request and current canvas state to determine the task type.

Task Types:
- create_new: Build new design from scratch
- resize_canvas: Change canvas dimensions
- improve_design: Enhance existing design
- adjust_element: Modify specific element
- change_style: Apply style transformation
- fix_issue: Fix specific problem

Consider:
- Empty canvas usually means create_new
- Mentions of dimensions/size mean resize_canvas
- Requests to improve/modernize mean improve_design"""
    
    user_message = f"""
User prompt: "{user_prompt}"

Canvas state:
- Width: {canvas.width}px
- Height: {canvas.height}px
- Has content: {has_content}
- Number of objects: {len(canvas.objects)}

Classify this task.
"""
    
    try:
        # ✅ Use structured output - returns TaskClassification directly!
        classification = await llm_service.ainvoke_structured(
            messages=[
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ],
            response_model=TaskClassification,
            task_complexity=TaskComplexity.SIMPLE
        )
        
        # Update state
        state["task_type"] = classification.task_type
        state["metadata"] = state.get("metadata", {})
        state["metadata"]["classification"] = {
            "confidence": classification.confidence,
            "reasoning": classification.reasoning,
            "sub_tasks": classification.sub_tasks,
            "estimated_complexity": classification.estimated_complexity,
        }
        
        print(f"   ✅ Task: {classification.task_type.value}")
        print(f"   Confidence: {classification.confidence:.2f}")
        print(f"   Reasoning: {classification.reasoning}")
        
    except Exception as e:
        print(f"   ⚠️  Classification error: {e}")
        # Fallback logic
        if not has_content:
            state["task_type"] = TaskType.CREATE_NEW
        else:
            state["task_type"] = TaskType.IMPROVE_DESIGN
        
        print(f"   Using fallback: {state['task_type'].value}")
    
    return state