# TinyTroupe Usage Patterns & Modular API Design
## Analysis of All Example Notebooks

### Overview

After analyzing all 18 example notebooks, I've identified distinct usage patterns and modular components that can be exposed as flexible API endpoints. This document outlines the core patterns and proposes a modular API design that supports the full range of TinyTroupe capabilities.

## Core Usage Patterns Identified

### 1. **Persona Creation & Management Patterns**

#### 1.1 Load from Pre-Built Agents
```python
# Pattern: Load existing rich agent specifications
lisa = TinyPerson.load_specification("./agents/Lisa.agent.json")
oscar = TinyPerson.load_specification("./agents/Oscar.agent.json")
```
**Use Cases**: Advertisement testing, Product brainstorming, Simple chat, Political debates

#### 1.2 Factory-Based Generation  
```python
# Pattern: Generate personas from context + specification
factory = TinyPersonFactory(investment_firm_context)
banker = factory.generate_person(banker_spec)
```
**Use Cases**: Investment firm, Interview with customer, Creating and validating agents

#### 1.3 Demographic Sampling
```python
# Pattern: Generate diverse populations from demographic data
factory = TinyPersonFactory.create_factory_from_demography("./populations/usa.json", 
                                                           population_size=50)
people = factory.generate_people(50)
```
**Use Cases**: All market research notebooks, Travel product research

#### 1.4 Fragment-Based Customization
```python
# Pattern: Apply behavioral fragments to modify personas
oscar.import_fragment("./fragments/leftwing.agent.fragment.json")
oscar.import_fragment("./fragments/aggressive_debater.fragment.json")
```
**Use Cases**: Political compass, Market research with picky customers

### 2. **Interaction & Simulation Patterns**

#### 2.1 Individual Interaction
```python
# Pattern: Direct persona interaction for interviews/analysis
customer.listen_and_act("What would you say are your main problems today?")
```
**Use Cases**: Interview with customer, Investment firm consultation

#### 2.2 Focus Group Discussion
```python
# Pattern: Group discussion without cross-communication
world = TinyWorld("Focus group", [lisa, oscar, marcos])
world.broadcast(task_description)
world.run(3)
```
**Use Cases**: Advertisement creation, Product brainstorming, Apartment rental ad

#### 2.3 Social Network Simulation
```python
# Pattern: Agents interact with each other dynamically
world.make_everyone_accessible()
lisa.listen("Talk to Oscar to know more about him")
world.run(4)
```
**Use Cases**: Simple chat, Investment firm collaboration, Story telling

#### 2.4 Market Research Evaluation
```python
# Pattern: Present stimulus → Extract structured responses
world.broadcast(eval_request_msg)
world.run(1)
results = results_extractor.extract_results_from_agents(people)
```
**Use Cases**: All market research, Advertisement testing, Travel product research

### 3. **Content Generation Patterns**

#### 3.1 Structured Result Extraction
```python
# Pattern: Extract specific fields from agent interactions
extractor = ResultsExtractor(
    extraction_objective="Find the ad the agent chose",
    fields=["ad_number", "ad_title", "justification"]
)
results = extractor.extract_results_from_agent(agent)
```
**Use Cases**: Advertisement testing, Market research analysis, Product brainstorming

#### 3.2 Conversation Data Generation
```python
# Pattern: Generate synthetic conversations for training data
reducer = ResultsReducer()
reducer.add_reduction_rule("TALK", aux_extract_content)
df = reducer.reduce_agent_to_dataframe(person, column_names=["author", "content"])
```
**Use Cases**: Synthetic data generation, Chat logs, Training datasets

#### 3.3 Creative Content Generation
```python
# Pattern: Generate marketing copy, stories, or creative content
extractor.extract_results_from_world(focus_group,
                                     extraction_objective="Compose an advertisement copy",
                                     fields=["ad_copy"])
```
**Use Cases**: Apartment rental ad, Product brainstorming, Story generation

### 4. **Validation & Quality Control Patterns**

#### 4.1 Persona Validation
```python
# Pattern: Validate personas against expectations
score, justification = TinyPersonValidator.validate_person(
    banker, 
    expectations=banker_expectations,
    include_agent_spec=True
)
```
**Use Cases**: Creating and validating agents, Quality assurance

#### 4.2 Simulation Caching & Control
```python
# Pattern: Cache expensive operations and control simulation state
control.begin("simulation_cache.json")
control.checkpoint()
control.end()
```
**Use Cases**: All market research, Long-running simulations

### 5. **Advanced Capabilities Patterns**

#### 5.1 Tool Integration
```python
# Pattern: Agents use external tools and data sources
grounding_faculty = FilesAndWebGroundingFaculty(folders_paths=["../data/finance"])
advisor.add_mental_faculties([grounding_faculty])
```
**Use Cases**: Investment firm with real data, Document analysis

#### 5.2 Narrative Steering
```python
# Pattern: Guide long-form narrative generation
story = TinyStory(world)
continuation = story.continue_story("Continue in an interesting way")
```
**Use Cases**: Story telling, Long narratives, Creative writing

#### 5.3 Statistical Analysis
```python
# Pattern: Analyze results with statistical methods
def is_there_a_good_market(df):
    percentage_positive = df["response"].isin(["4", "5"]).mean()
    return percentage_positive > threshold
```
**Use Cases**: All market research, A/B testing, Campaign analysis

## Modular API Design Proposal

