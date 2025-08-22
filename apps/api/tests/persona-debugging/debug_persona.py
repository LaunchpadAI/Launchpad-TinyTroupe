#!/usr/bin/env python3
"""
Debug script to check persona JSON structure
"""
import json
import sys
import os
sys.path.append('/Users/mike/GitHub/Launchpad-TinyTroupe/packages/tinytroupe-original')

from tinytroupe.agent import TinyPerson

def debug_persona_structure():
    """Check the actual persona structure being used"""
    
    # Load Tony Parker's persona file
    agent_file = "/Users/mike/GitHub/Launchpad-TinyTroupe/apps/api/agents/real-athletes/tony_parker_tinytroupe.agent.json"
    
    print("=== Loading Tony Parker's persona file ===")
    with open(agent_file, 'r') as f:
        agent_spec = json.load(f)
    
    print("Raw persona structure:")
    print(json.dumps(agent_spec["persona"], indent=2))
    
    print("\n=== Checking speech_patterns location ===")
    if "personality" in agent_spec["persona"]:
        if "speech_patterns" in agent_spec["persona"]["personality"]:
            print("✅ Found speech_patterns in personality.speech_patterns")
            speech_patterns = agent_spec["persona"]["personality"]["speech_patterns"]
            print("Speech patterns:")
            for key, value in speech_patterns.items():
                print(f"  {key}: {value}")
        else:
            print("❌ No speech_patterns found in personality section")
    else:
        print("❌ No personality section found")
    
    print("\n=== Creating TinyPerson instance ===")
    try:
        # Set basic config to avoid OpenAI calls
        os.environ["OPENAI_API_KEY"] = "dummy"
        
        agent = TinyPerson.load_spec(agent_file)
        print(f"✅ Successfully created TinyPerson: {agent.name}")
        
        # Check the internal persona structure
        print("\nInternal _persona structure keys:")
        print(list(agent._persona.keys()))
        
        if "personality" in agent._persona:
            print("Personality keys:")
            print(list(agent._persona["personality"].keys()))
            
            if "speech_patterns" in agent._persona["personality"]:
                print("✅ speech_patterns preserved in TinyPerson._persona")
                print("Verbal tics:", agent._persona["personality"]["speech_patterns"]["verbal_tics"])
            else:
                print("❌ speech_patterns lost in TinyPerson._persona")
        
    except Exception as e:
        print(f"❌ Error creating TinyPerson: {e}")

if __name__ == "__main__":
    debug_persona_structure()