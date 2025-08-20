# Customer Intervention Testing API

## Overview

Test personalized interventions on digital twins of individual customers to predict their responses before actual outreach. This API enables you to model customer reactions to messages, offers, and communications based on their profile, history, and personality.

---

## Core Use Cases

1. **Personalized Marketing**: Test which message variant will resonate with each customer
2. **Churn Prevention**: Predict which retention offer will work for at-risk customers
3. **Upsell/Cross-sell**: Model receptiveness to upgrade offers
4. **Service Recovery**: Test apology/compensation messages after service failures
5. **Product Launch**: Predict individual customer interest in new products

---

## API Endpoints

### 1. Create Customer Digital Twin

Create a model of an individual customer based on their data.

**POST** `/api/v1/customers/digital-twin`

```json
{
  "customer_id": "cust_12345",
  "profile": {
    "age": 45,
    "location": "Seattle, WA",
    "income_bracket": "$100-150k",
    "family_status": "Married, 2 children"
  },
  "behavioral_data": {
    "purchase_frequency": "monthly",
    "average_order_value": 250,
    "lifetime_value": 12000,
    "preferred_channels": ["email", "mobile_app"],
    "browsing_patterns": "researches thoroughly before purchase"
  },
  "history": {
    "customer_since": "2019-03-15",
    "total_purchases": 48,
    "returns": 2,
    "support_interactions": 5,
    "satisfaction_scores": [4, 5, 3, 5, 4]
  },
  "psychographic_traits": [
    "quality_focused",
    "brand_loyal", 
    "time_constrained"
  ],
  "context": "Premium customer, early adopter, influences others in network"
}
```

**Response**:
```json
{
  "digital_twin_id": "twin_cust_12345",
  "customer_id": "cust_12345",
  "model_confidence": 0.85,
  "personality_summary": "Analytical decision-maker who values quality and efficiency",
  "key_drivers": ["quality", "convenience", "brand_reputation"],
  "communication_preferences": {
    "tone": "professional",
    "detail_level": "high",
    "persuasion_style": "logical"
  }
}
```

### 2. Test Single Intervention

Test how a specific customer would respond to an intervention.

**POST** `/api/v1/intervention-testing/test`

```json
{
  "digital_twin_id": "twin_cust_12345",
  "intervention": {
    "type": "promotional_offer",
    "channel": "email",
    "content": "Exclusive for you: 30% off our new premium line, this weekend only",
    "timing": "friday_morning",
    "personalization_level": "high"
  },
  "predict": [
    "will_engage",
    "will_purchase", 
    "purchase_amount",
    "satisfaction_impact",
    "brand_perception_change"
  ]
}
```

**Response**:
```json
{
  "intervention_id": "test_abc123",
  "predictions": {
    "will_engage": {
      "likelihood": 0.78,
      "confidence": 0.82,
      "reasoning": "Customer historically responds well to exclusive offers"
    },
    "will_purchase": {
      "likelihood": 0.65,
      "confidence": 0.75,
      "reasoning": "Moderate interest due to recent purchase, but appreciates premium line"
    },
    "purchase_amount": {
      "estimated_value": 180,
      "range": [120, 250],
      "confidence": 0.70
    },
    "satisfaction_impact": {
      "change": 0.1,
      "reasoning": "Positive response to personalized attention"
    },
    "brand_perception_change": {
      "change": 0.05,
      "reasoning": "Reinforces premium brand association"
    }
  },
  "key_factors": {
    "positive": ["exclusivity", "premium_products", "weekend_timing"],
    "negative": ["recent_purchase_saturation", "price_consciousness"],
    "suggestions": ["Emphasize limited availability", "Include free shipping"]
  },
  "predicted_response": "I appreciate the exclusive offer. The 30% discount is appealing for premium items. I might pick up one or two pieces I've been considering, though I just made a purchase last week."
}
```

### 3. Test Multiple Variants

Compare how a customer would respond to different intervention variants.

**POST** `/api/v1/intervention-testing/compare-variants`

