# Cross-Industry Data Schema Specification
## Universal Data Model for Intervention Testing

### Version 1.0 - December 2024

## Overview

This document defines a flexible, extensible data schema that supports intervention testing across multiple industries while maintaining consistency for the core simulation engine.

## Core Philosophy

1. **Universal Core**: Common fields that apply to all industries
2. **Industry Extensions**: JSONB fields for industry-specific attributes
3. **Temporal Consistency**: All events tracked with timestamps
4. **Hierarchical Flexibility**: Support for nested entity relationships

## Universal Core Schema

### 1. Entities Table (Universal)

```sql
CREATE TABLE entities (
    -- Core Identity
    entity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'individual', 'household', 'business', 'property'
    external_id VARCHAR(255), -- Original ID from source system
    
    -- Segmentation
    segment_id VARCHAR(100),
    subsegment_ids TEXT[], -- Multiple subsegments allowed
    cohort_id VARCHAR(100),
    
    -- Lifecycle
    lifecycle_stage VARCHAR(50), -- 'prospect', 'new', 'active', 'at_risk', 'churned'
    tenure_days INTEGER,
    first_interaction_date DATE,
    last_interaction_date DATE,
    
    -- Value Metrics
    lifetime_value DECIMAL(15,2),
    current_value_score DECIMAL(5,2), -- 0-100 normalized score
    risk_score DECIMAL(5,2), -- 0-100 churn/default risk
    
    -- Behavioral Indicators
    engagement_score DECIMAL(5,2), -- 0-100
    responsiveness_score DECIMAL(5,2), -- 0-100
    
    -- Industry-Specific Extensions
    demographics JSONB, -- Age, income, location, etc.
    preferences JSONB, -- Product preferences, communication preferences
    attributes JSONB, -- Any industry-specific attributes
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    data_quality_score DECIMAL(3,2), -- 0-1 completeness score
    
    -- Indexing
    INDEX idx_segment (segment_id),
    INDEX idx_lifecycle (lifecycle_stage),
    INDEX idx_value (lifetime_value DESC),
    INDEX idx_updated (updated_at DESC)
);
```

### 2. Interventions Table

```sql
CREATE TABLE interventions (
    intervention_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Definition
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'campaign', 'trigger', 'test', 'policy'
    category VARCHAR(100), -- 'acquisition', 'retention', 'upsell', 'winback'
    
    -- Channels
    channels TEXT[], -- ['email', 'sms', 'push', 'mail', 'call', 'display']
    primary_channel VARCHAR(50),
    
    -- Content
    content_template TEXT,
    creative_ids TEXT[],
    personalization_fields TEXT[],
    
    -- Targeting
    target_segments TEXT[],
    inclusion_criteria JSONB,
    exclusion_criteria JSONB,
    
    -- Timing
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    schedule_type VARCHAR(50), -- 'immediate', 'scheduled', 'triggered', 'recurring'
    schedule_details JSONB,
    
    -- Constraints
    budget DECIMAL(12,2),
    max_exposures_per_entity INTEGER,
    min_days_between_exposures INTEGER,
    
    -- Industry Extensions
    offer_details JSONB,
    compliance_flags JSONB,
    metadata JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'approved', 'active', 'paused', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);
```

### 3. Exposures Table

```sql
CREATE TABLE exposures (
    exposure_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    entity_id UUID REFERENCES entities(entity_id),
    intervention_id UUID REFERENCES interventions(intervention_id),
    
    -- Exposure Details
    channel VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    
    -- Content Specifics
    creative_variant VARCHAR(100),
    personalized_content JSONB,
    
    -- Delivery Metrics
    delivery_status VARCHAR(50), -- 'sent', 'delivered', 'bounced', 'blocked'
    delivery_metadata JSONB,
    
    -- Cost
    cost DECIMAL(10,4),
    
    -- Context
    exposure_number INTEGER, -- Nth exposure in sequence
    days_since_last_exposure INTEGER,
    total_previous_exposures INTEGER,
    
    -- Industry Extensions
    context JSONB,
    
    -- Indexing
    INDEX idx_entity_time (entity_id, timestamp DESC),
    INDEX idx_intervention (intervention_id, timestamp DESC),
    INDEX idx_channel_time (channel, timestamp DESC)
);
```

