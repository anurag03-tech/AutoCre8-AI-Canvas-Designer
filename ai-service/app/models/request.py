# app/models/request.py

from pydantic import BaseModel
from typing import List, Optional
from app.models.canvas import CanvasData

class GalleryImage(BaseModel):
    fileId: str
    name: str
    url: str
    thumbnail: Optional[str] = None

class ImproveDesignRequest(BaseModel):
    userId: str
    canvasId: str
    projectId: str
    brandId: Optional[str] = None
    canvasData: CanvasData
    canvasScreenshot: Optional[str] = None 
    galleryImages: List[GalleryImage] = []
    userPrompt: str

class ImproveDesignResponse(BaseModel):
    success: bool
    canvasData: CanvasData
    message: str