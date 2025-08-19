# ActivePieces Workflow Nodes for TinyTroupe
## Market Research Automation via Visual Workflows

### Overview

This specification defines ActivePieces workflow nodes that integrate with the TinyTroupe Enhanced API to enable no-code market research automation. Users can create visual workflows that combine persona generation, research simulations, and result analysis without writing code.

## Base Configuration

```yaml
package_name: "@tinytroupe/activepieces-nodes"
version: "1.0.0"
base_url: "https://api.tinytroupe-research.com/v1"
auth_method: "api_key"
auth_header: "Authorization: Bearer {api_key}"
```

## Node Categories

### 1. Persona Management Nodes

#### Load Rich Agent Persona
```yaml
node_id: "tinytroupe-load-agent"
display_name: "Load TinyTroupe Agent"
description: "Load pre-built rich agent personas (Lisa, Oscar, Marcos, etc.)"
category: "personas"
icon: "user-circle"

inputs:
  agent_name:
    type: "dropdown"
    required: true
    options:
      - label: "Lisa Carter - Data Scientist"
        value: "lisa_carter"
      - label: "Oscar - Architect" 
        value: "oscar_architect"
      - label: "Marcos - Physician"
        value: "marcos_physician"
    description: "Select a pre-built agent persona"
    
  customizations:
    type: "object"
    required: false
    properties:
      age:
        type: "number"
        min: 18
        max: 99
      location:
        type: "text"
      additional_context:
        type: "text_area"
    description: "Optional customizations to the base persona"

outputs:
  persona_id:
    type: "text"
    description: "Unique ID for the created persona"
  persona_details:
    type: "object"
    description: "Full persona specification including demographics and personality"
  mini_bio:
    type: "text"
    description: "Brief biography of the persona"

api_endpoint: "POST /api/v1/personas/create-from-agent"
```

#### Generate Demographic Sample
```yaml
node_id: "tinytroupe-demographic-sample"
display_name: "Generate Demographic Sample"
description: "Create diverse personas from demographic population data"
category: "personas"
icon: "users"

inputs:
  population_source:
    type: "dropdown"
    required: true
    options:
      - label: "United States"
        value: "usa"
      - label: "Spain"
        value: "spain"
      - label: "Brazil"
        value: "brazil"
    description: "Population demographic source"
    
  sample_size:
    type: "number"
    required: true
    min: 10
    max: 200
    default: 50
    description: "Number of personas to generate"
    
  demographic_specification:
    type: "object"
    required: false
    properties:
      age_range:
        type: "text"
        placeholder: "25-45"
      income_levels:
        type: "multi_select"
        options: ["low", "middle", "high"]
        default: ["middle", "high"]
      education_levels:
        type: "multi_select"
        options: ["high_school", "college", "postgrad"]
        default: ["college", "postgrad"]
      additional_dimensions:
        type: "array"
        item_type: "text"
    description: "Demographic constraints for the sample"
    
  fragments_to_apply:
    type: "multi_select"
    required: false
    options:
      - "picky_customer"
      - "travel_enthusiast"
      - "health_conscious"
      - "price_sensitive"
      - "tech_early_adopter"
    description: "Behavioral fragments to apply to all personas"

outputs:
  sample_id:
    type: "text"
    description: "ID for the demographic sample"
  personas:
    type: "array"
    description: "Array of generated persona objects"
  sample_statistics:
    type: "object"
    description: "Statistics about the generated sample"

api_endpoint: "POST /api/v1/personas/create-demographic-sample"
```

### 2. Market Research Nodes

