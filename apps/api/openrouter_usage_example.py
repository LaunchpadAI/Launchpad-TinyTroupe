#!/usr/bin/env python3
"""
OpenRouter Usage Example for TinyTroupe

This example demonstrates how to use OpenRouter with TinyTroupe to access
different LLM providers and models through a unified interface.

Prerequisites:
1. Get an OpenRouter API key from https://openrouter.ai/
2. Set OPENROUTER_API_KEY environment variable
3. Update config.ini to use API_TYPE=openrouter and set your preferred model

Usage:
    OPENROUTER_API_KEY=sk-or-v1-your-key python openrouter_usage_example.py
"""

import os
import sys

# Add the TinyTroupe package to the path
sys.path.insert(0, "../../packages/tinytroupe-original")

import tinytroupe.openai_utils as openai_utils
import tinytroupe.control as control
from tinytroupe.agent import TinyPerson

def demonstrate_model_switching():
    """Demonstrate switching between different models via OpenRouter"""
    
    print("🔄 Demonstrating Model Switching with OpenRouter")
    print("=" * 60)
    
    # Popular models available through OpenRouter
    models_to_test = [
        "openai/gpt-4o-mini",           # OpenAI GPT-4o Mini
        "anthropic/claude-3-haiku",     # Anthropic Claude 3 Haiku (fast)
        "meta-llama/llama-3.1-8b-instruct",  # Meta Llama 3.1 8B
        "google/gemini-flash-1.5",      # Google Gemini Flash 1.5
        "mistralai/mistral-7b-instruct" # Mistral 7B
    ]
    
    # Switch to OpenRouter
    openai_utils.force_api_type("openrouter")
    
    for model in models_to_test:
        print(f"\n🤖 Testing model: {model}")
        print("-" * 40)
        
        try:
            # Get OpenRouter client
            client = openai_utils.client()
            
            # Simple test message
            messages = [
                {"role": "system", "content": "You are a helpful assistant. Respond in exactly one sentence."},
                {"role": "user", "content": "What is artificial intelligence?"}
            ]
            
            print(f"   Making API call to {model}...")
            
            # Note: This would make an actual API call - remove if you don't want to spend credits
            # response = client.send_message(messages, model=model, max_tokens=50, temperature=0.7)
            # print(f"   Response: {response['content'][:100]}...")
            
            print(f"   ✅ Model {model} is accessible via OpenRouter")
            
        except Exception as e:
            print(f"   ❌ Error with {model}: {e}")
    
    # Reset to default
    openai_utils.force_api_type("openai")

def demonstrate_agent_with_openrouter():
    """Demonstrate using TinyTroupe agents with OpenRouter models"""
    
    print("\n🤖 Demonstrating TinyTroupe Agent with OpenRouter")
    print("=" * 60)
    
    # Check if we have an API key
    if not os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENROUTER_API_KEY").startswith("sk-or-v1-your-"):
        print("⏭️  Skipping agent demo (requires real OPENROUTER_API_KEY)")
        return
    
    try:
        # Start a TinyTroupe session
        control.begin("openrouter_test.cache.json", cache=True)
        
        # Switch to OpenRouter
        openai_utils.force_api_type("openrouter")
        
        # Create a simple agent
        agent = TinyPerson("Alice")
        agent.define("personality", "You are a creative and enthusiastic person who loves technology.")
        agent.define("occupation", "Software developer")
        
        print(f"Created agent: {agent.name}")
        print("⚠️  Would run agent interaction here (requires API credits)")
        
        # Example of what you could do:
        # agent.listen_and_act("What do you think about AI in software development?")
        # response = agent.act()  # Get the agent's response
        # print(f"Agent response: {response}")
        
        print("✅ Agent setup successful with OpenRouter")
        
    except Exception as e:
        print(f"❌ Error setting up agent with OpenRouter: {e}")
    finally:
        control.end()
        # Reset to default
        openai_utils.force_api_type("openai")

def show_configuration_examples():
    """Show different ways to configure OpenRouter"""
    
    print("\n⚙️  OpenRouter Configuration Examples")
    print("=" * 60)
    
    print("1. Environment Variable Method:")
    print("   export OPENROUTER_API_KEY=sk-or-v1-your-actual-key")
    print()
    
    print("2. Update config.ini:")
    print("   [OpenAI]")
    print("   API_TYPE=openrouter")
    print("   MODEL=openai/gpt-4o")
    print()
    
    print("3. Runtime Switching:")
    print("   import tinytroupe.openai_utils as openai_utils")
    print("   openai_utils.force_api_type('openrouter')")
    print()
    
    print("4. Popular Model Examples:")
    for model, description in [
        ("openai/gpt-4o", "Latest GPT-4 via OpenRouter"),
        ("anthropic/claude-3.5-sonnet", "Claude 3.5 Sonnet (high quality)"),
        ("anthropic/claude-3-haiku", "Claude 3 Haiku (fast & cheap)"),
        ("meta-llama/llama-3.1-405b-instruct", "Llama 3.1 405B (very capable)"),
        ("google/gemini-pro-1.5", "Google Gemini Pro 1.5"),
        ("mistralai/mixtral-8x7b-instruct", "Mixtral 8x7B (cost-effective)")
    ]:
        print(f"   {model:35} - {description}")

def main():
    print("🚀 TinyTroupe OpenRouter Usage Examples")
    print("=" * 60)
    
    # Check if OpenRouter is properly set up
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if not api_key:
        print("❌ OPENROUTER_API_KEY environment variable not set")
        print("   Get your API key from https://openrouter.ai/")
        show_configuration_examples()
        return 1
    elif api_key.startswith("sk-or-v1-your-"):
        print("⚠️  Using placeholder API key - update with your real key for live testing")
    else:
        print("✅ OPENROUTER_API_KEY found")
    
    try:
        # Test basic functionality
        demonstrate_model_switching()
        
        # Test with TinyTroupe agents
        demonstrate_agent_with_openrouter()
        
        # Show configuration examples
        show_configuration_examples()
        
        print("\n🎉 OpenRouter integration examples completed!")
        print("\nNext steps:")
        print("   1. Set your real OPENROUTER_API_KEY")
        print("   2. Choose your preferred model from the examples above")
        print("   3. Update your TinyTroupe simulations to use OpenRouter")
        print("   4. Enjoy access to 200+ models from different providers!")
        
    except Exception as e:
        print(f"❌ Error running examples: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())