# Product Requirements Document: Calibrated Intervention Testing Platform
## Industry-Agnostic Marketing & Outreach Simulation Service

### Version 2.0 - December 2024

## Executive Summary

This PRD defines a microservice platform that combines TinyTroupe's LLM-powered persona simulations with causal machine learning to create a calibrated intervention testing system. The platform enables organizations across industries to simulate and optimize marketing campaigns, outreach sequences, and behavioral interventions before deployment, with continuous calibration against real-world outcomes.

## Core Innovation

The platform uniquely combines:
1. **Causal ML backbone** (CATE/uplift models, Bayesian MMM) for numeric truth
2. **TinyTroupe personas** for qualitative reasoning and content sensitivity  
3. **DSPy optimization** to keep simulations aligned with historical reality
4. **Industry-agnostic design** applicable to retail, telecom, finance, healthcare, real estate, etc.

## Problem Statement

### Universal Marketing Challenges
1. **Intervention Uncertainty**: Cannot predict campaign impact before spending resources
2. **Channel Fatigue**: Risk of unsubscribes/complaints from over-communication
3. **Personalization at Scale**: Difficulty optimizing content/timing for diverse segments
4. **Cross-Channel Effects**: Unknown interactions between marketing channels
5. **ROI Attribution**: Unclear which interventions drive actual uplift

### Current Solution Gaps
- A/B tests are slow and expose customers to suboptimal experiences
- Rule-based personalization lacks nuance and adaptability
- Historical analytics don't predict novel intervention outcomes
- Existing simulations lack calibration to real-world data

## Solution Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────────┐
│         Qualitative Layer (LLM)             │
│   TinyTroupe Personas + DSPy Optimization   │
│     • Intent modeling                       │
│     • Content evaluation                    │
│     • Behavioral reasoning                  │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│      Calibration Layer (DSPy + SMM)         │
│     • Prompt optimization                   │
│     • Moment matching                       │
│     • Continuous alignment                  │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│       Quantitative Layer (Causal ML)        │
│        CATE/Uplift + Bayesian MMM          │
│     • Numeric probabilities                 │
│     • Channel elasticities                  │
│     • Uplift estimation                     │
└─────────────────────────────────────────────┘
```

### Key Principle: Separation of Concerns
- **LLMs** provide reasoning, rationales, and intent deltas
- **Causal models** provide all numeric probabilities and KPIs
- **DSPy** ensures LLM outputs align with historical patterns
- This prevents "hallucinated metrics" while maintaining content sensitivity

## Data Schema (Industry-Agnostic)

### Core Tables

```sql
-- Universal member/entity table
entities (
    entity_id UUID PRIMARY KEY,
    segment_id VARCHAR,
    created_at TIMESTAMP,
    attributes JSONB,  -- Industry-specific fields
    lifecycle_stage VARCHAR,
    value_tier VARCHAR
)

-- Intervention exposures
exposures (
    exposure_id UUID PRIMARY KEY,
    entity_id UUID,
    timestamp TIMESTAMP,
    channel VARCHAR,
    intervention_id VARCHAR,
    content JSONB,
    cost DECIMAL,
    frequency_cumulative INTEGER
)

-- Outcomes (flexible for any industry)
outcomes (
    outcome_id UUID PRIMARY KEY,
    entity_id UUID,
    timestamp TIMESTAMP,
    outcome_type VARCHAR,  -- open, click, purchase, subscribe, churn, etc.
    outcome_value DECIMAL,
    metadata JSONB
)

-- Intervention definitions
interventions (
    intervention_id UUID PRIMARY KEY,
    type VARCHAR,  -- email, sms, push, mail, call, etc.
    content_template TEXT,
    creative_elements JSONB,
    targeting_criteria JSONB
)

-- Segment definitions
segments (
    segment_id VARCHAR PRIMARY KEY,
    definition JSONB,
    size INTEGER,
    trait_priors JSONB,
    historical_metrics JSONB
)
```

## API Design for ActivePieces Integration

### Universal Simulation Endpoint

```http
POST /api/v1/simulate
Content-Type: application/json

