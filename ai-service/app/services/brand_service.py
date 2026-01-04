# app/services/brand_service.py

from typing import Optional
from bson import ObjectId
from app.services.mongo_client import get_database
from app.models.brand import BrandIdentity


class BrandService:
    
    async def get_brand_identity(self, brand_id: str) -> Optional[BrandIdentity]:
        """
        Fetch brand from MongoDB with comprehensive data extraction
        """
        db = get_database()
        brands_collection = db["brands"]
        
        try:
            if not ObjectId.is_valid(brand_id):
                print(f"❌ Invalid brand ID: {brand_id}")
                return None
            
            oid = ObjectId(brand_id)
            brand_doc = await brands_collection.find_one({"_id": oid})
            
            if not brand_doc:
                print(f"⚠️ Brand not found: {brand_id}")
                return None
            
            print(f"✅ Found brand: {brand_doc.get('name')}")
            
            # Extract guidelines
            guidelines = brand_doc.get("guidelines") or {}
            colors = guidelines.get("colors") or {}
            fonts = guidelines.get("fonts") or {}
            
            # Get accent color (can be list or string)
            accent_value = colors.get("accent")
            accent_color = None
            if isinstance(accent_value, list) and accent_value:
                accent_color = accent_value[0]
            elif isinstance(accent_value, str):
                accent_color = accent_value
            else:
                accent_color = "#ec4899"
            
            # Get preferred fonts
            preferred_fonts = []
            if isinstance(fonts.get("suggested"), list):
                preferred_fonts = fonts["suggested"]
            else:
                preferred_fonts = ["Inter", "Arial", "Helvetica"]
            
            # Get logo URLs
            logo_urls = []
            logo_url = brand_doc.get("logoUrl")
            if isinstance(logo_url, str) and logo_url:
                logo_urls = [logo_url]
            
            brand_identity = BrandIdentity(
                id=str(brand_doc["_id"]),
                name=brand_doc.get("name", "Unnamed Brand"),
                primaryColor=colors.get("primary", "#3b82f6"),
                secondaryColor=colors.get("secondary", "#8b5cf6"),
                accentColor=accent_color,
                preferredFonts=preferred_fonts,
                logoUrls=logo_urls,
                description=brand_doc.get("description", ""),
            )
            
            return brand_identity
            
        except Exception as e:
            print(f"❌ Error fetching brand: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def get_default_brand(self, project_id: str) -> BrandIdentity:
        """Return default brand when none exists"""
        return BrandIdentity(
            id=project_id,
            name="Default Design System",
            primaryColor="#3b82f6",
            secondaryColor="#8b5cf6",
            accentColor="#ec4899",
            preferredFonts=["Inter", "Arial", "Helvetica", "sans-serif"],
            logoUrls=[],
            description="Professional default design system",
        )


# Singleton
brand_service = BrandService()