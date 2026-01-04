# ai-service/app/models/brand.py

from pydantic import BaseModel
from typing import List, Optional

class BrandIdentity(BaseModel):
    id: str
    name: str
    primaryColor: str
    secondaryColor: Optional[str] = None
    accentColor: Optional[str] = None
    preferredFonts: List[str] = []
    logoUrls: List[str] = []
    description: Optional[str] = None