#### Product Evaluation Research
```yaml
node_id: "tinytroupe-product-evaluation"
display_name: "Product Evaluation Research"
description: "Test product concepts using Likert scale evaluation"
category: "research"
icon: "shopping-cart"

inputs:
  research_name:
    type: "text"
    required: true
    placeholder: "Bottled Gazpacho Market Test"
    description: "Name for this research study"
    
  product:
    type: "object"
    required: true
    properties:
      name:
        type: "text"
        required: true
      description:
        type: "text_area"
        required: true
      category:
        type: "text"
        default: "consumer_product"
      price_range:
        type: "text"
        placeholder: "$3-5 per bottle"
    description: "Product details"
    
  target_personas:
    type: "connection"
    connection_type: "persona_array"
    required: true
    description: "Personas to test the product with"
    accepts_from: 
      - "tinytroupe-load-agent"
      - "tinytroupe-demographic-sample"
    
  evaluation_questions:
    type: "array"
    required: true
    item_type: "text"
    default:
      - "Would you consider purchasing this if available at your local supermarket?"
      - "How much do you like this product concept?"
    description: "Questions to ask during evaluation"
    
  context:
    type: "object"
    required: false
    properties:
      market:
        type: "text"
        default: "US"
      distribution_channel:
        type: "dropdown"
        options: ["supermarket", "online", "specialty_store", "direct_to_consumer"]
        default: "supermarket"
      positioning:
        type: "dropdown"
        options: ["budget", "mid_market", "premium", "luxury"]
        default: "mid_market"
    description: "Market context for the evaluation"

outputs:
  research_id:
    type: "text"
    description: "Unique ID for this research"
  market_verdict:
    type: "text"
    description: "Overall market assessment (good_market/not_good_market)"
  mean_score:
    type: "number"
    description: "Average evaluation score (1-5)"
  detailed_results:
    type: "object"
    description: "Complete research results with insights"
  recommendations:
    type: "array"
    description: "Actionable recommendations based on results"

api_endpoint: "POST /api/v1/research/product-evaluation"
```

#### Advertisement Testing
```yaml
node_id: "tinytroupe-ad-testing"
display_name: "Advertisement Testing"
description: "Compare multiple advertisement variants"
category: "research"
icon: "megaphone"

inputs:
  research_name:
    type: "text"
    required: true
    placeholder: "TV Advertisement Comparison"
    
  advertisements:
    type: "array"
    required: true
    min_items: 2
    max_items: 5
    item_type: "object"
    item_properties:
      ad_id:
        type: "text"
        required: true
      title:
        type: "text"
        required: true
      copy:
        type: "text_area"
        required: true
      target_audience:
        type: "text"
        default: "general"
      key_messages:
        type: "array"
        item_type: "text"
    description: "Advertisement variants to test"
    
  test_personas:
    type: "connection"
    connection_type: "persona_array"
    required: true
    description: "Personas to test advertisements with"
    
  evaluation_criteria:
    type: "array"
    required: true
    item_type: "text"
    default:
      - "Which ad convinces you more to buy?"
      - "Rate appeal on 1-10 scale"
      - "What specific elements resonate with you?"
    description: "How to evaluate the advertisements"

outputs:
  research_id:
    type: "text"
  winning_ad:
    type: "object"
    description: "Advertisement that performed best"
  detailed_responses:
    type: "array"
    description: "Individual persona responses and reasoning"
  audience_insights:
    type: "object"
    description: "Insights by audience segments"

api_endpoint: "POST /api/v1/research/advertisement-testing"
```

#### Market Segment Analysis
```yaml
node_id: "tinytroupe-segment-analysis"
display_name: "Market Segment Analysis"
description: "Compare product acceptance across market segments"
category: "research"
icon: "pie-chart"

inputs:
  research_name:
    type: "text"
    required: true
    placeholder: "WanderLux Travel Service Analysis"
    
  product:
    type: "object"
    required: true
    properties:
      name:
        type: "text"
        required: true
      description:
        type: "text_area"
        required: true
      positioning:
        type: "text"
        placeholder: "luxury, adult-focused"
    description: "Product to analyze"
    
  segments:
    type: "array"
    required: true
    min_items: 2
    item_type: "object"
    item_properties:
      segment_name:
        type: "text"
        required: true
      persona_criteria:
        type: "text"
        required: true
        placeholder: "single, no children, age 25-40"
      sample_size:
        type: "number"
        default: 50
        min: 10
        max: 100
      fragments:
        type: "multi_select"
        options: ["loving_parent", "career_focused", "price_conscious"]
    description: "Market segments to analyze"
    
  evaluation_question:
    type: "text"
    required: true
    default: "Would you use this service for your next vacation?"
    description: "Question to ask each segment"
    
  evaluation_type:
    type: "dropdown"
    required: true
    options:
      - label: "Yes/No/Maybe"
        value: "yes_no_maybe"
      - label: "Likert Scale (1-5)"
        value: "likert_5"
    default: "yes_no_maybe"

outputs:
  research_id:
    type: "text"
  best_segment:
    type: "text"
    description: "Segment with highest market fit"
  segment_comparison:
    type: "object"
    description: "Response percentages by segment"
  insights:
    type: "object"
    description: "Key insights and reasoning"
  recommendations:
    type: "array"
    description: "Strategic recommendations"

api_endpoint: "POST /api/v1/research/segment-analysis"
```