```json
{
  "digital_twin_id": "twin_cust_12345",
  "variants": [
    {
      "id": "A",
      "content": "30% off this weekend only - exclusive for loyal customers"
    },
    {
      "id": "B", 
      "content": "Buy 2 get 1 free on our entire premium collection"
    },
    {
      "id": "C",
      "content": "Early access: New premium line before anyone else"
    }
  ],
  "intervention_type": "promotional_email",
  "predict": ["engagement_rate", "conversion_rate", "revenue_impact"]
}
```

**Response**:
```json
{
  "comparison_id": "comp_xyz789",
  "rankings": [
    {
      "variant_id": "C",
      "rank": 1,
      "engagement_rate": 0.85,
      "conversion_rate": 0.70,
      "revenue_impact": 220,
      "reasoning": "Early access appeals to customer's early adopter personality"
    },
    {
      "variant_id": "A",
      "rank": 2,
      "engagement_rate": 0.78,
      "conversion_rate": 0.65,
      "revenue_impact": 180
    },
    {
      "variant_id": "B",
      "rank": 3,
      "engagement_rate": 0.60,
      "conversion_rate": 0.45,
      "revenue_impact": 150
    }
  ],
  "recommendation": {
    "best_variant": "C",
    "confidence": 0.79,
    "explanation": "Variant C aligns best with customer's early adopter traits and premium preferences"
  }
}
```

### 4. Batch Testing

Test interventions across multiple customers.

**POST** `/api/v1/intervention-testing/batch`

```json
{
  "customer_segment": "high_value_at_risk",
  "digital_twin_ids": ["twin_cust_12345", "twin_cust_67890", "twin_cust_11111"],
  "intervention": {
    "type": "retention_offer",
    "content": "We miss you! Here's 40% off your next purchase"
  },
  "analyze": true
}
```

**Response**:
```json
{
  "batch_id": "batch_aaa111",
  "total_tested": 3,
  "aggregate_predictions": {
    "average_engagement": 0.72,
    "average_conversion": 0.55,
    "expected_revenue": 4500,
    "retention_improvement": 0.25
  },
  "individual_results": [
    {
      "digital_twin_id": "twin_cust_12345",
      "will_engage": 0.85,
      "will_convert": 0.70,
      "predicted_value": 200
    }
  ],
  "segment_insights": {
    "most_effective_for": "brand_loyal + quality_focused",
    "least_effective_for": "price_sensitive + infrequent_buyers",
    "optimal_timing": "tuesday_evening",
    "suggested_improvements": [
      "Add personal note about missed products",
      "Include product recommendations based on history"
    ]
  }
}
```

### 5. Optimal Message Discovery

Find the best message for a specific customer through AI optimization.

**POST** `/api/v1/intervention-testing/optimize`

```json
{
  "digital_twin_id": "twin_cust_12345",
  "objective": "maximize_purchase_probability",
  "constraints": {
    "discount_max": 0.30,
    "message_length_max": 100,
    "tone": "professional"
  },
  "context": {
    "occasion": "customer_birthday",
    "product_focus": "premium_line",
    "urgency": "low"
  }
}
```

**Response**:
```json
{
  "optimized_message": {
    "content": "Happy Birthday! Celebrate with early access to our new premium collection, plus 25% off as our gift to you. Valid all month.",
    "predicted_engagement": 0.92,
    "predicted_conversion": 0.78,
    "confidence": 0.81
  },
  "optimization_insights": {
    "key_elements": [
      "Personal occasion recognition",
      "Early access exclusivity",
      "Reasonable discount",
      "Extended validity reduces pressure"
    ],
    "avoided_elements": [
      "High pressure tactics",
      "Generic messaging",
      "Excessive discounting"
    ]
  }
}
```

---

## Response Prediction Fields

Each test can predict various customer responses:

### Behavioral Predictions
- `will_open` - Probability of opening message
- `will_click` - Probability of clicking through
- `will_purchase` - Probability of making purchase
- `will_share` - Probability of sharing with others
- `will_unsubscribe` - Risk of unsubscribing

### Value Predictions
- `purchase_amount` - Predicted order value
- `lifetime_value_impact` - Change in CLV
- `items_purchased` - Number of items
- `category_preference` - Which products interest them

