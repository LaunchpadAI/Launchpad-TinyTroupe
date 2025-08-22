#!/usr/bin/env python3
"""
Test script for image integration with TinyTroupe

This script tests the image handling functionality we've implemented.
"""

import sys
import os
import base64
import json

# Add the TinyTroupe package to the path
sys.path.insert(0, "../../packages/tinytroupe-original")

def test_model_image_support():
    """Test that our StimulusConfig model supports images"""
    print("🧪 Testing StimulusConfig with images...")
    
    try:
        from src.models.simulation import StimulusConfig
        
        # Create stimulus without images
        stimulus1 = StimulusConfig(
            type="property",
            content="What do you think of this luxury estate?"
        )
        print(f"✅ Basic stimulus: {stimulus1.type}")
        
        # Create stimulus with images
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        stimulus2 = StimulusConfig(
            type="property",
            content="What do you think of this luxury estate?",
            images=[f"data:image/png;base64,{test_image_b64}"]
        )
        print(f"✅ Image stimulus: {len(stimulus2.images)} images")
        
        return True
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def test_openai_utils_image_handling():
    """Test the multimodal message conversion"""
    print("\n🧪 Testing OpenAI utils image handling...")
    
    try:
        import tinytroupe.openai_utils as openai_utils
        
        # Create a test client
        client = openai_utils.OpenAIClient()
        
        # Test message with images
        test_messages = [
            {
                "role": "user",
                "content": "What do you see in this image?",
                "images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="]
            }
        ]
        
        # Test the conversion
        converted = client._convert_to_multimodal_if_needed(test_messages)
        
        # Check that it was converted to multimodal format
        if isinstance(converted[0]["content"], list):
            print("✅ Message converted to multimodal format")
            print(f"   Content parts: {len(converted[0]['content'])}")
            return True
        else:
            print("❌ Message was not converted to multimodal format")
            return False
            
    except Exception as e:
        print(f"❌ OpenAI utils test failed: {e}")
        return False

def test_simulation_service_stimulus():
    """Test the simulation service stimulus preparation"""
    print("\n🧪 Testing simulation service stimulus preparation...")
    
    try:
        from src.services.simulation_service import SimulationService
        from src.models.simulation import StimulusConfig
        
        service = SimulationService()
        
        # Test stimulus without images
        stimulus1 = StimulusConfig(
            type="property",
            content="What do you think of this property?"
        )
        message1 = service._prepare_stimulus_message(stimulus1)
        print(f"✅ Text-only stimulus: {len(message1)} chars")
        
        # Test stimulus with images
        stimulus2 = StimulusConfig(
            type="property", 
            content="What do you think of this property?",
            images=["data:image/png;base64,test1", "data:image/png;base64,test2"]
        )
        message2 = service._prepare_stimulus_message(stimulus2)
        print(f"✅ Image stimulus: {len(message2)} chars")
        
        if "2 property images" in message2:
            print("   Correctly references multiple images")
            return True
        else:
            print("   ❌ Does not reference images correctly")
            return False
            
    except Exception as e:
        print(f"❌ Simulation service test failed: {e}")
        return False

def main():
    print("🚀 TinyTroupe Image Integration Test")
    print("=" * 50)
    
    tests = [
        test_model_image_support,
        test_openai_utils_image_handling,
        test_simulation_service_stimulus
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All basic image integration tests passed!")
        print("\n📋 Next steps:")
        print("   1. Test the image upload endpoint")
        print("   2. Add frontend image upload UI")
        print("   3. Test complete image flow with real property images")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())