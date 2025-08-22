"""
Image upload endpoints for multimodal simulations
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import base64
import io
from PIL import Image

router = APIRouter(prefix="/api/v1/images", tags=["images"])


@router.post("/upload")
async def upload_property_images(
    files: List[UploadFile] = File(...)
):
    """
    Upload property images and convert them to base64 for use in simulations.
    Returns base64 encoded images that can be included in simulation requests.
    """
    try:
        if len(files) > 10:  # Limit number of images
            raise HTTPException(status_code=400, detail="Maximum 10 images allowed")
        
        processed_images = []
        
        for file in files:
            # Validate file type
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
            
            # Read file content
            contents = await file.read()
            
            # Validate file size (max 20MB)
            if len(contents) > 20 * 1024 * 1024:
                raise HTTPException(status_code=400, detail=f"Image {file.filename} is too large (max 20MB)")
            
            # Process image with PIL to ensure it's valid and optimize
            try:
                image = Image.open(io.BytesIO(contents))
                
                # Convert to RGB if necessary (for JPEG compatibility)
                if image.mode in ('RGBA', 'P'):
                    image = image.convert('RGB')
                
                # Resize if too large (max 2048x2048 for OpenAI vision)
                max_size = 2048
                if image.width > max_size or image.height > max_size:
                    image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Convert back to bytes
                output = io.BytesIO()
                image.save(output, format='JPEG', quality=85, optimize=True)
                image_bytes = output.getvalue()
                
                # Encode to base64
                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                
                processed_images.append({
                    "filename": file.filename,
                    "size": len(image_bytes),
                    "dimensions": f"{image.width}x{image.height}",
                    "base64": f"data:image/jpeg;base64,{base64_image}"
                })
                
            except Exception as img_error:
                raise HTTPException(status_code=400, detail=f"Error processing image {file.filename}: {str(img_error)}")
        
        return {
            "status": "success",
            "images_processed": len(processed_images),
            "images": processed_images
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/validate")
async def validate_base64_images(images: List[str]):
    """
    Validate base64 encoded images before using them in simulations.
    """
    try:
        validated_images = []
        
        for i, img_data in enumerate(images):
            try:
                # Handle data URL format
                if img_data.startswith('data:image/'):
                    # Extract base64 part
                    header, data = img_data.split(',', 1)
                    img_bytes = base64.b64decode(data)
                else:
                    # Assume raw base64
                    img_bytes = base64.b64decode(img_data)
                
                # Validate with PIL
                image = Image.open(io.BytesIO(img_bytes))
                
                validated_images.append({
                    "index": i,
                    "valid": True,
                    "format": image.format,
                    "size": len(img_bytes),
                    "dimensions": f"{image.width}x{image.height}"
                })
                
            except Exception as e:
                validated_images.append({
                    "index": i,
                    "valid": False,
                    "error": str(e)
                })
        
        return {
            "status": "success",
            "total_images": len(images),
            "valid_images": sum(1 for img in validated_images if img["valid"]),
            "validation_results": validated_images
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")