### 3. Advanced Simulation Nodes

#### Focus Group Simulation
```yaml
node_id: "tinytroupe-focus-group"
display_name: "Focus Group Simulation"
description: "Run moderated focus group discussions"
category: "simulation"
icon: "message-circle"

inputs:
  session_name:
    type: "text"
    required: true
    placeholder: "Product Brainstorming Session"
    
  participants:
    type: "connection"
    connection_type: "persona_array"
    required: true
    min_items: 3
    max_items: 8
    description: "Focus group participants"
    
  moderator_questions:
    type: "array"
    required: true
    item_type: "text"
    min_items: 1
    placeholder:
      - "What's your initial reaction to this product?"
      - "What concerns do you have?"
      - "How would you expect to use this?"
    description: "Questions for the moderator to ask"
    
  discussion_format:
    type: "object"
    properties:
      enable_participant_interaction:
        type: "boolean"
        default: false
        description: "Allow participants to respond to each other"
      rounds:
        type: "number"
        default: 1
        min: 1
        max: 5
      include_inner_monologue:
        type: "boolean"
        default: true
        description: "Include authentic reasoning from participants"
    description: "How to structure the discussion"
    
  product_context:
    type: "object"
    required: false
    properties:
      product_name:
        type: "text"
      description:
        type: "text_area"
      price_point:
        type: "text"
    description: "Context about the product being discussed"

outputs:
  session_id:
    type: "text"
  transcripts:
    type: "array"
    description: "Individual participant responses and reasoning"
  thematic_analysis:
    type: "object"
    description: "Key themes and sentiment analysis"
  recommendations:
    type: "array"
    description: "Strategic recommendations based on discussion"

api_endpoint: "POST /api/v1/simulate/focus-group"
```

#### Individual Response Analysis
```yaml
node_id: "tinytroupe-individual-response"
display_name: "Individual Response Analysis"
description: "Deep-dive analysis of individual persona reactions"
category: "simulation"
icon: "user"

inputs:
  persona:
    type: "connection"
    connection_type: "persona"
    required: true
    description: "Persona to analyze"
    
  stimulus:
    type: "object"
    required: true
    properties:
      type:
        type: "dropdown"
        options: ["email_campaign", "product_demo", "advertisement", "website_landing"]
      subject:
        type: "text"
        condition: "stimulus.type == 'email_campaign'"
      content:
        type: "text_area"
        required: true
      call_to_action:
        type: "text"
      sender:
        type: "text"
    description: "Marketing stimulus to analyze"
    
  analysis_dimensions:
    type: "multi_select"
    required: true
    options:
      - "interest_level"
      - "purchase_intent"
      - "trust_in_sender"
      - "technical_credibility"
      - "pricing_sensitivity"
      - "emotional_response"
    default: ["interest_level", "purchase_intent", "trust_in_sender"]
    description: "Aspects to analyze in the response"

outputs:
  analysis_id:
    type: "text"
  overall_reaction:
    type: "text"
    description: "High-level reaction summary"
  detailed_scores:
    type: "object"
    description: "Scores for each analysis dimension (0-10)"
  reasoning:
    type: "text"
    description: "Persona's detailed reasoning"
  concerns:
    type: "array"
    description: "Identified concerns or objections"
  positive_factors:
    type: "array"
    description: "Factors that resonated positively"
  recommendations:
    type: "object"
    description: "How to improve the stimulus for this persona"

api_endpoint: "POST /api/v1/simulate/individual-response"
```

### 4. Results Processing Nodes

#### Extract Structured Results
```yaml
node_id: "tinytroupe-extract-results"
display_name: "Extract Structured Results"
description: "Extract specific data fields from simulation results"
category: "results"
icon: "filter"

inputs:
  simulation_id:
    type: "connection"
    connection_type: "simulation_id"
    required: true
    description: "Simulation to extract results from"
    
  extraction_objective:
    type: "text"
    required: true
    placeholder: "Extract purchase intent and key concerns"
    description: "What specific information to extract"
    
  fields:
    type: "array"
    required: true
    item_type: "text"
    placeholder:
      - "purchase_intent"
      - "concerns"
      - "preferred_features"
    description: "Specific fields to extract from responses"

outputs:
  extracted_data:
    type: "object"
    description: "Structured data matching requested fields"
  raw_responses:
    type: "array"
    description: "Original unstructured responses"

api_endpoint: "POST /api/v1/extract/structured-results"
```

