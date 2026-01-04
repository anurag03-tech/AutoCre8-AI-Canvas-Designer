# app/services/imagekit_service.py

"""
ImageKit.io integration for image uploads and transformations
"""

import os
import httpx
import base64
import time
from typing import Optional, List, Dict, Any
from app.models.image import ImageKitImage


class ImageKitService:
    """ImageKit.io service for uploads and transformations"""
    
    def __init__(self):
        self.private_key = os.getenv("IMAGEKIT_PRIVATE_KEY")
        self.public_key = os.getenv("IMAGEKIT_PUBLIC_KEY")
        self.url_endpoint = os.getenv("IMAGEKIT_URL_ENDPOINT")
        self.upload_url = "https://upload.imagekit.io/api/v1/files/upload"
    
    async def upload_from_url(
        self,
        image_url: str,
        project_id: str,
        file_name: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> Optional[ImageKitImage]:
        """
        Upload external image to ImageKit
        
        Args:
            image_url: URL of image to upload
            project_id: Project ID for folder organization
            file_name: Custom filename
            tags: Tags for organization
        
        Returns:
            ImageKitImage with URL for transformations
        """
        
        if not all([self.private_key, self.public_key, self.url_endpoint]):
            print("⚠️  ImageKit credentials not configured")
            return None
        
        try:
            # Fetch image
            print(f"📥 Fetching image from: {image_url[:60]}...")
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(image_url)
                response.raise_for_status()
                image_data = response.content
                print(f"✅ Fetched image ({response} bytes)")
            
            # Convert to base64
            base64_image = base64.b64encode(image_data).decode()
            
            # Prepare upload
            folder = f"/projects/{project_id}/images"
            final_filename = file_name or f"image-{int(time.time())}.jpg"
            
            upload_data = {
                "file": base64_image,
                "fileName": final_filename,
                "folder": folder,
                "tags": ",".join(tags or ["canvas-image", project_id]),
            }
            
            # Upload to ImageKit
            print(f"📤 Uploading to ImageKit: {folder}/{final_filename}")
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.upload_url,
                    data=upload_data,
                    auth=(self.private_key, ""),
                )
                response.raise_for_status()
                result = response.json()
            
            imagekit_image = ImageKitImage(
                file_id=result["fileId"],
                name=result["name"],
                url=result["url"],
                thumbnail=result.get("thumbnailUrl"),
                file_path=result["filePath"],
                project_id=project_id,
            )
            
            print(f"✅ Uploaded to ImageKit: {imagekit_image.url}")
            return imagekit_image
            
        except httpx.HTTPStatusError as e:
            print(f"❌ ImageKit upload error: {e.response.status_code}")
            print(f"   Response: {e.response.text}")
            return None
        except Exception as e:
            print(f"❌ Upload error: {e}")
            return None
    
    def remove_background(self, imagekit_url: str) -> str:
        """
        Apply background removal transformation
        
        Example:
            Input:  https://ik.imagekit.io/.../image.jpg
            Output: https://ik.imagekit.io/.../tr:e-bg-remove/image.jpg
        """
        
        if not self.url_endpoint:
            return imagekit_url
        
        try:
            # Parse ImageKit URL
            parts = imagekit_url.split("/")
            
            # Find endpoint position
            endpoint_part = self.url_endpoint.rstrip("/").split("/")[-1]
            
            if endpoint_part in parts:
                endpoint_index = parts.index(endpoint_part)
                
                # Insert transformation after endpoint
                transformation = "tr:e-bg-remove"
                parts.insert(endpoint_index + 1, transformation)
                
                return "/".join(parts)
            else:
                print("⚠️  Could not parse ImageKit URL for transformation")
                return imagekit_url
                
        except Exception as e:
            print(f"❌ Error applying bg removal: {e}")
            return imagekit_url
    
    def apply_transformations(
        self,
        imagekit_url: str,
        transformations: Dict[str, Any],
    ) -> str:
        """
        Apply multiple ImageKit transformations
        
        Example:
            transformations = {
                "width": 1080,
                "height": 1080,
                "blur": 10,
                "quality": 90,
            }
        """
        
        if not self.url_endpoint or not transformations:
            return imagekit_url
        
        try:
            # Map transformations to ImageKit format
            mapping = {
                "width": "w",
                "height": "h",
                "blur": "bl",
                "quality": "q",
                "sharpen": "e-sharpen",
                "grayscale": "e-grayscale",
            }
            
            tr_params = []
            for key, value in transformations.items():
                if key in mapping:
                    if key in ["sharpen", "grayscale"]:
                        tr_params.append(mapping[key])
                    else:
                        tr_params.append(f"{mapping[key]}-{value}")
            
            if not tr_params:
                return imagekit_url
            
            transformation = "tr:" + ",".join(tr_params)
            
            # Parse and insert transformation
            parts = imagekit_url.split("/")
            endpoint_part = self.url_endpoint.rstrip("/").split("/")[-1]
            
            if endpoint_part in parts:
                endpoint_index = parts.index(endpoint_part)
                parts.insert(endpoint_index + 1, transformation)
                return "/".join(parts)
            
            return imagekit_url
            
        except Exception as e:
            print(f"❌ Error applying transformations: {e}")
            return imagekit_url


# Singleton
imagekit_service = ImageKitService()