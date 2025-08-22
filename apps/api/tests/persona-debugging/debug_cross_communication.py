#!/usr/bin/env python3
"""
Debug cross-communication behavior - why is Wayne responding twice when toggle is OFF?
"""
import requests
import json

def test_cross_communication_bug():
    """Test why Wayne Gretzky responds twice when cross-communication is OFF"""
    
    url = "http://localhost:8000/api/v1/simulate/focus-group"
    
    # Test with cross-communication explicitly OFF
    test_data = {
        "participants": {
            "mode": "from_agent",
            "specifications": ["wayne_gretzky", "tony_parker", "brandon_mcmanus"]
        },
        "stimulus": {
            "type": "property_evaluation", 
            "content": "Quick question: What's your gut reaction to this $10M property? Just a brief opinion from each of you."
        },
        "simulation_type": "focus_group",
        "interaction_config": {
            "rounds": 1,  # Only 1 round
            "allow_cross_communication": False  # Explicitly OFF
        },
        "extraction_config": {
            "extract_results": False
        }
    }
    
    print("🔍 DEBUGGING CROSS-COMMUNICATION BUG")
    print("❌ Cross-communication: FALSE (OFF)")
    print("🔢 Rounds: 1 (should get exactly 1 response per agent)")
    print("Expected: 3 total responses (1 per agent)")
    
    response = requests.post(url, json=test_data)
    
    if response.status_code == 200:
        result = response.json()
        interactions = result.get("interactions", [])
        
        print(f"\n📊 RESULTS:")
        print(f"Total interactions: {len(interactions)}")
        
        # Count responses per agent
        response_counts = {}
        for interaction in interactions:
            agent = interaction.get("agent", "Unknown")
            response_counts[agent] = response_counts.get(agent, 0) + 1
            print(f"   {agent}: {len(interaction.get('content', ''))} chars")
        
        print(f"\n📈 RESPONSE COUNTS:")
        for agent, count in response_counts.items():
            status = "✅ CORRECT" if count == 1 else f"❌ WRONG ({count} responses)"
            print(f"   {agent}: {count} response(s) - {status}")
        
        if all(count == 1 for count in response_counts.values()):
            print(f"\n🎉 SUCCESS: All agents responded exactly once!")
        else:
            print(f"\n❌ BUG CONFIRMED: Some agents responded multiple times when cross-communication was OFF")
            
        return response_counts
        
    else:
        print(f"❌ API Error {response.status_code}: {response.text}")
        return None

if __name__ == "__main__":
    test_cross_communication_bug()