{
  "simulation_type": "intervention_test",
  "industry_context": "retail|telecom|finance|healthcare|realestate",
  
  "intervention": {
    "type": "campaign|sequence|policy_change",
    "channels": ["email", "sms", "push"],
    "content_variants": [
      {
        "id": "variant_a",
        "template": "...",
        "personalization_fields": ["name", "last_purchase", "preferences"]
      }
    ],
    "timing": {
      "schedule": "immediate|scheduled|triggered",
      "cadence": "daily|weekly|event_based",
      "frequency_cap": 3
    }
  },
  
  "target_population": {
    "selection_method": "segment|model_score|random",
    "segments": ["high_value", "at_risk", "new_users"],
    "size": 10000,
    "filters": {
      "min_tenure_days": 30,
      "max_frequency_last_30d": 5
    }
  },
  
  "simulation_params": {
    "num_personas": 100,
    "time_horizon_days": 30,
    "monte_carlo_runs": 100,
    "calibration_mode": "historical|projected",
    "include_externalities": true
  },
  
  "success_metrics": [
    "conversion_rate",
    "revenue_uplift", 
    "unsubscribe_rate",
    "customer_lifetime_value",
    "custom_kpi"
  ],
  
  "constraints": {
    "max_budget": 10000,
    "max_unsubscribe_rate": 0.02,
    "min_roi": 1.5
  }
}
```

### Response Structure

```json
{
  "simulation_id": "sim_abc123",
  "status": "completed",
  
  "predictions": {
    "expected_outcomes": {
      "conversion_rate": {
        "value": 0.045,
        "confidence_interval": [0.041, 0.049],
        "uplift_vs_control": 0.012
      },
      "revenue": {
        "value": 125000,
        "confidence_interval": [115000, 135000],
        "roi": 2.3
      },
      "unsubscribe_rate": {
        "value": 0.015,
        "risk_level": "acceptable"
      }
    },
    
    "segment_breakdown": [
      {
        "segment": "high_value",
        "response_rate": 0.08,
        "revenue_contribution": 0.6,
        "risk_factors": ["saturation"]
      }
    ],
    
    "optimal_configuration": {
      "channels": ["email", "push"],
      "timing": "tuesday_morning",
      "content_variant": "variant_a",
      "expected_uplift": 0.023
    }
  },
  
  "insights": [
    {
      "finding": "High-value segment shows 3x response to urgency messaging",
      "confidence": 0.85,
      "recommendation": "Prioritize urgency framing for top 20% customers"
    }
  ],
  
  "calibration_quality": {
    "historical_accuracy": 0.92,
    "drift_detected": false,
    "last_calibration": "2024-12-10T08:00:00Z"
  }
}
```

## Technical Components

### 1. Causal ML Layer

```python
# X-Learner for heterogeneous treatment effects
from econml.metalearners import XLearner
from causalml.inference.meta import BaseDRRegressor

class CausalBackbone:
    def __init__(self):
        self.uplift_model = XLearner(
            models=LGBMRegressor(),
            propensity_model=LGBMClassifier()
        )
        self.mmm = BayesianMMM()  # PyMC/NumPyro
        self.hazard_model = SurvivalModel()  # Unsubscribe risk
    
    def estimate_uplift(self, X, T, Y):
        """Estimate CATE for intervention"""
        return self.uplift_model.fit(Y, T, X).effect(X)
    
    def get_channel_elasticity(self, channel, spend):
        """Get diminishing returns from MMM"""
        return self.mmm.elasticity(channel, spend)
```

### 2. TinyTroupe Integration

```python
from tinytroupe import TinyPerson, TinyWorld

class PersonaFactory:
    def create_from_segment(self, segment_data):
        """Create calibrated persona from segment"""
        return TinyPerson(
            traits=self.extract_traits(segment_data),
            preferences=self.extract_preferences(segment_data),
            behavioral_model=self.calibrated_behavior
        )
    
    def calibrated_behavior(self, stimulus, context):
        """Behavior calibrated via DSPy"""
        intent_delta = self.dspy_module(stimulus, context)
        # Map to numeric via causal layer
        return self.causal.map_intent_to_probability(intent_delta)
```

### 3. DSPy Optimization Layer

```python
import dspy

class InterventionEvaluator(dspy.Module):
    def __init__(self):
        self.evaluate = dspy.ChainOfThought("persona, intervention -> intent_change, rationale")
    
    def forward(self, persona, intervention):
        return self.evaluate(
            persona=persona.to_prompt(),
            intervention=intervention.to_prompt()
        )

# Optimization against historical data
def calibration_metric(examples, predictions):
    """Compare simulated vs actual outcomes"""
    ranking_accuracy = kendalltau(predictions.ranks, examples.actual_ranks)
    moment_match = mse(predictions.moments, examples.historical_moments)
    return 0.5 * ranking_accuracy + 0.5 * (1 - moment_match)

optimizer = dspy.BootstrapFewShotWithRandomSearch(
    metric=calibration_metric,
    max_bootstrapped_demos=4,
    num_candidate_programs=10
)

