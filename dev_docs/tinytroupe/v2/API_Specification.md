# TinyTroupe Microservice API Specification

## Version 1.0

## Base Configuration

### Base URL
```
Production: https://api.tinytroupe-re.com/v1
Staging: https://staging-api.tinytroupe-re.com/v1
Development: http://localhost:8000/v1
```

### Authentication
```
Authorization: Bearer {API_KEY}
X-Brokerage-ID: {BROKERAGE_UUID}
```

### Rate Limiting
- 1000 requests per hour per API key
- 100 concurrent simulations per brokerage
- Burst limit: 50 requests per minute

## Core API Endpoints

### 1. Persona Management APIs

#### Create Persona
```http
POST /personas
Content-Type: application/json

{
  "name": "John Smith",
  "visibility": "private|team|brokerage",
  "demographics": {
    "age_range": "45-55",
    "occupation": "Hedge Fund Manager",
    "net_worth_range": "$50M-$100M",
    "primary_residence": "Manhattan, NY",
    "family_status": "Married, 2 children"
  },
  "preferences": {
    "property_types": ["penthouse", "waterfront", "estate"],
    "preferred_locations": ["Manhattan", "Hamptons", "Miami Beach"],
    "must_have_features": ["home_office", "wine_cellar", "pool"],
    "deal_breakers": ["highway_noise", "no_privacy"],
    "style_preferences": ["modern", "contemporary"]
  },
  "behavioral_traits": {
    "decision_making": "analytical",
    "risk_tolerance": "moderate",
    "communication_style": "direct",
    "buying_urgency": "low",
    "price_sensitivity": "low"
  },
  "enrichment_sources": [
    {
      "type": "linkedin",
      "url": "https://linkedin.com/in/johnsmith",
      "auto_refresh": true
    }
  ]
}

Response: 201 Created
{
  "id": "pers_2n4k5j6h",
  "created_at": "2024-01-15T10:30:00Z",
  "status": "active",
  "enrichment_status": "pending",
  "simulation_ready": false
}
```

#### Enrich Persona
```http
POST /personas/{persona_id}/enrich
Content-Type: application/json

{
  "data_type": "interaction|public_info|notes|preferences",
  "source": "agent_notes|call_transcript|email|public_api",
  "content": {
    "text": "Client mentioned interest in properties with private beach access...",
    "metadata": {
      "date": "2024-01-10",
      "agent_id": "agent_123",
      "interaction_type": "phone_call"
    }
  },
  "process_immediately": true
}

Response: 202 Accepted
{
  "enrichment_id": "enr_9m8n7b6v",
  "status": "processing",
  "estimated_completion": "2024-01-15T10:31:00Z"
}
```

### 2. Simulation APIs

#### Focus Group Simulation
```http
POST /simulations/focus-group
Content-Type: application/json

{
  "name": "Penthouse Marketing Test",
  "property": {
    "id": "prop_123",
    "address": "432 Park Avenue, Unit 96",
    "price": 45000000,
    "type": "penthouse",
    "bedrooms": 6,
    "bathrooms": 7,
    "sqft": 8255,
    "description": "Spectacular penthouse with 360-degree views...",
    "features": [
      "private_elevator",
      "wine_room",
      "library",
      "outdoor_terrace"
    ],
    "photos": [
      {
        "url": "https://...",
        "caption": "Living room with city views",
        "room": "living_room"
      }
    ]
  },
  "test_scenarios": [
    {
      "type": "photo_selection",
      "options": ["sunset_view", "interior_design", "building_exterior"]
    },
    {
      "type": "modification_testing",
      "modifications": [
        "add_smart_home_system",
        "renovate_kitchen",
        "add_private_gym"
      ]
    },
    {
      "type": "pricing_strategy",
      "price_points": [42000000, 45000000, 48000000]
    }
  ],
  "persona_configuration": {
    "mode": "segment|specific",
    "segments": ["finance_executives", "tech_entrepreneurs"],
    "specific_personas": ["pers_123", "pers_456"],
    "generated_count": 20,
    "diversity_parameters": {
      "age_diversity": 0.3,
      "wealth_diversity": 0.2,
      "preference_diversity": 0.4
    }
  },
  "simulation_parameters": {
    "iterations": 100,
    "temperature": 0.7,
    "consensus_threshold": 0.6,
    "detail_level": "detailed|summary"
  }
}

Response: 202 Accepted
{
  "simulation_id": "sim_8k7j6h5g",
  "status": "queued",
  "estimated_duration_seconds": 45,
  "webhook_url": "https://your-domain.com/webhook/sim_8k7j6h5g",
  "ws_channel": "/ws/simulations/sim_8k7j6h5g"
}
```

