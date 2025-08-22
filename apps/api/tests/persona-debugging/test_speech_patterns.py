#!/usr/bin/env python3
"""
Quick test to verify speech patterns are working
"""
import requests
import json
import time

def test_tony_parker_speech():
    """Test Tony Parker's authentic speech patterns"""
    
    url = "http://localhost:8000/api/v1/simulate/focus-group"
    
    # Simple test with just Tony Parker
    test_data = {
        "participants": {
            "mode": "from_agent",
            "specifications": ["tony_parker"]
        },
        "stimulus": {
            "type": "property_evaluation", 
            "content": "What do you honestly think about this $10 million property? Just give me your gut reaction."
        },
        "simulation_type": "focus_group",
        "interaction_config": {
            "rounds": 1,
            "time_limit_minutes": 5
        },
        "extraction_config": {
            "extract_results": False
        }
    }
    
    print("Testing Tony Parker's authentic speech patterns...")
    print("Looking for: 'you know', 'I mean', 'Here's the thing', 'man', etc.")
    
    response = requests.post(url, json=test_data)
    
    if response.status_code == 200:
        result = response.json()
        interactions = result.get("interactions", [])
        
        tony_responses = []
        for interaction in interactions:
            if "Tony Parker" in interaction.get("agent", ""):
                content = interaction.get("content", "")
                tony_responses.append(content)
                print(f"\nTony Parker: {content}")
        
        # Check for speech patterns
        all_text = " ".join(tony_responses).lower()
        
        patterns_found = []
        pattern_checks = [
            ("verbal_tic", "you know", "you know" in all_text),
            ("verbal_tic", "i mean", "i mean" in all_text), 
            ("verbal_tic", "man", " man" in all_text or all_text.endswith("man")),
            ("verbal_tic", "for sure", "for sure" in all_text),
            ("opening_phrase", "here's the thing", "here's the thing" in all_text),
            ("opening_phrase", "i'll tell you what", "i'll tell you what" in all_text),
            ("opening_phrase", "the way i see it", "the way i see it" in all_text),
            ("cultural_marker", "france/french", "france" in all_text or "french" in all_text),
            ("team_reference", "spurs", "spurs" in all_text),
            ("team_reference", "pop", " pop " in all_text or "coach" in all_text)
        ]
        
        for pattern_type, pattern_name, found in pattern_checks:
            if found:
                patterns_found.append(f"{pattern_type}: '{pattern_name}'")
        
        print(f"\n=== SPEECH PATTERN ANALYSIS ===")
        if patterns_found:
            print(f"✅ Authentic patterns detected: {', '.join(patterns_found)}")
            print("SUCCESS: Tony Parker is using his authentic speech patterns!")
        else:
            print("❌ No authentic speech patterns detected")
            print("ISSUE: Tony Parker is still speaking too formally/generically")
            
    else:
        print(f"Error {response.status_code}: {response.text}")

if __name__ == "__main__":
    test_tony_parker_speech()