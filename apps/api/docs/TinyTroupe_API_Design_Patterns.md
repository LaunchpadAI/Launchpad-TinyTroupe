# TinyTroupe API Design Patterns

## Overview

This document outlines the core infrastructure patterns and requirements that ALL TinyTroupe API endpoints must follow. Use this as a reference when designing new endpoints to ensure consistency with TinyTroupe's notebook patterns.

**Status**: ✅ **Production Implementation Complete**  
**Key Achievement**: Session isolation with concurrent simulation support

---

## Core TinyTroupe Pattern

Every TinyTroupe notebook follows this essential flow (note this is a basic example, there are many variations):

```python
# 1. Session Management
control.begin("simulation_cache.json")

# 2. Agent Creation
factory = TinyPersonFactory.create_factory_from_demography("demographics.json")
agents = factory.generate_people(50)

# 3. Environment Setup
world = TinyWorld("Focus Group", agents, broadcast_if_no_target=False)

# 4. Simulation Execution
world.broadcast("Your question or stimulus here")
world.run(3)  # Multiple rounds

# 5. Checkpointing
control.checkpoint()

# 6. Results Extraction
extractor = ResultsExtractor(
    extraction_objective="Extract specific insights",
    fields=["response", "sentiment", "rating"]
)
results = extractor.extract_results_from_agents(agents)

# 7. Session Cleanup
control.end()
```

## Production Implementation Pattern

Our API implements the above pattern with **session isolation** to support concurrent users:

```python
# API Implementation Pattern
def run_simulation(request, agents):
    simulation_id = str(uuid.uuid4())
    session_cache_file = f"cache/sessions/sim_{simulation_id}.json"
    
    try:
        # 1. Session-scoped cache
        control.begin(cache_file=session_cache_file, cache=True)
        
        # 2. Unique agent instances per session
        unique_agents = []
        session_suffix = simulation_id[:8]
        for spec in request.participants:
            agent = agent_service.load_agent(spec, unique_suffix=session_suffix)
            unique_agents.append(agent)
        
        # 3. Standard TinyTroupe flow
        world = TinyWorld(f"Simulation_{simulation_id}")
        world.broadcast(request.stimulus.content)
        world.run(request.rounds)
        
        # 4. Results extraction (no checkpoint needed)
        if request.extract_results:
            rapporteur = unique_agents[0]
            rapporteur.listen_and_act("Consolidate the discussion...")
            results = extractor.extract_results_from_agent(rapporteur, objective)
        
        return results
    finally:
        control.end()  # Always cleanup
```

**Key Innovations:**
- ✅ **Session-scoped caches** prevent conflicts
- ✅ **Unique agent naming** enables concurrency  
- ✅ **Direct agent extraction** (not checkpoint-based)
- ✅ **Configurable semantic memory** for optimal performance
- ✅ **Automatic cleanup** ensures no leaks

---

## Mandatory Infrastructure Requirements

### 1. Session Management (SimulationControlService)

**REQUIRED for ALL endpoints**

#### API Pattern:
```json
{
  "session_id": "uuid",  // Link ALL operations to a session
  "session_name": "descriptive_name",
  "cache_file": "operation_name.cache.json"
}
```

#### Implementation Requirements:
- **Begin Session**: Every operation starts with session creation
- **Checkpoint Support**: Save state at logical breakpoints  
- **Recovery**: Restore from checkpoints if interrupted
- **End Session**: Clean session termination
- **Cache Management**: All agents, results, and state cached

#### Service Integration:
```python
# All endpoints must use SimulationControlService
session = simulation_control_service.begin_session(
    session_name="endpoint_operation",
    cache_file="endpoint_cache.json"
)
```

### 2. Agent Lifecycle Management

**Agent Creation Patterns**

#### From Demographics (TinyPersonFactory):
```python
factory = TinyPersonFactory.create_factory_from_demography(
    demographic_file,
    context="Simulation context"
)
agents = factory.generate_people(count)
```

#### From Specifications:
```python
agent = TinyPerson.load_specification("agent_file.json")

# Configure semantic memory based on use case
agent = agent_service.load_agent(
    agent_id="lisa", 
    unique_suffix="session_123",
    disable_semantic_memory=True  # For focus groups extracting from episodic memory
)
```