calibrated_evaluator = optimizer.compile(
    InterventionEvaluator(),
    trainset=historical_interventions
)
```

### 4. Calibration & Reconciliation

```python
class SimulationCalibrator:
    def __init__(self):
        self.smm = SimulatedMethodOfMoments()
        self.raking = RakingCalibrator()
    
    def calibrate_personas(self, personas, historical_data):
        """Adjust persona weights to match historical moments"""
        target_moments = self.compute_moments(historical_data)
        
        def objective(weights):
            simulated_moments = self.simulate_with_weights(personas, weights)
            return mse(simulated_moments, target_moments)
        
        optimal_weights = minimize(objective, initial_weights)
        return self.apply_weights(personas, optimal_weights)
    
    def reconcile_micro_macro(self, micro_predictions, macro_constraints):
        """Ensure individual predictions sum to MMM totals"""
        return self.raking.adjust(micro_predictions, macro_constraints)
```

## Implementation Phases

### Phase 1: MVP Foundation (Weeks 1-4)
- Basic causal ML pipeline (X-Learner + simple MMM)
- TinyTroupe persona creation for 5-10 archetypes
- Single intervention simulator
- Historical backtest capability

### Phase 2: DSPy Integration (Weeks 5-8)
- Implement DSPy modules for evaluation
- Calibration against historical campaigns
- Ranking and moment loss optimization
- Continuous learning pipeline

### Phase 3: Production API (Weeks 9-12)
- FastAPI service with ActivePieces node
- Multi-industry templates
- Real-time simulation endpoints
- Validation and monitoring dashboards

### Phase 4: Advanced Features (Weeks 13-16)
- Multi-touch attribution
- Sequential intervention optimization
- Competitive response modeling
- Fairness constraints

## Success Metrics

### Technical Metrics
- **Calibration Accuracy**: >90% correlation with historical outcomes
- **Simulation Speed**: <30s for 1000-persona simulation
- **API Latency**: p95 < 500ms for standard requests
- **Drift Detection**: <5% unexplained variance month-over-month

### Business Metrics
- **Prediction Accuracy**: Within 10% of actual campaign results
- **ROI Improvement**: 20-40% uplift vs baseline campaigns
- **Risk Reduction**: 50% fewer failed campaigns
- **Time to Insight**: 10x faster than A/B testing

## Industry Applications

### Retail
- Promotion effectiveness testing
- Email cadence optimization
- Cross-sell/upsell timing

### Telecom
- Churn prevention campaigns
- Plan upgrade messaging
- Network outage communications

### Financial Services
- Credit card offer optimization
- Investment product marketing
- Fraud alert tuning

### Healthcare
- Appointment reminders
- Medication adherence campaigns
- Preventive care outreach

### Real Estate
- Property matching
- Open house invitations
- Market update frequency

## Risk Mitigation

### Technical Risks
- **Model Drift**: Continuous recalibration with new data
- **LLM Hallucination**: Numeric outputs always from causal layer
- **Scalability**: Horizontal scaling, caching, async processing

### Business Risks
- **Trust Building**: Extensive backtesting and gradual rollout
- **Regulatory Compliance**: Built-in fairness constraints
- **Data Quality**: Robust validation and missing data handling

## Appendix: Integration Examples

### ActivePieces Node Configuration

```yaml
name: calibrated-intervention-simulator
version: 1.0.0
description: Simulate marketing interventions with calibrated personas

inputs:
  - name: intervention_config
    type: object
    required: true
  - name: target_audience  
    type: object
    required: true
  - name: success_metrics
    type: array
    required: true
  - name: constraints
    type: object
    required: false

outputs:
  - name: predictions
    type: object
  - name: recommendations
    type: array
  - name: risk_assessment
    type: object

actions:
  - simulate_campaign
  - optimize_sequence
  - predict_uplift
  - evaluate_creative
```

### Python SDK Usage

```python
from tinytroupe_calibrated import CalibratedSimulator

sim = CalibratedSimulator(
    api_key="...",
    industry="retail"
)

# Run intervention test
result = sim.test_intervention(
    intervention={
        "type": "email_campaign",
        "content": email_html,
        "segments": ["loyal_customers", "at_risk"]
    },
    metrics=["conversion", "revenue", "unsubscribe"],
    constraints={"max_frequency": 2, "budget": 5000}
)

print(f"Expected ROI: {result.roi:.2f}")
print(f"Optimal send time: {result.optimal_timing}")
print(f"Risk assessment: {result.risks}")
```

This platform provides a robust, industry-agnostic solution for intervention testing that combines the best of causal ML and LLM-powered simulations, continuously calibrated against real-world data.