### Sentiment Predictions
- `emotional_response` - Positive/negative/neutral
- `brand_perception_change` - Impact on brand view
- `satisfaction_change` - Impact on satisfaction score
- `loyalty_impact` - Effect on retention

### Timing Predictions
- `response_time` - How quickly they'll respond
- `optimal_followup` - Best time for next contact
- `purchase_window` - When purchase likely to occur

---

## TinyTroupe Pattern Implementation

Following the exact patterns from TinyTroupe notebook examples:

### Complete Flow Example

```python
import requests

base_url = "http://localhost:8000/api/v1"

# 1. BEGIN SESSION (control.begin pattern)
session = requests.post(f"{base_url}/simulation-control/sessions/begin", json={
    "session_name": "customer_intervention_testing",
    "cache_file": "customer_intervention_test.cache.json",
    "description": "Testing personalized offers on customer digital twins"
}).json()

session_id = session["session_id"]

# 2. CREATE CUSTOMER DIGITAL TWINS (TinyPersonFactory pattern)
customer_twins = []
for customer_data in customer_database:
    twin = requests.post(f"{base_url}/content/grounding/create-grounded-persona", json={
        "name": f"customer_twin_{customer_data['id']}",
        "grounding_sources": [
            {"type": "crm_profile", "content": json.dumps(customer_data)},
            {"type": "purchase_history", "content": customer_data["purchases"]},
            {"type": "behavioral_data", "content": customer_data["behavior"]}
        ],
        "personality_fragments": infer_personality_traits(customer_data),
        "context": f"Customer since {customer_data['join_date']}, CLV: ${customer_data['clv']}"
    }).json()
    customer_twins.append(twin)

# 3. CHECKPOINT AFTER TWIN CREATION (control.checkpoint pattern)
checkpoint1 = requests.post(
    f"{base_url}/simulation-control/sessions/{session_id}/checkpoint",
    json={
        "checkpoint_name": "twins_created",
        "description": "Customer digital twins generated"
    }
).json()

# 4. RUN INTERVENTION SIMULATIONS (TinyWorld.broadcast + run pattern)
intervention_results = []
for twin in customer_twins:
    # Test intervention using individual simulation
    result = requests.post(f"{base_url}/simulate/individual-interaction", json={
        "session_id": session_id,  # Link to session
        "participants": {
            "mode": "from_persona",
            "persona_id": twin["persona_id"]
        },
        "stimulus": {
            "type": "marketing_message",
            "content": "Exclusive offer: 30% off your favorite products this weekend only!",
            "context": {"channel": "email", "timing": "friday_morning"}
        },
        "interaction_config": {
            "rounds": 1,
            "enable_memory": True
        },
        "extraction_config": {
            "extract_results": True,
            "extraction_objective": "Extract customer response likelihood and purchase intent",
            "fields": ["will_engage", "will_purchase", "purchase_amount", "emotional_response", "concerns"],
            "extraction_hint": "Focus on likelihood scores from 0.0 to 1.0 and reasoning"
        }
    }).json()
    
    intervention_results.append(result)

# 5. CHECKPOINT AFTER SIMULATIONS (control.checkpoint pattern)
checkpoint2 = requests.post(
    f"{base_url}/simulation-control/sessions/{session_id}/checkpoint",
    json={
        "checkpoint_name": "interventions_tested",
        "description": "All customer interventions simulated"
    }
).json()

# 6. EXTRACT STRUCTURED RESULTS (ResultsExtractor pattern)
aggregated_results = requests.post(f"{base_url}/simulate/extract/structured-results", json={
    "session_id": session_id,
    "checkpoint_name": "interventions_tested",
    "extraction_objective": "Aggregate intervention effectiveness across all customers",
    "result_type": "structured",
    "fields": ["customer_id", "engagement_likelihood", "purchase_likelihood", "predicted_revenue"],
    "statistical_analysis": True
}).json()

# 7. END SESSION (control.end pattern)
requests.delete(f"{base_url}/simulation-control/sessions/{session_id}/end")

# 8. ANALYZE RESULTS
print(f"Average engagement likelihood: {aggregated_results['statistics']['mean_engagement']:.2%}")
print(f"Predicted total revenue: ${aggregated_results['statistics']['total_predicted_revenue']:,.2f}")
print(f"Customers likely to engage: {aggregated_results['statistics']['high_engagement_count']}")
```