#### Generate Report
```yaml
node_id: "tinytroupe-generate-report"
display_name: "Generate Research Report"
description: "Create formatted report from research results"
category: "results"
icon: "file-text"

inputs:
  research_results:
    type: "connection"
    connection_type: "research_results"
    required: true
    description: "Results from research nodes"
    
  report_format:
    type: "dropdown"
    required: true
    options:
      - label: "Executive Summary"
        value: "executive_summary"
      - label: "Detailed Analysis"
        value: "detailed_analysis"
      - label: "Presentation Slides"
        value: "presentation"
    default: "executive_summary"
    description: "Format for the generated report"
    
  include_sections:
    type: "multi_select"
    options:
      - "methodology"
      - "key_findings"
      - "persona_profiles"
      - "recommendations"
      - "statistical_summary"
      - "raw_data"
    default: ["key_findings", "recommendations", "statistical_summary"]

outputs:
  report_content:
    type: "text"
    description: "Formatted report content"
  charts_data:
    type: "object"
    description: "Data for creating visualizations"
  executive_summary:
    type: "text"
    description: "Brief executive summary"

api_endpoint: "POST /api/v1/reports/generate"
```

## Example Workflows

### Workflow 1: Complete Product Launch Research
```yaml
workflow_name: "Product Launch Research"
description: "End-to-end market research for new product launch"

steps:
  1. Generate Demographic Sample:
     - node: "tinytroupe-demographic-sample"
     - population: "usa"
     - sample_size: 100
     - demographics: {age_range: "25-55", income: ["middle", "high"]}
     
  2. Product Evaluation:
     - node: "tinytroupe-product-evaluation"
     - personas: "{step1.personas}"
     - product: {name: "Smart Home Hub", category: "electronics"}
     - questions: ["Would you buy this?", "What's your price expectation?"]
     
  3. Segment Analysis:
     - node: "tinytroupe-segment-analysis"
     - segments: [
         {name: "tech_enthusiasts", criteria: "early technology adopters"},
         {name: "family_focused", criteria: "families with children"}
       ]
     
  4. Generate Report:
     - node: "tinytroupe-generate-report"
     - results: "{step2.detailed_results}"
     - format: "executive_summary"

triggers:
  - webhook_received
  - scheduled_daily

outputs:
  - email_report_to_stakeholders
  - save_to_google_sheets
  - post_to_slack
```

### Workflow 2: A/B Test Marketing Campaign
```yaml
workflow_name: "Campaign A/B Testing"
description: "Compare email marketing campaigns across customer segments"

steps:
  1. Load Customer Personas:
     - node: "tinytroupe-load-agent"
     - agents: ["lisa_carter", "oscar_architect"]
     
  2. Test Email Variants:
     - node: "tinytroupe-ad-testing"
     - personas: "{step1.personas}"
     - advertisements: [
         {id: "variant_a", subject: "Sale: 30% Off", copy: "..."},
         {id: "variant_b", subject: "Flash Deal", copy: "..."}
       ]
     
  3. Individual Deep Dive:
     - node: "tinytroupe-individual-response"
     - persona: "{step1.personas[0]}"
     - stimulus: {type: "email_campaign", content: "{step2.winning_ad}"}
     - dimensions: ["interest_level", "purchase_intent"]

outputs:
  - update_marketing_dashboard
  - trigger_campaign_deployment
```

## Installation & Setup

### ActivePieces Package Structure
```
@tinytroupe/activepieces-nodes/
├── package.json
├── src/
│   ├── index.ts
│   ├── lib/
│   │   ├── api-client.ts
│   │   └── types.ts
│   └── pieces/
│       ├── personas/
│       │   ├── load-agent.ts
│       │   └── demographic-sample.ts
│       ├── research/
│       │   ├── product-evaluation.ts
│       │   ├── ad-testing.ts
│       │   └── segment-analysis.ts
│       └── simulation/
│           ├── focus-group.ts
│           └── individual-response.ts
└── README.md
```

### Configuration Requirements
```typescript
// Authentication configuration
interface TinyTroupeConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

// Required environment variables
TINYTROUPE_API_KEY=your_api_key_here
TINYTROUPE_BASE_URL=https://api.tinytroupe-research.com/v1
```

This specification provides a complete visual workflow system for TinyTroupe research capabilities, enabling non-technical users to create sophisticated market research pipelines through drag-and-drop interfaces.