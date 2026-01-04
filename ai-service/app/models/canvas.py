# app/models/canvas.py
from pydantic import BaseModel
from typing import List, Any, Optional

class CanvasData(BaseModel):
    version: Optional[str] = "5.3.0"
    objects: List[Any] = []
    background: Optional[str] = "#ffffff"
    width: int
    height: int