### Session-Aware Endpoints

All customer intervention endpoints must be session-aware:

#### Enhanced Individual Intervention Test

**POST** `/api/v1/intervention-testing/test`

```json
{
  "session_id": "session_uuid",
  "digital_twin_id": "twin_cust_12345",
  "intervention": {
    "type": "promotional_offer",
    "content": "Exclusive for you: 30% off our new premium line",
    "timing": "friday_morning",
    "channel": "email"
  },
  "interaction_config": {
    "rounds": 1,
    "enable_memory": true,
    "enable_thinking": true
  },
  "extraction_config": {
    "extract_results": true,
    "extraction_objective": "Predict customer response and purchase behavior",
    "fields": ["will_engage", "will_purchase", "purchase_amount", "emotional_response"],
    "extraction_hint": "Provide likelihood scores and detailed reasoning"
  }
}
```

#### Batch Intervention Testing with Session Management

**POST** `/api/v1/intervention-testing/batch`

```json
{
  "session_id": "session_uuid",
  "customer_segment": "high_value_customers",
  "digital_twin_ids": ["twin_001", "twin_002", "twin_003"],
  "intervention_variants": [
    {
      "id": "discount_30",
      "content": "30% off this weekend only"
    },
    {
      "id": "early_access",
      "content": "Early access to new collection"
    }
  ],
  "test_config": {
    "mode": "compare_variants",
    "rounds": 1,
    "enable_memory": true
  },
  "extraction_config": {
    "extract_results": true,
    "fields": ["variant_preference", "engagement_score", "purchase_likelihood"],
    "statistical_analysis": true
  }
}
```

### Results Extraction Pattern

Following `ResultsExtractor.extract_results_from_agents()` pattern:

**POST** `/api/v1/intervention-testing/extract-results`

```json
{
  "session_id": "session_uuid",
  "checkpoint_name": "interventions_completed",
  "extraction_objective": "Extract customer intervention effectiveness metrics",
  "situation": "Customers were presented with personalized marketing offers",
  "fields": [
    "customer_id",
    "intervention_variant", 
    "engagement_likelihood",
    "purchase_likelihood",
    "predicted_order_value",
    "emotional_sentiment",
    "key_concerns",
    "optimal_timing"
  ],
  "fields_hints": {
    "engagement_likelihood": "Score from 0.0 to 1.0 indicating probability of engagement",
    "purchase_likelihood": "Score from 0.0 to 1.0 indicating probability of purchase",
    "predicted_order_value": "Dollar amount of predicted purchase",
    "emotional_sentiment": "positive, neutral, or negative",
    "optimal_timing": "best time to send follow-up communication"
  },
  "aggregation": {
    "enable_statistics": true,
    "groupby": ["customer_segment", "intervention_variant"],
    "metrics": ["mean", "std", "confidence_interval"]
  }
}
```

**Response Structure:**
```json
{
  "extraction_id": "extract_xyz789",
  "session_id": "session_uuid", 
  "individual_results": [
    {
      "customer_id": "cust_12345",
      "intervention_variant": "discount_30",
      "engagement_likelihood": 0.78,
      "purchase_likelihood": 0.65,
      "predicted_order_value": 180,
      "emotional_sentiment": "positive",
      "key_concerns": ["price_sensitivity", "timing"],
      "reasoning": "Customer responds well to discounts but recent purchase may reduce urgency"
    }
  ],
  "aggregate_statistics": {
    "total_customers_tested": 100,
    "mean_engagement": 0.72,
    "mean_purchase_likelihood": 0.58,
    "predicted_total_revenue": 18500,
    "confidence_interval": [16200, 20800],
    "best_performing_variant": "early_access"
  },
  "segment_analysis": {
    "high_value_customers": {
      "engagement_rate": 0.85,
      "purchase_rate": 0.70,
      "avg_order_value": 220
    },
    "regular_customers": {
      "engagement_rate": 0.65,
      "purchase_rate": 0.50,  
      "avg_order_value": 150
    }
  },
  "recommendations": {
    "best_overall_strategy": "Use early access for high-value, discount for regular customers",
    "optimal_timing": "friday_morning",
    "expected_roi": 3.2
  }
}
```

