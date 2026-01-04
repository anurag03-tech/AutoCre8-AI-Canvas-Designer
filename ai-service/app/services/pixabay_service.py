# app/services/pixabay_service.py 

import os
import httpx
from typing import List, Optional
from app.models.image import PixabayImage


class PixabayService:
    """Search Pixabay with SSL fix"""
    
    def __init__(self):
        self.api_key = os.getenv("PIXABAY_API_KEY")
        self.base_url = "https://pixabay.com/api/"
    
    async def search_images(
        self,
        query: str,
        image_type: str = "all",
        per_page: int = 8,
        min_width: int = 800,
        min_height: int = 600,
    ) -> List[PixabayImage]:
        """Search Pixabay"""
        
        if not self.api_key:
            print("⚠️  PIXABAY_API_KEY not set")
            return []
        
        params = {
            "key": self.api_key,
            "q": query,
            "image_type": image_type,
            "per_page": min(per_page, 20),
            "min_width": min_width,
            "min_height": min_height,
            "safesearch": "true",
            "order": "popular",
        }
        
        try:
            # ✅ FIX: Use verify=False to bypass SSL issues
            async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
            
            images = []
            for hit in data.get("hits", []):
                # Use direct URLs from API
                images.append(PixabayImage(
                    id=hit["id"],
                    preview_url=hit["previewURL"],
                    large_url=hit["largeImageURL"],  # Direct URL
                    full_url=hit.get("largeImageURL", hit["webformatURL"]),
                    width=hit["imageWidth"],
                    height=hit["imageHeight"],
                    tags=hit["tags"].split(", "),
                    views=hit["views"],
                    downloads=hit["downloads"],
                ))
            
            print(f"✅ Pixabay: '{query}' ({image_type}) → {len(images)} results")
            return images
            
        except Exception as e:
            print(f"❌ Pixabay error: {e}")
            return []
    
    async def search_smart(
        self,
        theme: str,
        brand_colors: Optional[List[str]] = None,
        canvas_size: tuple = (1080, 1080),
        prefer_vectors: bool = True,
    ) -> List[PixabayImage]:
        """Smart search"""
        
        keywords = self._extract_keywords(theme)
        query = " ".join(keywords[:3])
        
        print(f"🔍 Smart query: '{query}'")
        
        if prefer_vectors:
            results = await self.search_images(query, "vector", 8, 800, 600)
            if len(results) >= 3:
                return results
            
            print("   Trying illustrations...")
            illustrations = await self.search_images(query, "illustration", 8, 800, 600)
            results.extend(illustrations)
            if len(results) >= 3:
                return results
        
        print("   Trying photos...")
        return await self.search_images(query, "photo", 8, 1920, 1080)
    
    def _extract_keywords(self, description: str) -> List[str]:
        """Extract keywords"""
        stopwords = {
            "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "from", "as", "is", "was", "are", "be", "been",
            "being", "have", "has", "had", "do", "does", "did", "will", "would",
            "should", "could", "may", "might", "can", "that", "this", "these",
            "those", "it", "its", "which", "what", "who", "when", "where", "why",
            "how", "showcases", "featuring", "possibly", "vibrant", "inviting",
            "beautifully", "visually", "appealing", "presented", "arranged",
            "atmosphere", "background", "image", "setup", "cozy", "interior",
            "shop", "our", "drinking"
        }
        
        words = description.lower().replace(",", " ").replace(".", " ").split()
        keywords = [w for w in words if len(w) > 2 and w not in stopwords]
        return keywords[:3] if keywords else ["design"]


pixabay_service = PixabayService()