### 4. Outcomes Table

```sql
CREATE TABLE outcomes (
    outcome_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    entity_id UUID REFERENCES entities(entity_id),
    exposure_id UUID REFERENCES exposures(exposure_id), -- Nullable for organic outcomes
    
    -- Outcome Details
    outcome_type VARCHAR(100) NOT NULL, -- See outcome types per industry
    outcome_timestamp TIMESTAMP NOT NULL,
    
    -- Value
    outcome_value DECIMAL(15,2), -- Monetary value if applicable
    outcome_count INTEGER DEFAULT 1, -- For aggregatable outcomes
    
    -- Attribution
    attribution_model VARCHAR(50), -- 'last_touch', 'first_touch', 'linear', 'ml_model'
    attribution_weight DECIMAL(3,2) DEFAULT 1.0,
    
    -- Additional Data
    metadata JSONB,
    
    -- Indexing
    INDEX idx_entity_outcome (entity_id, outcome_timestamp DESC),
    INDEX idx_type_time (outcome_type, outcome_timestamp DESC),
    INDEX idx_exposure (exposure_id)
);
```

### 5. Segments Table

```sql
CREATE TABLE segments (
    segment_id VARCHAR(100) PRIMARY KEY,
    
    -- Definition
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Rules
    definition_type VARCHAR(50), -- 'rule_based', 'ml_model', 'manual', 'imported'
    definition_rules JSONB,
    
    -- Size & Composition
    current_size INTEGER,
    size_history JSONB[], -- Track size over time
    
    -- Behavioral Profiles
    avg_lifetime_value DECIMAL(12,2),
    avg_response_rate DECIMAL(5,4),
    avg_conversion_rate DECIMAL(5,4),
    
    -- Persona Traits (for simulation)
    trait_distributions JSONB, -- Statistical distributions of traits
    behavioral_patterns JSONB,
    preference_profiles JSONB,
    
    -- Industry Extensions
    industry_metrics JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

## Industry-Specific Extensions

### Retail/E-commerce

```sql
-- Entity Extensions (in attributes JSONB)
{
    "customer_type": "b2c|b2b",
    "loyalty_tier": "bronze|silver|gold|platinum",
    "preferred_categories": ["electronics", "apparel"],
    "price_sensitivity": "low|medium|high",
    "brand_affinity": {"nike": 0.8, "adidas": 0.3},
    "shopping_behavior": "browser|bargain_hunter|impulse_buyer",
    "return_rate": 0.15
}

-- Outcome Types
'purchase'          -- Transaction completed
'add_to_cart'       -- Item added to cart
'product_view'      -- Product page viewed
'review_submitted'  -- Product review posted
'return_initiated'  -- Return process started
'loyalty_signup'    -- Joined loyalty program
```

### Telecom

```sql
-- Entity Extensions
{
    "plan_type": "prepaid|postpaid|family|business",
    "monthly_spend": 89.99,
    "data_usage_gb": 45.2,
    "device_age_months": 18,
    "network_quality_score": 0.82,
    "roaming_frequency": "never|occasional|frequent",
    "support_tickets_ltm": 3,
    "contract_end_date": "2024-08-15"
}

-- Outcome Types
'plan_upgrade'      -- Upgraded to higher tier
'plan_downgrade'    -- Downgraded to lower tier
'add_line'          -- Added family member
'churn'             -- Cancelled service
'complaint'         -- Filed complaint
'referral'          -- Referred new customer
```

### Financial Services

```sql
-- Entity Extensions
{
    "account_types": ["checking", "savings", "credit_card", "mortgage"],
    "total_deposits": 125000,
    "total_loans": 450000,
    "credit_score": 740,
    "investment_profile": "conservative|moderate|aggressive",
    "digital_adoption": "high|medium|low",
    "financial_goals": ["retirement", "home_purchase", "education"],
    "risk_tolerance": 0.4
}

