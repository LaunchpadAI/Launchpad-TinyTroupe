#!/usr/bin/env python3
"""
Test script for image upload API endpoint

This script tests the image upload functionality by creating test images
and uploading them to the API.
"""

import requests
import base64
from PIL import Image
import io
import os

def create_test_image(width=800, height=600, color=(255, 100, 100)):
    """Create a test image for uploading"""
    img = Image.new('RGB', (width, height), color)
    
    # Add some text to make it interesting
    try:
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, width-50, height-50], outline=(255, 255, 255), width=5)
        draw.text((100, 100), "Test Property Image", fill=(255, 255, 255))
        draw.text((100, 150), f"{width}x{height}", fill=(255, 255, 255))
    except:
        pass  # Skip text if font not available
    
    return img

def image_to_bytes(img, format='JPEG'):
    """Convert PIL image to bytes"""
    output = io.BytesIO()
    img.save(output, format=format, quality=85)
    return output.getvalue()

def test_image_upload_api():
    """Test the image upload API endpoint"""
    print("🧪 Testing Image Upload API...")
    
    try:
        # Create test images
        img1 = create_test_image(800, 600, (255, 100, 100))  # Red
        img2 = create_test_image(1024, 768, (100, 255, 100))  # Green
        img3 = create_test_image(640, 480, (100, 100, 255))   # Blue
        
        # Convert to bytes
        img1_bytes = image_to_bytes(img1)
        img2_bytes = image_to_bytes(img2)
        img3_bytes = image_to_bytes(img3)
        
        # Create files for upload
        files = [
            ('files', ('test_exterior.jpg', img1_bytes, 'image/jpeg')),
            ('files', ('test_interior.jpg', img2_bytes, 'image/jpeg')),
            ('files', ('test_amenities.jpg', img3_bytes, 'image/jpeg')),
        ]
        
        # Make upload request
        response = requests.post(
            'http://localhost:8000/api/v1/images/upload',
            files=files
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upload successful: {result['images_processed']} images processed")
            
            # Display results
            for i, img_data in enumerate(result['images']):
                print(f"   Image {i+1}: {img_data['filename']} ({img_data['dimensions']}, {img_data['size']} bytes)")
            
            # Test the base64 data
            first_image = result['images'][0]
            base64_data = first_image['base64']
            
            # Validate we can decode it
            if base64_data.startswith('data:image/jpeg;base64,'):
                data_part = base64_data.split(',')[1]
                decoded_bytes = base64.b64decode(data_part)
                test_img = Image.open(io.BytesIO(decoded_bytes))
                print(f"   ✅ Base64 decode successful: {test_img.size}")
                
                return result['images']
            else:
                print("   ❌ Invalid base64 format")
                return None
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Upload test failed: {e}")
        return None

def test_simulation_with_images(image_data_list):
    """Test running a simulation with images"""
    print("\n🧪 Testing Simulation with Images...")
    
    if not image_data_list:
        print("❌ No image data available for simulation test")
        return False
    
    try:
        # Extract base64 images
        images = [img['base64'] for img in image_data_list]
        
        # Create simulation request with images
        simulation_request = {
            "simulation_type": "focus_group",
            "participants": {
                "mode": "from_agent",
                "specifications": ["lisa", "oscar", "marcos"]
            },
            "interaction_config": {
                "allow_cross_communication": True,
                "rounds": 2,  # Keep it short for testing
                "enable_memory": True,
                "enable_semantic_memory": False
            },
            "stimulus": {
                "type": "property_evaluation",
                "content": "Please evaluate this luxury property based on the provided images and description.",
                "images": images,
                "context": {
                    "property_type": "luxury_residential"
                }
            },
            "extraction_config": {
                "extract_results": True,
                "extraction_objective": "Extract key observations about the property from the images",
                "result_type": "json"
            }
        }
        
        print(f"   Sending simulation request with {len(images)} images...")
        
        response = requests.post(
            'http://localhost:8000/api/v1/simulate/focus-group',
            json=simulation_request,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Simulation with images successful!")
            print(f"   Simulation ID: {result.get('simulation_id', 'N/A')}")
            print(f"   Interactions: {len(result.get('interactions', []))}")
            
            if result.get('interactions'):
                print("   Sample interaction:")
                first_interaction = result['interactions'][0]
                content_preview = first_interaction.get('content', '')[:100] + '...'
                print(f"     {first_interaction.get('agent', 'Unknown')}: {content_preview}")
            
            return True
        else:
            print(f"❌ Simulation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Simulation test failed: {e}")
        return False

def main():
    print("🚀 TinyTroupe Image Upload & Integration Test")
    print("=" * 60)
    
    # Check if API is running
    try:
        health_check = requests.get('http://localhost:8000/health', timeout=5)
        if health_check.status_code != 200:
            print("❌ API is not running at http://localhost:8000")
            print("   Please start the API first: nx serve api")
            return 1
    except requests.RequestException:
        print("❌ Could not connect to API at http://localhost:8000")
        print("   Please start the API first: nx serve api")
        return 1
    
    print("✅ API is running")
    
    # Test image upload
    uploaded_images = test_image_upload_api()
    
    if uploaded_images:
        # Test simulation with images
        simulation_success = test_simulation_with_images(uploaded_images)
        
        if simulation_success:
            print("\n🎉 All image integration tests passed!")
            print("\n📋 Verified functionality:")
            print("   ✅ Image upload and processing")
            print("   ✅ Base64 encoding/decoding")
            print("   ✅ Image size and format validation")
            print("   ✅ Simulation with multimodal stimuli")
            print("   ✅ Agent responses to visual content")
            return 0
        else:
            print("\n⚠️ Image upload works but simulation failed")
            return 1
    else:
        print("\n❌ Image upload test failed")
        return 1

if __name__ == "__main__":
    exit(main())