#### Marketing Campaign Simulation
```http
POST /simulations/marketing-campaign
Content-Type: application/json

{
  "campaign": {
    "name": "Luxury Waterfront Campaign",
    "channels": ["email", "social_media", "direct_mail"],
    "messages": {
      "email": {
        "subject_lines": [
          "Exclusive: New Waterfront Estate",
          "Your Dream Home Awaits on the Water"
        ],
        "body_template": "...",
        "cta": "Schedule Private Viewing"
      },
      "social_media": {
        "platforms": ["instagram", "linkedin"],
        "content_variants": ["lifestyle_focus", "investment_focus"]
      }
    },
    "timing": {
      "send_day": "tuesday|thursday",
      "send_time": "09:00|14:00|18:00"
    }
  },
  "target_personas": ["pers_123", "pers_456"],
  "success_metrics": ["open_rate", "click_rate", "inquiry_rate", "showing_request"]
}

Response: 202 Accepted
{
  "simulation_id": "sim_3f4g5h6j",
  "predicted_results": {
    "best_configuration": {
      "channel": "email",
      "subject_line": "Exclusive: New Waterfront Estate",
      "send_time": "tuesday_09:00",
      "predicted_open_rate": 0.42,
      "predicted_inquiry_rate": 0.08
    }
  }
}
```

#### Intervention Testing
```http
POST /simulations/intervention
Content-Type: application/json

{
  "scenario": {
    "type": "follow_up_sequence",
    "initial_interaction": "property_viewing",
    "interventions": [
      {
        "step": 1,
        "timing": "same_day",
        "action": "thank_you_email",
        "content": "Thank you for viewing the property..."
      },
      {
        "step": 2,
        "timing": "day_3",
        "action": "follow_up_call",
        "script_points": ["address_concerns", "similar_properties", "urgency"]
      },
      {
        "step": 3,
        "timing": "day_7",
        "action": "personalized_report",
        "includes": ["market_analysis", "property_comparison", "investment_potential"]
      }
    ]
  },
  "test_personas": ["pers_789", "pers_012"],
  "variations_to_test": [
    "timing_variations",
    "message_tone",
    "channel_mix"
  ]
}

Response: 200 OK
{
  "simulation_id": "sim_9k8j7h6g",
  "recommendations": {
    "optimal_sequence": {...},
    "predicted_conversion_rate": 0.35,
    "key_insights": [
      "Day 3 follow-up critical for engagement",
      "Personalized market data increases response by 40%"
    ]
  }
}
```

### 3. Matching APIs