#### From Grounded Data:
```python
agent = population_service.create_grounded_persona(
    grounding_sources=[{...}],
    personality_fragments=[...],
    context="..."
)
```

**API Requirements:**
- All agent creation must specify source and context
- Personality fragments must use enum values
- Agent validation against expectations when specified
- Configure semantic memory based on simulation type (see Memory Management section)

### 3. Memory Management & Configuration

**Critical Design Decision: Semantic Memory Configuration**

TinyTroupe agents have two types of memory:
- **Episodic Memory**: Conversation history and interactions (always enabled)
- **Semantic Memory**: Document storage for grounding and knowledge retrieval (configurable)

#### When to Disable Semantic Memory

```python
# ✅ DISABLE for focus groups/surveys extracting from conversation history
agent = agent_service.load_agent(
    agent_id="lisa",
    disable_semantic_memory=True  # Avoids Document property conflicts
)

# ✅ ENABLE for simulations requiring document access/grounding  
agent = agent_service.load_agent(
    agent_id="oscar", 
    disable_semantic_memory=False  # Default: allows document access
)
```

#### Memory Configuration by Simulation Type

**Configurable in Request**: Add `enable_semantic_memory` to `interaction_config`:
- `true`: Force enable (e.g., focus group with document review)
- `false`: Force disable (e.g., market research without documents)
- `null`/omitted: Auto-detect based on simulation type

**Default Auto-Detection**:

| Simulation Type | Default Semantic Memory | Reason | Override Use Case |
|----------------|-------------------------|---------|-------------------|
| **Focus Groups** | `disabled` | Extract from conversation | Enable for product specs, user stories |
| **Surveys** | `disabled` | Extract from responses | Enable for document-grounded questions |
| **Market Research** | `enabled` | May need research docs | Disable for pure conversation analysis |
| **Social Simulations** | `enabled` | Rich contextual knowledge | Disable for performance optimization |
| **Grounding-based** | `enabled` | Requires document access | Cannot disable (required) |

#### Implementation Pattern

```python
def configure_agents_for_simulation(request, agent_specs: List[str]):
    # Check if explicitly configured in request
    if request.interaction_config.enable_semantic_memory is not None:
        disable_semantic = not request.interaction_config.enable_semantic_memory
    else:
        # Auto-detect based on simulation type
        if request.simulation_type == "focus_group":
            disable_semantic = True  # Default: extract from conversation
        elif request.simulation_type == "market_research":
            disable_semantic = False  # Default: may need documents
        # ... other types
    
    agents = []
    for spec in agent_specs:
        agent = agent_service.load_agent(
            agent_id=spec,
            unique_suffix=session_id,
            disable_semantic_memory=disable_semantic
        )
        agents.append(agent)
    
    return agents
```

**Why This Matters:**
- Focus groups extract results from conversation history, not documents
- Document objects have read-only properties that cause extraction errors
- Semantic memory adds overhead when not needed for the use case
- Proper configuration prevents `"property 'text' of 'Document' object has no setter"` errors

### 4. Simulation Execution Patterns

**World Creation:**
```python
# For surveys/individual responses
world = TinyWorld("Name", agents, broadcast_if_no_target=False)

# For focus groups/discussions  
world = TinyWorld("Name", agents, broadcast_if_no_target=True)
```

**Interaction Patterns:**
```python
# Broadcast to all agents
world.broadcast("Stimulus message")

# Multi-round execution
world.run(rounds)

# Individual agent interaction
agent.listen_and_act("Direct message")
```

**API Requirements:**
- Specify communication mode (broadcast vs individual)
- Configure cross-talk behavior
- Set number of interaction rounds
- Enable/disable agent memory and thinking

### 5. Results Extraction (Mandatory)

**Field-Based Extraction:**
```python
extractor = ResultsExtractor(
    extraction_objective="Clear objective statement",
    situation="Context description", 
    fields=["field1", "field2", "field3"],
    fields_hints={"field1": "Format specification"},
    verbose=True
)
results = extractor.extract_results_from_agents(agents)
```

**API Requirements:**
- Every simulation endpoint MUST have extraction_config
- Must specify extraction_objective and fields
- Statistical analysis when multiple agents
- Export in structured format (JSON/CSV/DataFrame)