---

## Infrastructure Requirements

To properly support customer intervention testing, we need all core TinyTroupe infrastructure:

### 1. Session Management (SimulationControlService)
- **Required**: All intervention tests must run within a session
- **Pattern**: `control.begin()` → operations → `control.checkpoint()` → `control.end()`
- **Caching**: All customer twins and results cached to session file
- **Recovery**: Ability to restore from checkpoints if tests are interrupted

### 2. Agent Memory Management
- **Customer Context**: Digital twins maintain conversation history
- **Memory Consolidation**: Long customer histories compressed appropriately  
- **State Persistence**: Customer twins remember previous interventions tested

### 3. Results Extraction Pipeline
- **Field-Based Extraction**: Structured data from customer responses
- **Statistical Analysis**: Confidence intervals, significance testing
- **Aggregation**: Roll up individual predictions to segment insights
- **Export Formats**: JSON, CSV, DataFrame-compatible

### 4. Quality Assurance
- **Validation**: Verify customer twins match expected profiles
- **Confidence Scoring**: Rate reliability of predictions
- **A/B Testing**: Compare prediction accuracy against real outcomes

### 5. Scalability Infrastructure
- **Parallel Processing**: Test multiple customers simultaneously
- **Batch Operations**: Handle 1000+ customer tests efficiently
- **Resource Management**: Monitor LLM API usage and costs
- **Rate Limiting**: Respect API quotas and timeout handling

### Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Session Management | ✅ **Ready** | SimulationControlService fully implements control patterns |
| Agent Memory | ✅ **Ready** | TinyPerson memory system supports intervention history |
| Results Extraction | ✅ **Ready** | Field-based extraction with statistical analysis |
| Parallel Processing | ✅ **Ready** | Population service handles bulk operations |
| Grounded Personas | ✅ **Ready** | Content grounding service creates customer twins |
| Quality Validation | ⚠️ **Partial** | Basic validation exists, needs customer-specific checks |
| Cost Monitoring | ⚠️ **Basic** | Logging exists, needs cost prediction features |

### Required Service Integrations

```python
# Customer intervention testing uses ALL core services:

# 1. SimulationControlService - Session management
session = simulation_control_service.begin_session("customer_intervention_test.cache.json")

# 2. PopulationService - Create customer digital twins  
customer_twin = population_service.create_grounded_persona(customer_data)

# 3. SimulationService - Run intervention simulations
result = simulation_service.run_individual_simulation(customer_twin, intervention)

# 4. ResultsExtractor - Extract structured predictions
predictions = results_extractor.extract_results_from_agent(
    customer_twin, 
    extraction_objective="Predict customer response", 
    fields=["engagement", "purchase_intent"]
)

# 5. ValidationFramework - Verify prediction quality
validation = validation_service.validate_prediction_quality(predictions, confidence_threshold=0.7)

# 6. SimulationControlService - End session
simulation_control_service.end_session(session.id)
```

---

## Benefits

1. **Risk-Free Testing**: Test messages before sending to real customers
2. **Personalization at Scale**: Optimize for each individual, not segments
3. **Higher Conversion**: Send only messages likely to succeed
4. **Reduced Churn**: Avoid messages that might annoy customers
5. **Learning System**: Continuously improve models with actual outcomes

---

## Next Steps for Implementation

1. **Enhance Grounding Service** to accept structured customer data
2. **Create Dedicated Endpoints** for cleaner customer intervention API
3. **Add Prediction Confidence** scoring to results extraction
4. **Build Response Templates** for common intervention types
5. **Implement Caching** for customer digital twins

This is achievable with minor enhancements to our existing TinyTroupe API infrastructure!