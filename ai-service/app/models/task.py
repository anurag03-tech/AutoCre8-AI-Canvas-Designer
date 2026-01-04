# app/models/task.py

from enum import Enum
from pydantic import BaseModel
from typing import Optional, List


class TaskType(Enum):
    """Main task categories"""
    CREATE_NEW = "create_new"
    RESIZE_CANVAS = "resize_canvas"
    IMPROVE_DESIGN = "improve_design"
    ADJUST_ELEMENT = "adjust_element"
    CHANGE_STYLE = "change_style"
    FIX_ISSUE = "fix_issue"


class IntentAnalysis(BaseModel):
    """Parsed user intent"""
    platform: Optional[str] = None  # "Instagram", "Facebook", etc
    content_type: Optional[str] = None  # "ad", "post", "story"
    product: Optional[str] = None
    goal: Optional[str] = None  # "awareness", "conversion"
    tone: Optional[str] = None  # "professional", "casual"


class TaskClassification(BaseModel):
    """Result of task classification"""
    task_type: TaskType
    confidence: float
    reasoning: str
    sub_tasks: List[str] = []
    estimated_complexity: str  # "simple", "medium", "complex"