#### Standard Field Types:
- **Behavioral**: `response`, `engagement_score`, `purchase_intent`
- **Sentiment**: `emotional_response`, `satisfaction`, `concerns`
- **Quantitative**: `rating`, `likelihood_score`, `predicted_value`
- **Qualitative**: `reasoning`, `key_points`, `suggestions`

### 6. Error Handling & Quality Assurance

**Validation Requirements:**
- Agent validation against expectations
- Result confidence scoring
- Quality checks on extraction
- Graceful degradation for LLM failures

**API Response Pattern:**
```json
{
  "status": "success|error",
  "data": {...},
  "metadata": {
    "session_id": "uuid",
    "confidence_score": 0.85,
    "quality_metrics": {...}
  },
  "error": "error details if applicable"
}
```

---

## Service Architecture Requirements

### Core Services (All Required)

1. **SimulationControlService**
   - Session lifecycle management
   - Caching and checkpointing
   - State recovery

2. **PopulationService** 
   - Agent generation from demographics
   - Personality fragment application
   - Bulk population creation

3. **SimulationService**
   - World creation and management
   - Agent interaction orchestration
   - Multi-round simulation execution

4. **ContentService**
   - Grounded persona creation
   - Content enrichment
   - Document generation

5. **ResultsExtractor**
   - Field-based data extraction
   - Statistical analysis
   - Format conversion

### Service Integration Pattern

```python
class NewEndpointService:
    def __init__(self):
        self.simulation_control = SimulationControlService()
        self.population_service = PopulationService()
        self.simulation_service = SimulationService()
        self.results_extractor = ResultsExtractor()
    
    async def new_operation(self, request):
        # 1. ALWAYS start with session
        session = await self.simulation_control.begin_session(
            request.session_name,
            request.cache_file
        )
        
        try:
            # 2. Create/load agents
            agents = await self.population_service.create_agents(...)
            
            # 3. Checkpoint after agent creation
            await self.simulation_control.checkpoint(
                session.id, 
                "agents_created"
            )
            
            # 4. Run simulation
            results = await self.simulation_service.run_simulation(...)
            
            # 5. Extract structured results
            extracted = await self.results_extractor.extract_results(...)
            
            # 6. Final checkpoint
            await self.simulation_control.checkpoint(
                session.id,
                "operation_complete"
            )
            
            return extracted
            
        finally:
            # 7. ALWAYS end session
            await self.simulation_control.end_session(session.id)
```

---

## API Endpoint Design Template

### Request Format

```json
{
  "session_config": {
    "session_name": "operation_name",
    "cache_file": "cache_name.json",
    "description": "What this operation does"
  },
  "participants": {
    "mode": "from_demographics|from_agent|from_population|custom",
    "specifications": [...],
    "count": 50
  },
  "simulation_config": {
    "environment_type": "focus_group|survey|interview",
    "rounds": 3,
    "enable_memory": true,
    "enable_thinking": true,
    "broadcast_mode": true|false
  },
  "stimulus": {
    "type": "product|message|question|scenario",
    "content": "The actual stimulus",
    "context": {...}
  },
  "extraction_config": {
    "extract_results": true,
    "extraction_objective": "Clear statement of what to extract",
    "fields": ["response", "sentiment", "rating"],
    "fields_hints": {"response": "Format specification"},
    "statistical_analysis": true
  }
}
```

### Response Format

```json
{
  "operation_id": "uuid",
  "session_id": "uuid",
  "status": "completed|failed|partial",
  "participants": {
    "total": 50,
    "successful": 48,
    "failed": 2
  },
  "simulation_results": {
    "interactions": [...],
    "rounds_completed": 3,
    "total_interactions": 144
  },
  "extracted_results": {
    "individual_results": [...],
    "aggregate_statistics": {...},
    "statistical_analysis": {...}
  },
  "metadata": {
    "execution_time": "2.5 minutes",
    "cache_file": "operation.cache.json",
    "checkpoints": ["agents_created", "simulation_complete"],
    "quality_score": 0.85
  }
}
```

---

## Quality Requirements

### Performance Standards
- **Agent Generation**: < 30 seconds for 100 agents
- **Simulation Execution**: < 5 minutes for 50 agents, 3 rounds
- **Results Extraction**: < 60 seconds for structured output
- **Session Management**: < 5 seconds for checkpoints