-- Outcome Types
'account_opened'    -- New account created
'loan_application'  -- Applied for loan
'investment_made'   -- Made investment
'card_activated'    -- Activated new card
'default'           -- Defaulted on payment
'balance_transfer'  -- Transferred balance
```

### Healthcare

```sql
-- Entity Extensions
{
    "patient_type": "individual|family",
    "conditions": ["diabetes", "hypertension"],
    "medications": ["metformin", "lisinopril"],
    "last_visit_date": "2024-10-15",
    "care_gaps": ["annual_physical", "flu_vaccine"],
    "preferred_provider": "dr_smith",
    "insurance_type": "ppo|hmo|medicare",
    "adherence_score": 0.85
}

-- Outcome Types
'appointment_scheduled'  -- Booked appointment
'appointment_completed'  -- Attended appointment
'prescription_filled'    -- Filled prescription
'preventive_care'       -- Completed preventive care
'emergency_visit'       -- ER visit
'survey_completed'      -- Completed health survey
```

### Real Estate

```sql
-- Entity Extensions
{
    "buyer_type": "first_time|investor|luxury|downsizer",
    "budget_range": [2000000, 5000000],
    "preferred_locations": ["manhattan", "brooklyn_heights"],
    "property_preferences": {
        "min_bedrooms": 3,
        "must_have": ["doorman", "parking", "terrace"],
        "deal_breakers": ["ground_floor", "no_elevator"]
    },
    "financing_status": "pre_approved|cash|contingent",
    "timeline": "immediate|3_months|6_months|exploring"
}