#### Property to Clients Matching
```http
POST /matching/property-to-clients
Content-Type: application/json

{
  "property_id": "prop_456",
  "client_pool": {
    "source": "brokerage|team|agent",
    "filters": {
      "min_net_worth": 25000000,
      "preferred_locations": ["Manhattan"],
      "actively_looking": true
    }
  },
  "matching_criteria": {
    "weights": {
      "preference_match": 0.4,
      "behavioral_fit": 0.3,
      "timing_alignment": 0.2,
      "budget_fit": 0.1
    },
    "minimum_score": 0.7
  },
  "output_options": {
    "max_results": 20,
    "include_reasoning": true,
    "generate_outreach_strategy": true
  }
}

Response: 200 OK
{
  "matches": [
    {
      "persona_id": "pers_123",
      "match_score": 0.92,
      "key_attractions": [
        "Waterfront location matches preference",
        "Home office meets WFH requirements",
        "School district aligns with family needs"
      ],
      "potential_objections": [
        "May find property too modern",
        "Distance from current residence"
      ],
      "outreach_strategy": {
        "recommended_approach": "emphasize_investment_value",
        "talking_points": [...],
        "best_showing_time": "weekend_morning"
      }
    }
  ]
}
```

### 4. Analytics APIs

#### Get Simulation Results
```http
GET /simulations/{simulation_id}/results
Accept: application/json

Response: 200 OK
{
  "simulation_id": "sim_8k7j6h5g",
  "status": "completed",
  "completed_at": "2024-01-15T10:35:00Z",
  "summary": {
    "consensus_reached": true,
    "confidence_level": 0.85,
    "key_findings": [
      "78% prefer sunset photos over interior shots",
      "Smart home addition increases appeal by 35%",
      "Optimal price point: $44.5M"
    ]
  },
  "detailed_results": {
    "photo_preferences": {...},
    "modification_impact": {...},
    "pricing_sensitivity": {...},
    "persona_responses": [...]
  },
  "recommendations": [
    {
      "action": "Use sunset terrace photo as primary",
      "impact": "high",
      "confidence": 0.89
    }
  ],
  "tokens_used": 45000,
  "cost": 4.50
}
```

#### Get Persona Analytics
```http
GET /personas/{persona_id}/analytics
Accept: application/json

Query Parameters:
- date_from: 2024-01-01
- date_to: 2024-01-31
- metrics: engagement,preferences,predictions

Response: 200 OK
{
  "persona_id": "pers_123",
  "period": "2024-01-01 to 2024-01-31",
  "engagement_metrics": {
    "properties_viewed": 12,
    "average_interest_score": 0.73,
    "showings_requested": 3,
    "offers_made": 1
  },
  "preference_evolution": {
    "new_preferences_detected": ["home_gym", "guest_house"],
    "preference_strength_changes": {...}
  },
  "predictions": {
    "purchase_likelihood_30_days": 0.45,
    "preferred_property_type": "waterfront_estate",
    "budget_range_estimate": "$35M-$45M"
  }
}
```

### 5. WebSocket APIs

#### Real-time Simulation Updates
```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://api.tinytroupe-re.com/v1/ws/simulations/sim_8k7j6h5g');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your_api_key'
}));

// Receive updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  /* 
  {
    type: 'progress|result|error',
    simulation_id: 'sim_8k7j6h5g',
    progress: 0.45,
    current_step: 'analyzing_preferences',
    partial_results: {...}
  }
  */
};
```

### 6. Webhook Events

#### Webhook Payload Structure
```json
{
  "event_type": "simulation.completed|persona.enriched|match.found",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "object_type": "simulation|persona|match",
    "object_id": "sim_8k7j6h5g",
    "details": {...}
  },
  "metadata": {
    "brokerage_id": "brk_123",
    "agent_id": "agt_456",
    "api_version": "v1"
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "INVALID_PERSONA",
    "message": "The persona data provided is invalid",
    "details": {
      "field": "demographics.age_range",
      "issue": "Invalid format"
    },
    "request_id": "req_9m8n7b6v",
    "documentation_url": "https://docs.tinytroupe-re.com/errors/INVALID_PERSONA"
  }
}
```

### Error Codes
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (maintenance mode)

## ActivePieces Integration