### Reliability Standards
- **Checkpoint Recovery**: 100% state restoration
- **Error Handling**: Graceful degradation for LLM failures
- **Cache Consistency**: All operations cache intermediate results
- **Quality Scoring**: All extractions include confidence metrics

### Scalability Standards
- **Concurrent Sessions**: Support 10+ simultaneous operations
- **Agent Limits**: Handle up to 1000 agents per operation
- **Memory Management**: Automatic cleanup of completed sessions
- **Rate Limiting**: Respect LLM API quotas

---

## Troubleshooting Common Issues

### Document Property Extraction Error

**Error**: `"property 'text' of 'Document' object has no setter"`

**Root Cause**: TinyTroupe tries to modify llama_index Document objects with read-only text properties during semantic memory operations.

**Solution**: Disable semantic memory for simulations extracting from episodic memory:

```python
# ❌ This causes Document errors:
agent = agent_service.load_agent("lisa")  # semantic_memory enabled by default

# ✅ This fixes the error:
agent = agent_service.load_agent(
    "lisa", 
    disable_semantic_memory=True  # For focus groups/surveys
)
```

**When to Apply**:
- Focus group simulations extracting from conversation history
- Survey responses extracting from individual agent responses  
- Any simulation using `extract_results_from_agent()` on episodic memory

**When NOT to Apply**:
- Market research requiring document access
- Grounding-based simulations using external content
- Social simulations needing rich contextual knowledge

### Agent Naming Conflicts

**Error**: `"Agent name Lisa Carter is already in use"`

**Root Cause**: Multiple concurrent simulations trying to use the same agent names.

**Solution**: Always use unique suffixes for concurrent sessions:

```python
# ✅ Proper concurrent agent loading:
session_id = str(uuid.uuid4())[:8]
agent = agent_service.load_agent("lisa", unique_suffix=session_id)
# Results in: "Lisa Carter_abc12345"
```

### Session Cache Conflicts

**Error**: Simulations interfering with each other or stale results.

**Solution**: Use session-scoped cache files:

```python
# ✅ Session isolation:
session_cache_file = f"cache/sessions/sim_{simulation_id}.json"
control.begin(cache_file=session_cache_file, cache=True)
```

---

## Common Anti-Patterns to Avoid

### ❌ Don't Do This:
```python
# Missing session management
def bad_endpoint():
    agents = create_agents()  # No session!
    results = run_simulation()  # No caching!
    return results  # No extraction structure!

# Inconsistent extraction
def bad_extraction():
    return {"response": agent.last_response}  # Unstructured!

# No error handling
def bad_operation():
    # If LLM fails, entire operation crashes
    return simulation.run()  # No try/catch!
```

### ✅ Do This Instead:
```python
# Proper TinyTroupe pattern
async def good_endpoint(request):
    session = await begin_session(request.session_name)
    try:
        agents = await create_agents_with_validation()
        await checkpoint("agents_ready")
        
        results = await run_simulation_with_error_handling()
        await checkpoint("simulation_complete")
        
        extracted = await extract_structured_results(
            agents, 
            objective=request.extraction_objective,
            fields=request.fields
        )
        
        return structured_response(extracted, session.id)
    finally:
        await end_session(session.id)
```

---

## Checklist for New Endpoints

Before implementing any new TinyTroupe API endpoint, verify:

- [ ] **Session Management**: Uses SimulationControlService for all operations
- [ ] **Agent Creation**: Follows factory patterns or specification loading
- [ ] **Memory Configuration**: Properly configures semantic memory based on simulation type
- [ ] **Checkpointing**: Saves state at logical breakpoints
- [ ] **Simulation Execution**: Uses TinyWorld patterns with proper configuration
- [ ] **Results Extraction**: Implements field-based structured extraction
- [ ] **Error Handling**: Graceful failure with informative messages
- [ ] **Quality Assurance**: Includes confidence scoring and validation
- [ ] **Performance**: Meets time and scalability requirements
- [ ] **Documentation**: Follows this pattern documentation
- [ ] **Testing**: Includes unit tests and integration tests

---

This document ensures all TinyTroupe API endpoints maintain consistency with the original notebook patterns while providing robust, scalable, and reliable service infrastructure.