-- Outcome Types
'property_inquiry'      -- Inquired about property
'showing_scheduled'     -- Scheduled viewing
'showing_attended'      -- Attended viewing
'offer_submitted'       -- Made offer
'contract_signed'       -- Signed contract
'closing_completed'     -- Closed deal
'referral_made'         -- Referred another client
```

## Causal ML Integration Tables

### 1. Uplift Models Table

```sql
CREATE TABLE uplift_models (
    model_id UUID PRIMARY KEY,
    model_type VARCHAR(50), -- 'x_learner', 'dr_learner', 't_learner'
    
    -- Training Details
    training_date TIMESTAMP,
    training_data_start DATE,
    training_data_end DATE,
    sample_size INTEGER,
    
    -- Performance
    ate DECIMAL(8,6), -- Average Treatment Effect
    att DECIMAL(8,6), -- Average Treatment on Treated
    validation_score DECIMAL(5,4),
    
    -- Model Artifacts
    model_path TEXT,
    feature_importance JSONB,
    hyperparameters JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT false,
    deployed_date TIMESTAMP
);
```

### 2. MMM Parameters Table

```sql
CREATE TABLE mmm_parameters (
    parameter_id UUID PRIMARY KEY,
    
    -- Channel Parameters
    channel VARCHAR(50),
    base_effectiveness DECIMAL(6,4),
    saturation_point DECIMAL(12,2),
    decay_rate DECIMAL(6,4), -- Adstock decay
    
    -- Elasticities
    price_elasticity DECIMAL(6,4),
    frequency_elasticity DECIMAL(6,4),
    
    -- Cross-Effects
    halo_effects JSONB, -- Effects on other channels
    competitive_factors JSONB,
    
    -- Time Factors
    seasonality_multipliers JSONB,
    day_of_week_effects JSONB,
    
    -- Validity
    valid_from DATE,
    valid_to DATE,
    confidence_interval JSONB
);
```

## Data Pipeline Tables

### 1. Simulation Runs

```sql
CREATE TABLE simulation_runs (
    simulation_id UUID PRIMARY KEY,
    
    -- Configuration
    intervention_id UUID REFERENCES interventions(intervention_id),
    segment_ids TEXT[],
    simulation_type VARCHAR(50),
    
    -- Parameters
    num_personas INTEGER,
    num_iterations INTEGER,
    time_horizon_days INTEGER,
    
    -- DSPy Calibration
    dspy_module_version VARCHAR(50),
    calibration_score DECIMAL(5,4),
    
    -- Results
    predicted_outcomes JSONB,
    confidence_intervals JSONB,
    recommendations JSONB,
    
    -- Performance
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    tokens_used INTEGER,
    cost DECIMAL(8,2),
    
    -- Validation
    backtest_score DECIMAL(5,4),
    actual_outcomes JSONB, -- Filled in after campaign runs
    
    INDEX idx_intervention (intervention_id),
    INDEX idx_time (start_time DESC)
);
```

### 2. Calibration History

```sql
CREATE TABLE calibration_history (
    calibration_id UUID PRIMARY KEY,
    
    -- DSPy Details
    module_name VARCHAR(100),
    optimization_metric VARCHAR(100),
    
    -- Training Data
    training_examples INTEGER,
    validation_examples INTEGER,
    industries_covered TEXT[],
    
    -- Performance
    training_score DECIMAL(5,4),
    validation_score DECIMAL(5,4),
    ranking_accuracy DECIMAL(5,4),
    moment_matching_error DECIMAL(6,4),
    
    -- Artifacts
    optimized_prompts JSONB,
    module_path TEXT,
    
    -- Metadata
    calibration_date TIMESTAMP,
    is_deployed BOOLEAN DEFAULT false
);
```

## ActivePieces Integration Schema

### 1. Workflow Configurations

```sql
CREATE TABLE workflow_configs (
    workflow_id UUID PRIMARY KEY,
    
    -- ActivePieces Details
    activepieces_flow_id VARCHAR(255),
    trigger_type VARCHAR(50), -- 'schedule', 'webhook', 'event'
    
    -- Simulation Configuration
    default_simulation_params JSONB,
    segment_mappings JSONB, -- Map AP segments to our segments
    
    -- Output Configuration
    output_format VARCHAR(50), -- 'summary', 'detailed', 'csv'
    webhook_url TEXT,
    
    -- Schedule
    schedule_cron VARCHAR(100),
    is_active BOOLEAN DEFAULT true
);
```

### 2. API Keys Management

```sql
CREATE TABLE api_keys (
    api_key_id UUID PRIMARY KEY,
    
    -- Key Details
    key_hash VARCHAR(255) UNIQUE NOT NULL, -- Hashed API key
    key_prefix VARCHAR(10), -- First 10 chars for identification
    
    -- Permissions
    organization_id UUID,
    allowed_operations TEXT[],
    rate_limit INTEGER DEFAULT 1000,
    
    -- Industry Restrictions
    allowed_industries TEXT[],
    allowed_segments TEXT[],
    
    -- Usage
    total_requests INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
```

## Data Quality & Governance

### 1. Data Lineage

```sql
CREATE TABLE data_lineage (
    lineage_id UUID PRIMARY KEY,
    
    -- Source
    source_system VARCHAR(100),
    source_table VARCHAR(100),
    source_record_id VARCHAR(255),
    
    -- Destination
    dest_table VARCHAR(100),
    dest_record_id UUID,
    
    -- Transformation
    transformation_type VARCHAR(100),
    transformation_rules JSONB,
    
    -- Quality
    quality_checks_passed BOOLEAN,
    quality_issues JSONB,
    
    -- Metadata
    processed_at TIMESTAMP,
    processing_duration_ms INTEGER
);
```

### 2. Privacy Compliance

```sql
CREATE TABLE privacy_requests (
    request_id UUID PRIMARY KEY,
    
    -- Request Details
    entity_id UUID REFERENCES entities(entity_id),
    request_type VARCHAR(50), -- 'access', 'deletion', 'correction', 'portability'
    
    -- Compliance
    regulation VARCHAR(50), -- 'gdpr', 'ccpa', 'hipaa'
    
    -- Status
    status VARCHAR(50), -- 'pending', 'processing', 'completed', 'denied'
    
    -- Audit
    requested_at TIMESTAMP,
    completed_at TIMESTAMP,
    requested_by VARCHAR(255),
    processed_by VARCHAR(255)
);
```

## Migration Support

### 1. Industry Mapping Templates

```yaml
# Retail to Universal Mapping
retail_mapping:
  source_fields:
    customer_id: entity_id
    customer_segment: segment_id
    ltv: lifetime_value
    last_purchase_date: last_interaction_date
  
  computed_fields:
    lifecycle_stage: |
      CASE 
        WHEN days_since_last_purchase < 30 THEN 'active'
        WHEN days_since_last_purchase < 90 THEN 'at_risk'
        ELSE 'churned'
      END
  
  json_mappings:
    demographics:
      - age_group
      - gender
      - location
    preferences:
      - favorite_categories
      - preferred_brands

# Telecom to Universal Mapping
telecom_mapping:
  source_fields:
    subscriber_id: entity_id
    plan_segment: segment_id
    arpu: current_value_score
    churn_probability: risk_score
```

### 2. ETL Pipeline Configuration

```python
# Example ETL configuration for cross-industry data ingestion

ETL_CONFIG = {
    'retail': {
        'source_connection': 'postgresql://retail_db',
        'mapping_template': 'retail_mapping.yaml',
        'transformation_rules': [
            'normalize_phone_numbers',
            'standardize_addresses',
            'calculate_rfm_scores'
        ],
        'validation_rules': [
            'entity_id_not_null',
            'lifecycle_stage_valid',
            'value_scores_in_range'
        ]
    },
    
    'telecom': {
        'source_connection': 'snowflake://telecom_dw',
        'mapping_template': 'telecom_mapping.yaml',
        'transformation_rules': [
            'calculate_arpu',
            'derive_usage_patterns',
            'predict_churn_risk'
        ]
    }
}
```

## Query Examples

### 1. Cross-Industry Intervention Performance

```sql
-- Compare intervention performance across industries
WITH intervention_stats AS (
    SELECT 
        i.category,
        e.attributes->>'industry' as industry,
        COUNT(DISTINCT o.entity_id) as responders,
        COUNT(DISTINCT ex.entity_id) as exposed,
        AVG(o.outcome_value) as avg_value
    FROM interventions i
    JOIN exposures ex ON i.intervention_id = ex.intervention_id
    LEFT JOIN outcomes o ON ex.exposure_id = o.exposure_id
    JOIN entities e ON ex.entity_id = e.entity_id
    WHERE i.start_date >= '2024-01-01'
    GROUP BY 1, 2
)
SELECT 
    category,
    industry,
    responders::float / exposed as response_rate,
    avg_value
FROM intervention_stats
ORDER BY response_rate DESC;
```

### 2. Segment Evolution Tracking

```sql
-- Track how segments evolve over time
SELECT 
    segment_id,
    date_trunc('month', updated_at) as month,
    current_size,
    avg_lifetime_value,
    avg_response_rate
FROM segments
WHERE is_active = true
ORDER BY segment_id, month;
```

### 3. Calibration Performance

```sql
-- Monitor DSPy calibration accuracy
SELECT 
    sr.simulation_id,
    sr.calibration_score,
    sr.predicted_outcomes->>'conversion_rate' as predicted_cr,
    sr.actual_outcomes->>'conversion_rate' as actual_cr,
    ABS(
        (sr.predicted_outcomes->>'conversion_rate')::float - 
        (sr.actual_outcomes->>'conversion_rate')::float
    ) as error
FROM simulation_runs sr
WHERE sr.actual_outcomes IS NOT NULL
ORDER BY sr.start_time DESC
LIMIT 100;
```

## Best Practices

1. **Use JSONB Wisely**: Store structured industry-specific data in JSONB fields but index frequently queried paths
2. **Maintain Universal Core**: Never modify core tables for industry-specific needs
3. **Version Control**: Track schema versions for migrations
4. **Data Validation**: Implement triggers to validate JSONB structure
5. **Partition Large Tables**: Partition exposures and outcomes by date for performance
6. **Archive Old Data**: Move old simulation runs to archive tables
7. **Monitor Data Quality**: Regular checks on data completeness scores

This schema provides a robust foundation for cross-industry intervention testing while maintaining flexibility for industry-specific requirements.