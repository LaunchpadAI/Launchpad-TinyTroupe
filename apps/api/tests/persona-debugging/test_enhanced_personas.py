#!/usr/bin/env python3
"""
Test script for enhanced persona authenticity
"""
import requests
import json

def test_enhanced_persona():
    """Test the enhanced persona with speech patterns"""
    
    # API endpoint
    url = "http://localhost:8000/api/v1/simulate/focus-group"
    
    # Test with enhanced persona
    test_data = {
        "agents": ["tony_parker_enhanced"],  # Our enhanced persona with speech_patterns
        "stimulus": {
            "type": "property_evaluation",
            "content": """Property Overview:
- Address: 55 Fagan Dr, Hillsborough, CA 94010
- Asking Price: $10,000,000
- Size: 6,818 sq ft
- Bedrooms: 7 | Bathrooms: 5
- Year Built: 1917
- Style: Classic
- Key Features: Historic charm, Mature trees, Media room, Pool & spa
- Neighborhood: Hillsborough

What's your honest first impression of this place? Don't hold back."""
        },
        "simulation_type": "focus_group",
        "interaction_config": {
            "rounds": 2,
            "time_limit_minutes": 10
        },
        "extraction_config": {
            "extract_results": True,
            "extraction_objective": "Extract authentic reactions and speech patterns",
            "result_type": "structured"
        }
    }
    
    print("Testing enhanced persona authenticity...")
    print(f"Request: {json.dumps(test_data, indent=2)}")
    
    response = requests.post(url, json=test_data)
    
    if response.status_code == 200:
        result = response.json()
        print("\n=== ENHANCED PERSONA RESPONSE ===")
        
        # Look for authentic speech patterns in the interactions
        interactions = result.get("interactions", [])
        for interaction in interactions:
            if interaction.get("agent") == "Tony Parker":
                content = interaction.get("content", "")
                print(f"\nTony Parker: {content}")
                
                # Check for speech patterns
                patterns_found = []
                if "you know" in content.lower():
                    patterns_found.append("verbal_tic: 'you know'")
                if "i mean" in content.lower():
                    patterns_found.append("verbal_tic: 'i mean'")
                if "here's the thing" in content.lower():
                    patterns_found.append("opening_phrase: 'here's the thing'")
                if "pop" in content.lower():
                    patterns_found.append("team_reference: 'Pop'")
                    
                if patterns_found:
                    print(f"  ✅ Speech patterns detected: {', '.join(patterns_found)}")
                else:
                    print("  ❌ No distinctive speech patterns detected")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_enhanced_persona()