# TinyTroupe OpenAI API Modernization 2025

This document outlines the roadmap for modernizing TinyTroupe to leverage the latest OpenAI API features available in 2025, including structured outputs, function calling, multimodal capabilities, and advanced reasoning models.

## Table of Contents
- [Current State Analysis](#current-state-analysis)
- [OpenAI API Features Reference](#openai-api-features-reference)
- [Key Enhancement Opportunities](#key-enhancement-opportunities)
- [Implementation Roadmap](#implementation-roadmap)
- [Cost & Performance Benefits](#cost--performance-benefits)
- [Technical Specifications](#technical-specifications)
- [Testing Strategy](#testing-strategy)

## Current State Analysis

### What TinyTroupe Already Has
- Basic `response_format` support for structured outputs (`tiny_person_validator.py:82`)
- Pydantic model integration (`LLMScalarWithJustificationResponse`)
- GPT-4o-mini and o3-mini model configuration
- Text-based multimodal support via `_convert_to_multimodal_if_needed()`
- Basic caching mechanisms for API calls

### What's Missing
- Strict structured outputs with `strict: true` parameter
- Function calling / tool use capabilities
- Audio and vision integration
- Batch processing for expensive operations
- Advanced reasoning model features (Responses API)
- Semantic memory with vector embeddings

## OpenAI API Features Reference

### Structured Outputs (2025)
- **Feature**: Guaranteed JSON schema compliance with `strict: true`
- **Models**: gpt-4o, gpt-4o-mini, gpt-4-0613+, gpt-3.5-turbo-0613+
- **Reliability**: 100% schema following on complex evaluations
- **APIs**: Chat Completions, Assistants, Batch API

```python
# Example usage
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Extract data"}],
    response_format={"type": "json_schema", "json_schema": schema, "strict": True}
)
```

### Function Calling (Enhanced 2025)
- **Feature**: Tool use with strict schema validation
- **Support**: Vision inputs compatible
- **Models**: All function-calling models + o3-mini, o1 with `tool_choice`
- **Reliability**: Guaranteed function schema compliance

```python
# Example usage
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather information",
            "parameters": {"type": "object", "properties": {...}, "strict": True}
        }
    }
]
```

### GPT-5 (Released August 2025) 🚀
- **Feature**: Unified reasoning, multimodal, and agentic capabilities in single model
- **Performance**: State-of-the-art across math (94.6% AIME), coding (74.9% SWE-bench), multimodal (84.2% MMMU)
- **Reasoning**: Built-in thinking with real-time router (fast vs. reasoning modes)
- **Hallucinations**: 45% fewer factual errors than GPT-4o, 80% fewer than o3 when thinking
- **Variants**: gpt-5, gpt-5-mini, gpt-5-nano, gpt-5-chat

### Reasoning Models (o3-mini)
- **Feature**: Advanced step-by-step reasoning capabilities
- **API**: Responses API for reasoning chain management
- **Performance**: 40% to 80% cache utilization improvement
- **Cost**: Lower costs with improved latency

### Multimodal Capabilities
- **GPT-4o**: Text, vision, audio in single model
- **Realtime API**: Low-latency audio interactions (232ms response time)
- **Audio**: Available in Chat Completions API (Oct 2024+)
- **Vision**: Enhanced image analysis capabilities

### Batch Processing
- **Cost Savings**: 50% discount on inputs/outputs
- **Processing**: 24-hour asynchronous processing
- **Scale**: Large-scale parallel processing
- **Caching**: Prompt caching for repeated conversations

### Embeddings & Vector Search
- **Model**: text-embedding-3-small/large
- **Features**: Semantic similarity, memory retrieval
- **Integration**: Vector databases, semantic search

## Key Enhancement Opportunities

### 1. Enhanced Structured Outputs 🎯

**Current Implementation:**
```python
# tinytroupe/validation/tiny_person_validator.py
response_format=ValidationResponse, enable_pydantic_model_return=True
```

**Enhanced Implementation:**
```python
from pydantic import BaseModel, Field
from typing import Literal, Optional

@dataclass
class TinyPersonAction(BaseModel):
    action_type: Literal["THINK", "TALK", "DONE", "REACH_OUT", "USE_TOOL"]
    target: Optional[str] = None
    content: str
    reasoning: str  # New field for explicit reasoning
    confidence: float = Field(ge=0.0, le=1.0)
    persona_consistency: float = Field(ge=0.0, le=1.0)

# In action_generator.py
response = openai_utils.client().send_message(
    messages,
    response_format=TinyPersonAction,
    strict=True,  # 100% reliability guarantee
    enable_pydantic_model_return=True
)
```

**Benefits:**
- Guaranteed schema compliance for agent actions
- More reliable persona adherence validation
- Structured reasoning outputs for better analysis

### 2. Function Calling for Agent Tools 🔧

**Enhanced Implementation:**
```python
# New: tinytroupe/tools/function_tools.py
from openai import Function
from tinytroupe.tools.tiny_tool import TinyTool

class TinyPersonWithTools(TinyPerson):
    def __init__(self, name, tools=None, **kwargs):
        super().__init__(name, **kwargs)
        self.available_functions = tools or []
    
    def _get_function_definitions(self):
        """Convert TinyTools to OpenAI function definitions"""
        functions = []
        for tool in self.available_functions:
            functions.append({
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.get_json_schema(),
                    "strict": True
                }
            })
        return functions
    
    def act(self, **kwargs):
        # Enhanced action generation with function calling
        functions = self._get_function_definitions()
        response = openai_utils.client().send_message(
            self._build_action_messages(),
            tools=functions,
            tool_choice="auto",
            strict=True
        )
        
        if response.tool_calls:
            return self._execute_tool_calls(response.tool_calls)
        else:
            return self._process_regular_action(response)
```

**Applications:**
- Agents can use calculators, web search, calendar tools
- More realistic agent behaviors with external capabilities
- Enhanced market research scenarios

### 3. Audio & Multimodal Capabilities 🎵👁️

**Enhanced Implementation:**
```python
# New: tinytroupe/agent/multimodal_person.py
class MultimodalTinyPerson(TinyPerson):
    def __init__(self, name, **kwargs):
        super().__init__(name, **kwargs)
        self.supports_audio = True
        self.supports_vision = True
    
    def listen_audio(self, audio_input):
        """Process audio input using OpenAI audio capabilities"""
        messages = [
            {
                "role": "user", 
                "content": [
                    {
                        "type": "audio",
                        "audio": {"data": audio_input, "format": "wav"}
                    }
                ]
            }
        ]
        return self._process_multimodal_input(messages)
    
    def see_image(self, image_input, prompt="What do you see?"):
        """Process visual input"""
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_input}
                    }
                ]
            }
        ]
        return self._process_multimodal_input(messages)
    
    def respond_with_audio(self, text_response):
        """Generate audio response"""
        response = openai_utils.client().send_message(
            messages=[{"role": "user", "content": text_response}],
            modalities=["text", "audio"],
            audio={"voice": "alloy", "format": "wav"}
        )
        return response.audio
```

**Applications:**
- Product testing with visual feedback
- Voice-based focus groups and interviews
- More natural agent interactions

### 4. Advanced Reasoning Integration 🧠

**Enhanced Implementation:**
```python
# Enhanced: tinytroupe/agent/reasoning.py
class ReasoningTinyPerson(TinyPerson):
    def deep_analyze(self, situation, use_reasoning_model=True):
        """Use o3-mini for complex analysis requiring step-by-step reasoning"""
        if use_reasoning_model:
            messages = self._build_reasoning_messages(situation)
            
            # Use Responses API for better reasoning chain management
            response = openai_utils.client().send_message(
                messages,
                model=config_manager.get("reasoning_model"),  # o3-mini
                reasoning_effort=config_manager.get("reasoning_effort"),
                response_format=DetailedAnalysisResponse,
                strict=True
            )
            
            return self._process_reasoning_response(response)
    
    def validate_persona_adherence_with_reasoning(self, actions):
        """Enhanced persona validation using reasoning models"""
        reasoning_prompt = f"""
        Analyze the following actions for consistency with the agent's persona.
        Agent: {self.name}
        Persona: {self._persona}
        Actions: {actions}
        
        Provide step-by-step reasoning about persona consistency.
        """
        
        return self.deep_analyze(reasoning_prompt)
```

### 5. Batch Processing for Simulations ⚡

**Enhanced Implementation:**
```python
# New: tinytroupe/environment/batch_world.py
class BatchProcessingWorld(TinyWorld):
    def run_batch_simulation(self, steps, batch_size=50):
        """Process agent actions in batches for cost efficiency"""
        batch_requests = []
        
        for step in range(steps):
            for agent in self.agents:
                batch_requests.append({
                    "custom_id": f"agent_{agent.name}_step_{step}",
                    "method": "POST",
                    "url": "/v1/chat/completions",
                    "body": {
                        "model": config_manager.get("model"),
                        "messages": agent._build_action_messages(),
                        "response_format": agent._get_response_format(),
                        "strict": True
                    }
                })
        
        # Submit batch using OpenAI Batch API (50% cost savings)
        batch_file = self._create_batch_file(batch_requests)
        batch_job = openai_utils.client().submit_batch(
            input_file_id=batch_file.id,
            endpoint="/v1/chat/completions",
            completion_window="24h"
        )
        
        return self._process_batch_results(batch_job)
    
    def _create_batch_file(self, requests):
        """Create JSONL file for batch processing"""
        import tempfile
        import json
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.jsonl', delete=False) as f:
            for request in requests:
                f.write(json.dumps(request) + '\n')
            
        return openai_utils.client().files.create(
            file=open(f.name, 'rb'),
            purpose='batch'
        )
```

### 6. Enhanced Memory with Embeddings 🧠💾

**Enhanced Implementation:**
```python
# Enhanced: tinytroupe/agent/enhanced_memory.py
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class VectorEnhancedMemory(EpisodicMemory):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.embedding_model = config_manager.get("embedding_model")
        self.memory_embeddings = {}
    
    def store_with_embeddings(self, experience):
        """Store memories with vector embeddings for better retrieval"""
        # Generate embedding for the experience content
        embedding_response = openai_utils.client().embeddings.create(
            input=experience['content'],
            model=self.embedding_model
        )
        
        embedding = embedding_response.data[0].embedding
        experience_id = len(self._content)
        
        # Store both the experience and its embedding
        super().store(experience)
        self.memory_embeddings[experience_id] = embedding
    
    def retrieve_semantically_similar(self, query, top_k=5):
        """Retrieve memories based on semantic similarity"""
        # Get query embedding
        query_response = openai_utils.client().embeddings.create(
            input=query,
            model=self.embedding_model
        )
        query_embedding = query_response.data[0].embedding
        
        # Calculate similarities
        similarities = {}
        for mem_id, mem_embedding in self.memory_embeddings.items():
            similarity = cosine_similarity(
                [query_embedding], 
                [mem_embedding]
            )[0][0]
            similarities[mem_id] = similarity
        
        # Return top-k most similar memories
        top_memories = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:top_k]
        return [self._content[mem_id] for mem_id, _ in top_memories]
    
    def consolidate_memories_with_embeddings(self):
        """Enhanced memory consolidation using semantic clustering"""
        # Group similar memories using embeddings
        # Implement clustering algorithm (K-means, hierarchical, etc.)
        pass
```

## Implementation Roadmap

### Phase 1: Foundation Improvements (2-3 weeks)
**Goal**: Upgrade core OpenAI API integration

1. **Upgrade Structured Outputs**
   - [ ] Add `strict: true` to all existing structured output calls
   - [ ] Enhance `LLMScalarWithJustificationResponse` with reasoning fields
   - [ ] Update validation modules to use strict schemas
   - [ ] Add confidence and persona consistency fields

2. **Enhanced OpenAI Client**
   - [ ] Extend `openai_utils.py` to support function calling
   - [ ] Add batch processing capabilities
   - [ ] Implement proper error handling for new API features
   - [ ] Add support for Responses API

**Files to Modify:**
- `tinytroupe/openai_utils.py`
- `tinytroupe/utils/llm.py`
- `tinytroupe/validation/tiny_person_validator.py`
- `tinytroupe/config.ini`

### Phase 2: Function Calling Integration (3-4 weeks)
**Goal**: Enable agents to use external tools

1. **Tool System Redesign**
   - [ ] Convert existing `TinyTool` classes to OpenAI function format
   - [ ] Implement `TinyPersonWithTools` base class
   - [ ] Add common tools: calculator, calendar, web search
   - [ ] Create tool result processing pipeline

2. **Action Generation Enhancement**
   - [ ] Modify `action_generator.py` to support tool calls
   - [ ] Add tool result processing to agent loops
   - [ ] Update simulation flows to handle tool interactions
   - [ ] Implement tool call validation

**Files to Create/Modify:**
- `tinytroupe/tools/function_tools.py` (new)
- `tinytroupe/agent/tool_enabled_person.py` (new)
- `tinytroupe/agent/action_generator.py`
- `tinytroupe/tools/tiny_tool.py`

### Phase 3: Multimodal Capabilities (4-5 weeks)
**Goal**: Add audio and vision support

1. **Audio Integration**
   - [ ] Create `AudioTinyPerson` class for voice interactions
   - [ ] Implement audio processing in focus groups
   - [ ] Add speech-to-text and text-to-speech capabilities
   - [ ] Create voice-based conversation examples

2. **Vision Integration**
   - [ ] Implement `VisionTinyPerson` for image analysis
   - [ ] Add product evaluation with visual feedback
   - [ ] Support document and chart analysis
   - [ ] Create visual interaction examples

**Files to Create:**
- `tinytroupe/agent/multimodal_person.py`
- `tinytroupe/agent/audio_person.py`
- `tinytroupe/agent/vision_person.py`
- `examples/Multimodal Product Testing.ipynb`
- `examples/Voice Focus Group.ipynb`

### Phase 4: Advanced Features (5-6 weeks)
**Goal**: Implement reasoning and batch processing

1. **Reasoning Model Integration**
   - [ ] Enhanced persona validation using o3-mini
   - [ ] Complex decision-making scenarios
   - [ ] Multi-step reasoning for market research
   - [ ] Reasoning chain visualization

2. **Batch Processing & Performance**
   - [ ] Implement batch simulation processing
   - [ ] Add caching optimizations
   - [ ] Performance monitoring and analytics
   - [ ] Cost tracking and optimization

**Files to Create/Modify:**
- `tinytroupe/agent/reasoning_person.py`
- `tinytroupe/environment/batch_world.py`
- `tinytroupe/utils/performance_monitor.py`
- `tinytroupe/experimentation/batch_runner.py`

### Phase 5: Research & Analytics (3-4 weeks)
**Goal**: Enhanced analysis capabilities

1. **Enhanced Analytics**
   - [ ] Vector-based memory retrieval
   - [ ] Semantic analysis of agent interactions
   - [ ] Advanced pattern recognition in simulations
   - [ ] Embedding-based agent similarity analysis

2. **Validation & Testing**
   - [ ] Comprehensive testing of new features
   - [ ] Performance benchmarking
   - [ ] Research publication preparation
   - [ ] Documentation updates

**Files to Create/Modify:**
- `tinytroupe/agent/enhanced_memory.py`
- `tinytroupe/analytics/semantic_analyzer.py`
- `tinytroupe/validation/multimodal_validator.py`
- `tests/unit/test_function_calling.py`
- `tests/scenarios/test_multimodal_scenarios.py`

## Cost & Performance Benefits

### Cost Optimizations
- **50% savings** with Batch API for large simulations
- **Cached pricing** for repeated conversations ($2.50/1M cached tokens)
- **Prompt caching** for common persona templates
- **Efficient embedding usage** for memory systems

### Performance Improvements
- **100% reliability** with strict structured outputs
- **Parallel processing** for multi-agent scenarios
- **Reduced latency** with optimized API calls (232ms audio response)
- **80% cache utilization** with Responses API

### Enhanced Capabilities
- **Multimodal agents** for richer research scenarios
- **Tool-enabled agents** for realistic behaviors
- **Advanced reasoning** for complex decision analysis
- **Semantic memory** for better context understanding

## Technical Specifications

### API Requirements
```python
# Required OpenAI Python SDK version
openai>=1.52.0

# Environment variables
OPENAI_API_KEY=sk-...
AZURE_OPENAI_KEY=...  # if using Azure
```

### Configuration Updates
```ini
# tinytroupe/config.ini additions

[OpenAI]
# Enable new features
ENABLE_STRUCTURED_OUTPUTS=True
ENABLE_FUNCTION_CALLING=True
ENABLE_MULTIMODAL=True
ENABLE_BATCH_PROCESSING=True

# New models
VISION_MODEL=gpt-4o
AUDIO_MODEL=gpt-4o
REASONING_MODEL=o3-mini

# Function calling settings
MAX_FUNCTION_CALLS_PER_TURN=5
FUNCTION_CALL_TIMEOUT=30

# Batch processing
BATCH_SIZE=50
BATCH_COMPLETION_WINDOW=24h

# Multimodal settings
AUDIO_FORMAT=wav
AUDIO_VOICE=alloy
IMAGE_DETAIL=high
```

### Schema Definitions
```python
# tinytroupe/schemas/agent_schemas.py
from pydantic import BaseModel, Field
from typing import Literal, Optional, List

class AgentAction(BaseModel):
    action_type: Literal["THINK", "TALK", "DONE", "REACH_OUT", "USE_TOOL"]
    target: Optional[str] = None
    content: str
    reasoning: str
    confidence: float = Field(ge=0.0, le=1.0)
    persona_consistency: float = Field(ge=0.0, le=1.0)

class ToolCall(BaseModel):
    tool_name: str
    parameters: dict
    reasoning: str

class MultimodalInput(BaseModel):
    input_type: Literal["text", "audio", "image", "video"]
    content: str
    metadata: Optional[dict] = None
```

## Testing Strategy

### Unit Tests
- [ ] Test structured output compliance
- [ ] Test function calling reliability
- [ ] Test multimodal input processing
- [ ] Test batch processing functionality
- [ ] Test embedding-based memory retrieval

### Integration Tests
- [ ] Test end-to-end multimodal scenarios
- [ ] Test tool-enabled agent interactions
- [ ] Test reasoning model integration
- [ ] Test batch simulation processing
- [ ] Test performance under load

### Example Scenarios
- [ ] Voice-based focus group with audio analysis
- [ ] Visual product testing with image feedback
- [ ] Tool-enabled market research with web search
- [ ] Reasoning-enhanced persona validation
- [ ] Large-scale population simulation with batch processing

### Performance Benchmarks
- [ ] API call latency measurements
- [ ] Cost per simulation comparisons
- [ ] Memory usage analysis
- [ ] Accuracy improvements with new features

## Migration Guide

### Backward Compatibility
- All existing TinyTroupe code will continue to work
- New features are opt-in through configuration
- Gradual migration path available
- Legacy API support maintained

### Breaking Changes (Minor)
- Some internal API signatures may change
- Configuration file format updates
- New required dependencies

### Migration Steps
1. Update OpenAI SDK to latest version
2. Update configuration file with new settings
3. Test existing simulations with new features disabled
4. Gradually enable new features one by one
5. Update custom tools to use function calling format
6. Migrate to multimodal agents where beneficial

## Future Considerations

### Potential Enhancements
- Integration with other AI providers (Anthropic, Google)
- Real-time streaming capabilities
- Advanced vector database integration
- Distributed simulation processing
- AI-powered simulation optimization

### Research Opportunities
- Comparative analysis of reasoning vs. standard models
- Multimodal agent behavior studies
- Tool use patterns in simulated environments
- Cost-effectiveness analysis of new features

---

## References

### OpenAI API Documentation
- [Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
- [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Batch API Documentation](https://platform.openai.com/docs/guides/batch)
- [Audio Guide](https://platform.openai.com/docs/guides/audio)
- [Vision Guide](https://platform.openai.com/docs/guides/vision)
- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)

### TinyTroupe Resources
- [TinyTroupe Paper](https://arxiv.org/abs/2507.09788)
- [GitHub Repository](https://github.com/microsoft/TinyTroupe)
- [API Documentation](./docs/api/)

---

*Last Updated: January 2025*
*Version: 1.0*
*Authors: Development Team*