Based on these patterns, here's a modular API structure that supports all use cases:

### Core Service Modules

#### 1. **Persona Management Service**
```yaml
/api/v1/personas:
  - POST /create-from-agent       # Load pre-built agents (Lisa, Oscar, etc.)
  - POST /create-from-factory     # Generate with context + specification  
  - POST /create-demographic-sample # Generate from population data
  - POST /apply-fragments         # Apply behavioral modifications
  - GET  /templates               # List available agents & fragments
  - POST /validate                # Validate persona against expectations
```

#### 2. **Simulation Orchestration Service**
```yaml
/api/v1/simulate:
  - POST /individual-interaction  # One-on-one conversation/interview
  - POST /focus-group            # Group discussion (non-interactive)
  - POST /social-simulation      # Interactive multi-agent simulation
  - POST /market-research        # Structured evaluation with extraction
  - GET  /status/{simulation_id} # Monitor long-running simulations
  - POST /cache/checkpoint       # Save simulation state
```

#### 3. **Content Extraction Service**
```yaml
/api/v1/extract:
  - POST /structured-results     # Extract specific fields from interactions
  - POST /conversation-data      # Generate synthetic conversation datasets
  - POST /creative-content       # Generate marketing copy, stories, etc.
  - POST /statistical-analysis   # Analyze results with statistical methods
```

#### 4. **Quality Control Service**
```yaml
/api/v1/quality:
  - POST /validate-persona       # Validate persona adherence
  - POST /validate-simulation    # Check simulation quality
  - GET  /performance-metrics    # Get simulation performance stats
```

### Universal Simulation Request Format

```json
{
  "simulation_type": "focus_group|individual|social|market_research",
  "participants": {
    "mode": "existing_agents|factory_generated|demographic_sample",
    "specifications": [...],
    "population_params": {...},
    "fragments_to_apply": [...]
  },
  "interaction_config": {
    "allow_cross_communication": true,
    "rounds": 3,
    "enable_memory": true,
    "cache_simulation": true
  },
  "stimulus": {
    "type": "question|advertisement|product|scenario",
    "content": "...",
    "context": {...}
  },
  "extraction_config": {
    "objective": "Extract specific insights...",
    "fields": ["field1", "field2"],
    "output_format": "structured|conversation|creative"
  }
}
```

### Example API Implementations

#### Advertisement Testing (from TV Ad notebook)
```yaml
POST /api/v1/simulate/market-research
{
  "participants": {
    "mode": "existing_agents", 
    "specifications": ["lisa_carter", "oscar_architect"]
  },
  "stimulus": {
    "type": "advertisement_comparison",
    "content": [
      {"ad_id": "gaming_tv", "copy": "Ultimate Gaming Experience..."},
      {"ad_id": "family_tv", "copy": "Perfect Family TV..."}
    ]
  },
  "extraction_config": {
    "objective": "Find which ad the agent chose",
    "fields": ["ad_number", "ad_title", "justification"]
  }
}
```

#### Product Evaluation (from Gazpacho notebook) 
```yaml
POST /api/v1/simulate/market-research
{
  "participants": {
    "mode": "demographic_sample",
    "population_params": {
      "source": "usa.json",
      "size": 50,
      "segments": ["health_conscious", "traditional_food_preference"]
    }
  },
  "stimulus": {
    "type": "product_evaluation",
    "content": "Bottled Gazpacho - Spanish cold soup...",
    "evaluation_scale": "likert_5"
  },
  "extraction_config": {
    "objective": "Rate purchase propensity 1-5",
    "fields": ["response", "justification"],
    "statistical_analysis": true
  }
}
```

#### Creative Brainstorming (from Product Brainstorming notebook)
```yaml
POST /api/v1/simulate/focus-group
{
  "participants": {
    "mode": "existing_agents",
    "specifications": ["lisa_carter", "oscar_architect", "marcos_physician"]
  },
  "interaction_config": {
    "allow_cross_communication": true,
    "rounds": 4
  },
  "stimulus": {
    "type": "brainstorming_prompt", 
    "content": "Brainstorm AI features for Microsoft Word..."
  },
  "extraction_config": {
    "objective": "Consolidate brainstormed ideas",
    "output_format": "creative",
    "fields": ["ideas", "benefits", "implementation_notes"]
  }
}
```

#### Interview Simulation (from Interview notebook)
```yaml
POST /api/v1/simulate/individual-interaction
{
  "participants": {
    "mode": "factory_generated",
    "specifications": [{
      "context": "VP of Product Innovation at large bank",
      "role": "Banking executive facing fintech competition"
    }]
  },
  "interaction_config": {
    "type": "interview",
    "max_exchanges": 10
  },
  "stimulus": {
    "type": "interview_questions",
    "content": [
      "What are your main problems today?",
      "Can you elaborate on the fintechs?",
      "What would you improve to compete better?"
    ]
  }
}
```

### Key Benefits of This Modular Design

1. **Pattern-Based**: Each endpoint maps to proven usage patterns from examples
2. **Flexible**: Single API structure supports all use cases via configuration  
3. **Composable**: Services can be combined for complex workflows
4. **Extensible**: Easy to add new simulation types or extraction methods
5. **ActivePieces Ready**: Clear mapping to workflow nodes
6. **MCP Compatible**: Simple tool definitions for AI agents

This design allows us to expose the full sophistication of TinyTroupe through clean, modular APIs while maintaining the proven patterns that make the examples work so well.