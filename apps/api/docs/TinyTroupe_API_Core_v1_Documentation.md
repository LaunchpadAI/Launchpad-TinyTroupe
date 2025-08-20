# TinyTroupe API v1 Documentation

## Overview

The TinyTroupe API v1 provides a RESTful interface to all core TinyTroupe capabilities, enabling programmatic access to agent-based simulations, market research, and behavioral analysis. This documentation covers the complete API surface that mirrors the original TinyTroupe notebook patterns.

**Base URL**: `http://localhost:8000/api/v1`

**Version**: 1.0.0 (TinyTroupe Original Capabilities)

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Simulation Control](#simulation-control)
3. [Agent Management](#agent-management)
4. [Population Generation](#population-generation)
5. [Simulation Execution](#simulation-execution)
6. [Research Services](#research-services)
7. [Content Generation](#content-generation)
8. [Results Extraction](#results-extraction)

---

## Core Concepts

### TinyTroupe Patterns

The API follows these core TinyTroupe patterns:

1. **Session Management**: `control.begin()` → operations → `control.end()`
2. **Agent Creation**: Factory-based or specification-based generation
3. **World Simulation**: Agents in environments with broadcast/run patterns
4. **Results Extraction**: Field-based extraction with statistical analysis

### Authentication

Currently no authentication required (development mode). Production will use API keys.

### Response Format

All responses follow this structure:
```json
{
  "status": "success|error",
  "data": { ... },
  "error": "error message if applicable"
}
```

---

## Simulation Control

Manages simulation sessions, caching, and checkpoints following TinyTroupe's `control` module patterns.

### Begin Session

Start a new simulation session (equivalent to `control.begin()`)

**POST** `/simulation-control/sessions/begin`

```json
{
  "session_name": "market_research_session",
  "cache_file": "market_research.cache.json",
  "description": "Product evaluation with target demographics",
  "auto_checkpoint_interval": 5
}
```

**Response**:
```json
{
  "session_id": "uuid",
  "session_name": "market_research_session",
  "status": "created",
  "cache_file": "./cache/market_research.cache.json"
}
```

### Create Checkpoint

Save simulation state (equivalent to `control.checkpoint()`)

**POST** `/simulation-control/sessions/{session_id}/checkpoint`

```json
{
  "checkpoint_name": "after_demographics",
  "description": "State after demographic generation"
}
```

### End Session

Complete simulation session (equivalent to `control.end()`)

**DELETE** `/simulation-control/sessions/{session_id}/end`

---

## Agent Management

### List Available Agents

Get pre-defined agents (Lisa, Oscar, Marcos, etc.)

**GET** `/agents/available`

**Response**:
```json
[
  {
    "id": "lisa",
    "name": "Lisa Carter",
    "title": "Data Scientist",
    "description": "Marketing professional and data scientist"
  }
]
```

### Load Agent

Load a specific agent by ID

**POST** `/agents/{agent_id}/load`

**Response**: Complete TinyPerson specification

### Create Custom Agent

Generate agent using factory pattern

**POST** `/personas/create-from-factory`

```json
{
  "context": "Tech startup environment",
  "specification": "Senior engineer with 10 years experience",
  "temperature": 1.0
}
```

### Validate Agent

Check if agent meets expectations

**POST** `/personas/validate`

```json
{
  "agent_name": "lisa",
  "expectations": "Intelligent, data-driven, health-conscious",
  "include_agent_spec": true
}
```

---

## Population Generation

### Create Demographic Sample

Generate population from demographic data (TinyPersonFactory pattern)

**POST** `/populations/create-demographic-sample`

```json
{
  "demographic_template": "usa_demographics",
  "sample_size": 50,
  "context": "Market research for new product",
  "additional_specifications": "Focus on urban millennials"
}
```

### Bulk Population Generation

Create large populations with segments

**POST** `/populations/bulk-generate`

```json
{
  "name": "US Healthcare Consumers",
  "demographic_template": "usa_demographics",
  "total_size": 200,
  "segments": [
    {
      "name": "young_professionals",
      "size": 50,
      "age_range": "25-35",
      "income_level": "High ($80k+)",
      "location": "Urban",
      "particularities": "Tech-savvy, health-conscious",
      "fragments": ["health_conscious", "early_adopter"]
    }
  ]
}
```

**Response**:
```json
{
  "population_id": "uuid",
  "name": "US Healthcare Consumers",
  "total_generated": 200,
  "segments": [...],
  "agents": [...]
}
```

### Apply Personality Fragments

Modify agents with personality traits

**POST** `/populations/apply-fragments`

```json
{
  "agent_ids": ["agent_001", "agent_002"],
  "fragments": ["price_sensitive", "brand_loyal"],
  "mode": "append"
}
```

### Available Fragments

**GET** `/populations/fragments/available`

Returns all 16 personality fragments:
- health_conscious
- price_sensitive
- tech_savvy
- environmentally_aware
- brand_loyal
- early_adopter
- social_influence
- quality_focused
- time_constrained
- budget_conscious
- loving_parent
- career_focused
- adventurous
- conservative
- creative
- analytical

---

## Simulation Execution

### Focus Group Simulation

Run focus group with multiple agents

**POST** `/simulate/focus-group`

```json
{
  "simulation_type": "focus_group",
  "participants": {
    "mode": "from_agent",
    "specifications": ["lisa", "oscar", "marcos"]
  },
  "stimulus": {
    "type": "product",
    "content": "New smartphone with AI features",
    "context": {"price": "$999", "features": ["AI assistant", "5G"]}
  },
  "interaction_config": {
    "allow_cross_communication": true,
    "rounds": 3,
    "enable_memory": true
  },
  "extraction_config": {
    "extract_results": true,
    "extraction_objective": "Extract opinions and purchase intent",
    "result_type": "json"
  }
}
```

**Response**:
```json
{
  "simulation_id": "uuid",
  "status": "completed",
  "interactions": [...],
  "extracted_results": {
    "individual_responses": [...],
    "aggregate_insights": {...},
    "statistical_analysis": {...}
  }
}
```

### Market Research Simulation

Survey-style research (no cross-talk)

**POST** `/simulate/market-research`

Same structure as focus group but with `allow_cross_communication: false`

### Individual Interview

One-on-one interaction

**POST** `/simulate/individual-interaction`

Requires exactly one participant

---

## Research Services

Specialized research patterns from TinyTroupe examples

### Product Evaluation

**POST** `/research/product-evaluation`

```json
{
  "product_name": "Bottled Gazpacho",
  "product_description": "Cold Spanish soup in convenient bottles",
  "evaluation_criteria": ["taste", "convenience", "price", "health"],
  "target_demographic": "Urban millennials",
  "agents": ["agent_ids"],
  "extract_insights": true,
  "include_individual_feedback": true,
  "include_group_consensus": true
}
```

### Advertisement Testing

**POST** `/research/advertisement-testing`

```json
{
  "advertisement_content": "Ad copy here",
  "target_audience": "Families with children",
  "variants": ["emotional_appeal", "rational_appeal"],
  "agents": ["agent_ids"],
  "measure_effectiveness": true
}
```

### Customer Interview

**POST** `/research/customer-interview`

```json
{
  "product_or_service": "Banking app",
  "customer_profile": "Tech-savvy professional",
  "interview_questions": [
    "What features matter most?",
    "How often would you use it?"
  ],
  "agent": "agent_id"
}
```

### Brainstorming Session

**POST** `/research/brainstorming`

```json
{
  "topic": "AI features for Microsoft Word",
  "context": "Productivity enhancement",
  "agents": ["lisa", "oscar", "marcos"],
  "rounds": 5
}
```

---

## Content Generation

### Document Creation

Create documents using TinyWordProcessor

**POST** `/documents/create-with-agent`

```json
{
  "agent_name": "oscar",
  "document_type": "report",
  "topic": "Sustainable Architecture Trends",
  "length": 1000,
  "format": "markdown"
}
```

### Content Enrichment

Enhance content with TinyEnricher

**POST** `/content/enrich`

```json
{
  "content": "Basic product description",
  "enrichment_type": "marketing_copy",
  "target_audience": "Young professionals",
  "tone": "enthusiastic"
}
```

### Style Application

Apply writing styles

**POST** `/content/style`

```json
{
  "content": "Technical documentation",
  "style": "casual_blog",
  "preserve_facts": true
}
```

---

## Results Extraction

### Extract Structured Results

Process simulation data into insights

**POST** `/simulate/extract/structured-results`

```json
{
  "checkpoint_name": "simulation_checkpoint",
  "extraction_objective": "Extract purchase intent and key concerns",
  "result_type": "structured",
  "fields": ["response", "sentiment", "rating", "concerns", "demographics"],
  "extraction_hint": "Focus on Yes/No responses with justification"
}
```

**Response Structure**:
```json
{
  "raw_data": {...},
  "statistical_analysis": {
    "total_participants": 50,
    "response_rate": 0.85,
    "mean_response": 3.2,
    "confidence_interval": [2.8, 3.6]
  },
  "individual_responses": [
    {
      "participant_id": "agent_001",
      "response": "Yes",
      "sentiment": "positive",
      "engagement_score": 0.8
    }
  ],
  "aggregate_insights": {
    "consensus_themes": ["price_important", "quality_matters"],
    "majority_sentiment": "positive"
  },
  "sentiment_distribution": {
    "positive": 0.6,
    "neutral": 0.3,
    "negative": 0.1
  }
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad Request (invalid parameters)
- **404**: Resource not found
- **500**: Internal server error

Error response format:
```json
{
  "status": "error",
  "error": "Detailed error message",
  "detail": "Additional context if available"
}
```

---

## Rate Limits

Development mode: No limits
Production: 100 requests/minute per IP

---

## Examples

### Complete Market Research Flow

```python
import requests

base_url = "http://localhost:8000/api/v1"

# 1. Start session
session = requests.post(f"{base_url}/simulation-control/sessions/begin", json={
    "session_name": "gazpacho_research",
    "cache_file": "gazpacho.cache.json"
}).json()

# 2. Generate population
population = requests.post(f"{base_url}/populations/bulk-generate", json={
    "name": "US Consumers",
    "demographic_template": "usa_demographics",
    "total_size": 50,
    "segments": [{
        "name": "urban_millennials",
        "size": 50,
        "age_range": "25-35",
        "location": "Urban"
    }]
}).json()

# 3. Run market research
simulation = requests.post(f"{base_url}/simulate/market-research", json={
    "participants": {
        "mode": "from_population",
        "population_id": population["population_id"]
    },
    "stimulus": {
        "type": "product",
        "content": "Would you buy bottled gazpacho? Rate 1-5"
    },
    "extraction_config": {
        "extract_results": True,
        "extraction_objective": "Extract ratings and purchase intent"
    }
}).json()

# 4. Create checkpoint
checkpoint = requests.post(
    f"{base_url}/simulation-control/sessions/{session['session_id']}/checkpoint",
    json={"checkpoint_name": "after_survey"}
).json()

# 5. End session
requests.delete(f"{base_url}/simulation-control/sessions/{session['session_id']}/end")
```

---

## Migration from Notebooks

### Mapping TinyTroupe Code to API Calls

| TinyTroupe Code | API Equivalent |
|-----------------|----------------|
| `control.begin("cache.json")` | `POST /simulation-control/sessions/begin` |
| `TinyPersonFactory.create_factory_from_demography()` | `POST /populations/create-demographic-sample` |
| `factory.generate_people(50)` | `POST /populations/bulk-generate` |
| `TinyWorld("Focus Group", agents)` | Handled internally by simulation endpoints |
| `world.broadcast("message")` | Part of simulation request `stimulus` |
| `world.run(3)` | Set `rounds: 3` in `interaction_config` |
| `ResultsExtractor.extract_results_from_agents()` | `POST /simulate/extract/structured-results` |
| `control.checkpoint()` | `POST /simulation-control/sessions/{id}/checkpoint` |
| `control.end()` | `DELETE /simulation-control/sessions/{id}/end` |

---

## Version History

- **v1.0.0** - Initial release matching TinyTroupe original capabilities
- **v1.1.0** - (Planned) Enhanced intervention testing
- **v2.0.0** - (Planned) Real-time monitoring, WebSocket support

---

## Support

For issues or questions:
- GitHub: https://github.com/microsoft/tinytroupe
- API Issues: Create issue with `api` tag

---

**Note**: This API is designed to be a 1:1 mapping of TinyTroupe notebook capabilities. All core patterns from the original examples are supported through these endpoints.