### Node Configuration
```json
{
  "node_type": "tinytroupe",
  "version": "1.0.0",
  "inputs": {
    "api_key": {
      "type": "credential",
      "required": true
    },
    "operation": {
      "type": "select",
      "options": [
        "create_persona",
        "run_focus_group",
        "match_property",
        "test_campaign"
      ]
    },
    "parameters": {
      "type": "object",
      "schema": "dynamic_based_on_operation"
    }
  },
  "outputs": {
    "success": {
      "type": "boolean"
    },
    "result": {
      "type": "object"
    },
    "error": {
      "type": "object"
    }
  }
}
```

### Trigger Events
```json
{
  "triggers": [
    {
      "name": "new_property",
      "description": "Triggered when new property is listed",
      "output": {
        "property_id": "string",
        "property_data": "object"
      }
    },
    {
      "name": "persona_enriched",
      "description": "Triggered when persona enrichment completes",
      "output": {
        "persona_id": "string",
        "enrichment_type": "string",
        "new_insights": "array"
      }
    },
    {
      "name": "simulation_completed",
      "description": "Triggered when simulation finishes",
      "output": {
        "simulation_id": "string",
        "results": "object",
        "recommendations": "array"
      }
    }
  ]
}
```

## SDK Examples

### Python SDK
```python
from tinytroupe_client import TinyTroupeClient

client = TinyTroupeClient(api_key="your_api_key")

# Create persona
persona = client.personas.create(
    name="John Smith",
    demographics={
        "age_range": "45-55",
        "occupation": "Hedge Fund Manager"
    }
)

# Run focus group
simulation = client.simulations.focus_group(
    property_id="prop_123",
    persona_segments=["finance_executives"],
    test_scenarios=["photo_selection", "pricing"]
)

# Wait for results
results = simulation.wait_for_completion()
print(results.recommendations)
```

### JavaScript SDK
```javascript
import { TinyTroupeClient } from '@tinytroupe/client';

const client = new TinyTroupeClient({ apiKey: 'your_api_key' });

// Create persona
const persona = await client.personas.create({
  name: 'John Smith',
  demographics: {
    ageRange: '45-55',
    occupation: 'Hedge Fund Manager'
  }
});

// Run simulation
const simulation = await client.simulations.focusGroup({
  propertyId: 'prop_123',
  personaSegments: ['finance_executives']
});

// Stream results
simulation.on('progress', (update) => {
  console.log(`Progress: ${update.progress * 100}%`);
});

const results = await simulation.results();
```

## Batch Operations

### Batch Persona Creation
```http
POST /batch/personas
Content-Type: application/json

{
  "personas": [
    {...},  // Persona 1
    {...},  // Persona 2
    {...}   // Persona N (max 100)
  ],
  "options": {
    "continue_on_error": true,
    "return_errors": true
  }
}

Response: 207 Multi-Status
{
  "batch_id": "batch_5g6h7j8k",
  "successful": 98,
  "failed": 2,
  "results": [...],
  "errors": [...]
}
```

### Batch Simulation
```http
POST /batch/simulations
Content-Type: application/json

{
  "simulations": [
    {
      "type": "focus_group",
      "property_id": "prop_123",
      "params": {...}
    },
    {
      "type": "marketing_campaign",
      "campaign_id": "camp_456",
      "params": {...}
    }
  ],
  "execution": {
    "parallel": true,
    "max_concurrent": 5,
    "priority": "high"
  }
}
```

## Performance Guidelines

### Best Practices
1. Use batch operations for multiple similar requests
2. Implement webhook handlers instead of polling
3. Cache simulation results when possible
4. Use appropriate detail levels for simulations
5. Leverage WebSocket connections for real-time needs

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1642521600
X-RateLimit-Burst-Remaining: 45
```

### Pagination
```
Link: <https://api.tinytroupe-re.com/v1/personas?page=2>; rel="next",
      <https://api.tinytroupe-re.com/v1/personas?page=10>; rel="last"
X-Total-Count: 500
X-Page-Size: 50
X-Current-Page: 1
```