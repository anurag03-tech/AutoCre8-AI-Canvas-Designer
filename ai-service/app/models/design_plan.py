from pydantic import BaseModel
from typing import List, Literal, Optional

class BackgroundPlan(BaseModel):
    type: Literal["photo", "solid", "gradient", "none"] = "none"
    imagePrompt: Optional[str] = None
    color: Optional[str] = None

class TextBlockPlan(BaseModel):
    content: str
    x: float  # 0-1 relative
    y: float  # 0-1 relative
    width: float  # 0-1 relative
    kind: Literal["headline", "subheadline", "body"] = "body"
    align: Literal["left", "center", "right"] = "left"
    fontWeight: Literal["normal", "bold"] = "normal"

class LogoPlacementPlan(BaseModel):
    useLogo: bool = False
    x: float = 0.85  # top-right by default
    y: float = 0.05
    width: float = 0.12  # relative to canvas width

class DesignPlan(BaseModel):
    reasoning: str  # Why this plan was chosen
    background: BackgroundPlan
    texts: List[TextBlockPlan] = []
    logoPlacement: LogoPlacementPlan = LogoPlacementPlan()
