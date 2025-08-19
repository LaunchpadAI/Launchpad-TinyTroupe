# Enhanced TinyTroupe API Service Specification
## Expose Full TinyTroupe Functionality via Microservice + MCP

### Version 3.0 - January 2025
### Phase 4 Advanced Features Implementation Complete
### ✅ API ARCHITECTURE REFACTORED FOR PRODUCTION

## Overview

Instead of building a simplified persona system, this service exposes the full power of existing TinyTroupe functionality through production APIs. The API has been completely refactored from a 2655-line monolith into a clean, modular, production-ready architecture following DRY and SRP principles.

**Core Value**: Instant access to sophisticated market research capabilities through a professionally architected, maintainable, and scalable API service.

## 🏗️ Production API Architecture (NEW)

### Modular Structure
- **`src/models/`**: Pydantic schemas organized by domain (persona, simulation, world, content, research)
- **`src/services/`**: Business logic layer with clean separation of concerns
- **`src/routers/`**: API endpoint handlers grouped by functionality
- **`src/core/`**: Configuration management, dependency injection, database abstraction
- **`src/utils/`**: Logging, error handling, and utility functions

### Key Improvements
- **DRY Compliance**: Eliminated all code duplication through shared models and utilities
- **SRP Compliance**: Each module has a single, well-defined responsibility
- **Type Safety**: Complete Pydantic model coverage across all 40+ endpoints
- **Error Handling**: Custom exception types with structured JSON responses
- **Logging**: Configurable structured logging with file and console output
- **Database Ready**: Abstraction layer prepared for Supabase production deployment

## 🚀 Phase 4 Advanced Features (NEW - January 2025)

### Enhanced World Simulations
- **Multi-Environment Simulations**: Create complex scenarios with agent transitions between environments
- **Social Network Dynamics**: Model realistic relationships and social hierarchies with TinySocialNetwork
- **Temporal Simulations**: Time-based progression with configurable time steps and duration
- **Investment Firm Simulations**: Financial consultation scenarios with specialized analysts

### Content Enhancement Suite
- **TinyEnricher**: AI-powered content expansion and enrichment (5x content amplification)
- **TinyStyler**: Apply professional, casual, technical, or academic styles to any content
- **Context-Aware Processing**: Leverage past results for improved consistency

### Grounding System
- **Local Files Integration**: Connect agents to documents, PDFs, and structured data
- **Web Page Grounding**: Real-time access to web content and APIs
- **Document Querying**: List, retrieve, and semantically search through grounded content
- **Multi-Source Grounding**: Combine multiple data sources for comprehensive knowledge

### Document Creation Platform
- **TinyWordProcessor Integration**: Professional document generation in multiple formats
- **Multi-Format Export**: Markdown, DOCX, JSON, and PDF support
- **Content Enrichment**: Automatic expansion and improvement of document content
- **Grounded Documents**: Create data-driven documents using connected sources

## Base Configuration

```
Base URL: https://api.tinytroupe-research.com/v1
Auth: Authorization: Bearer {API_KEY}
MCP Server: mcp://tinytroupe-research.com
Rate Limit: 100 requests/minute per API key
```

## Core API Categories

### 1. Rich Persona Management APIs

#### Load Existing Agent as Persona
```http
POST /personas/from-agent
Content-Type: application/json

{
  "agent_name": "lisa_carter", // or "oscar", "marcos", etc.
  "customizations": {
    "age": 32,
    "location": "San Francisco",
    "additional_context": "Recently moved to tech startup"
  }
}

Response: 201 Created
{
  "persona_id": "pers_lisa_001",
  "name": "Lisa Carter",
  "type": "rich_agent",
  "demographics": {
    "age": 28,
    "gender": "Female",
    "occupation": "Data Scientist at Microsoft",
    "education": "University of Toronto, Master's in Data Science"
  },
  "personality": {
    "big_five": {
      "openness": "High. Very imaginative and curious.",
      "conscientiousness": "High. Meticulously organized and dependable.",
      "extraversion": "Medium. Friendly and engaging but enjoy quiet work.",
      "agreeableness": "High. Supportive and empathetic towards others.",
      "neuroticism": "Low. Generally calm and composed under pressure."
    }
  },
  "preferences": {...},
  "behaviors": {...},
  "relationships": [...],
  "created_at": "2024-12-15T10:30:00Z"
}
```

#### Generate Demographic Sample
```http
POST /personas/generate-demographic-sample
Content-Type: application/json

{
  "population_source": "usa", // usa.json, spain.json, brazil.json
  "sample_size": 50,
  "demographic_specification": {
    "age_range": "25-45",
    "income_levels": ["middle", "high"],
    "education_levels": ["college", "postgrad"],
    "additional_dimensions": [
      "culinary tastes: from traditional to modern, from spicy to mild",
      "shopping habits: from frequent to occasional, online to in-store",
      "health consciousness: from health-focused to indulgent"
    ]
  },
  "fragments_to_apply": ["picky_customer", "travel_enthusiast"]
}

Response: 201 Created
{
  "sample_id": "demo_sample_001", 
  "personas": [
    {
      "persona_id": "pers_demo_001",
      "mini_bio": "Marketing professional, health-conscious, frequent online shopper...",
      "demographic_profile": {...}
    }
  ],
  "sample_statistics": {
    "diversity_score": 0.87,
    "demographic_coverage": {...},
    "fragment_distribution": {...}
  }
}
```

### 2. Market Research APIs (Proven Patterns)

#### Product Evaluation Research
```http
POST /research/product-evaluation
Content-Type: application/json

{
  "research_name": "Bottled Gazpacho Market Test",
  "product": {
    "name": "Bottled Gazpacho",
    "description": "Cold, blended vegetable soup originally from Spain...",
    "category": "food_beverage",
    "price_range": "$3-5 per bottle"
  },
  "target_personas": ["pers_demo_001", "pers_demo_002"], // or use sample_id
  "evaluation_scale": {
    "type": "likert_5", 
    "labels": {
      "1": "would NEVER buy it",
      "2": "very unlikely, but not impossible", 
      "3": "maybe I would buy it, not sure",
      "4": "it is very likely",
      "5": "would CERTAINLY buy it"
    }
  },
  "questions": [
    "Would you consider purchasing this if available at your local supermarket?",
    "How much do you like this product concept?"
  ],
  "context": {
    "market": "US",
    "distribution_channel": "supermarket",
    "positioning": "premium_imported"
  }
}

Response: 200 OK
{
  "research_id": "res_001",
  "status": "completed",
  "results": {
    "summary": {
      "mean_score": 2.25,
      "std_dev": 0.53,
      "response_distribution": {
        "1": 2, "2": 29, "3": 13, "4": 0, "5": 0
      },
      "market_verdict": "not_good_market",
      "confidence_level": 0.89
    },
    "detailed_analysis": {
      "positive_responses": "0.00%",
      "neutral_responses": "29.55%", 
      "negative_responses": "70.45%",
      "key_insights": [
        "Price sensitivity major concern",
        "Unfamiliarity with gazpacho concept",
        "Preference for hot soups in American market"
      ]
    },
    "persona_responses": [
      {
        "persona_id": "pers_demo_001",
        "score": 2,
        "reasoning": "I'm interested in healthy options but gazpacho is too unfamiliar...",
        "demographic_factors": ["health_conscious", "traditional_food_preference"]
      }
    ]
  }
}
```

#### Advertisement Testing
```http
POST /research/advertisement-testing  
Content-Type: application/json

{
  "research_name": "TV Advertisement Comparison",
  "advertisements": [
    {
      "ad_id": "gaming_tv",
      "title": "Ultimate Gaming Experience - LG 4K Ultra HD TV",
      "copy": "Experience Next-Level Gaming with LG's 4K OLED TV...",
      "target_audience": "tech_enthusiasts",
      "key_messages": ["gaming_performance", "picture_quality", "tech_features"]
    },
    {
      "ad_id": "family_tv", 
      "title": "Perfect Family TV - Samsung 4K & 8K TVs",
      "copy": "Bring Your Family Together with Samsung's 4K & 8K TVs...",
      "target_audience": "families",
      "key_messages": ["family_bonding", "reliability", "financing_options"]
    }
  ],
  "test_personas": ["pers_lisa_001", "pers_oscar_001"], // Rich existing agents
  "evaluation_criteria": [
    "Which ad convinces you more to buy?", 
    "Rate appeal on 1-10 scale",
    "What specific elements resonate with you?"
  ]
}

Response: 200 OK
{
  "research_id": "ad_test_001",
  "results": {
    "winning_ad": {
      "ad_id": "gaming_tv",
      "votes": 3,
      "win_margin": "convincing"
    },
    "detailed_responses": [
      {
        "persona_id": "pers_lisa_001",
        "chosen_ad": "gaming_tv",
        "reasoning": "As a data scientist, the tech features and gaming performance appeal to my interests...",
        "appeal_score": 8,
        "key_resonating_elements": ["4K_OLED", "ultra_fast_response", "tech_enthusiast_positioning"]
      }
    ],
    "audience_insights": {
      "tech_professionals": "strongly_prefer_gaming_ad",
      "creative_professionals": "moderate_preference_gaming_ad"
    }
  }
}
```

#### Segment Analysis Research  
```http
POST /research/segment-analysis
Content-Type: application/json

{
  "research_name": "WanderLux Travel Service Analysis",
  "product": {
    "name": "WanderLux",
    "description": "Luxury travel service for beachfront and spa destinations...",
    "positioning": "adult-focused, quiet luxury vacations"
  },
  "segments": [
    {
      "segment_name": "singles",
      "persona_criteria": "single, no children, age 25-40",
      "sample_size": 50
    },
    {
      "segment_name": "couples", 
      "persona_criteria": "married/partnered, no children, age 25-45",
      "sample_size": 50
    },
    {
      "segment_name": "families",
      "persona_criteria": "married with children 2-4 years old",
      "sample_size": 50,
      "fragments": ["loving_parent"]
    }
  ],
  "evaluation_type": "yes_no_maybe",
  "question": "Would you use this service for your next vacation?"
}

Response: 200 OK
{
  "research_id": "seg_001",
  "results": {
    "segment_comparison": {
      "singles": {"yes": "45%", "no": "30%", "maybe": "25%", "market_fit": "moderate"},
      "couples": {"yes": "72%", "no": "15%", "maybe": "13%", "market_fit": "strong"}, 
      "families": {"yes": "8%", "no": "85%", "maybe": "7%", "market_fit": "poor"}
    },
    "insights": {
      "best_segment": "couples",
      "reasoning": "Adult-only positioning strongly appeals to couples seeking romance",
      "segment_insights": {
        "couples": "Value quiet luxury, disposable income, romantic getaways",
        "families": "Need kid-friendly options, adult-only is deal-breaker"
      }
    },
    "recommendations": [
      "Focus marketing on couples 30-45 with high disposable income",
      "Emphasize romance and adult-only experience",
      "Avoid family-oriented channels and messaging"
    ]
  }
}
```

### 3. Advanced Simulation APIs

#### Focus Group Simulation
```http
POST /simulate/focus-group
Content-Type: application/json

{
  "session_name": "Gazpacho Focus Group",
  "participants": ["pers_demo_001", "pers_demo_002", "pers_demo_003"],
  "moderator_questions": [
    "What's your initial reaction to bottled gazpacho?",
    "What concerns do you have about trying this product?", 
    "How would you expect to use this product?"
  ],
  "discussion_format": {
    "enable_participant_interaction": false, // Individual responses
    "rounds": 1,
    "include_inner_monologue": true // Authentic reasoning
  },
  "product_context": {
    "product_name": "Bottled Gazpacho",
    "description": "Spanish cold soup, now available in supermarkets",
    "price_point": "$4.99 per bottle"
  }
}

Response: 200 OK  
{
  "session_id": "focus_001",
  "transcripts": [
    {
      "persona_id": "pers_demo_001",
      "persona_name": "Sarah - Health-Conscious Professional", 
      "responses": [
        {
          "question": "What's your initial reaction to bottled gazpacho?",
          "response": "Interesting concept... I'm always looking for healthy, convenient options...",
          "inner_monologue": "This could work for my busy lifestyle, but I'm not familiar with gazpacho...",
          "sentiment": "curious_but_cautious"
        }
      ]
    }
  ],
  "thematic_analysis": {
    "key_themes": [
      "health_consciousness_positive",
      "unfamiliarity_concern", 
      "convenience_value",
      "price_sensitivity"
    ],
    "sentiment_distribution": {
      "positive": "25%",
      "neutral": "50%", 
      "negative": "25%"
    }
  },
  "recommendations": [
    "Emphasize health benefits in marketing",
    "Include education about gazpacho origins", 
    "Consider promotional pricing for trial"
  ]
}
```

### 4. Persona Deep-Dive APIs

#### Individual Response Analysis
```http
POST /simulate/individual-response
Content-Type: application/json

{
  "persona_id": "pers_lisa_001",
  "stimulus": {
    "type": "email_campaign",
    "subject": "Introducing Revolutionary AI-Powered Data Analysis Tool",
    "content": "Transform your data analysis workflow with our new AI assistant...",
    "call_to_action": "Start Free Trial",
    "sender": "TechStartup Inc"
  },
  "analysis_dimensions": [
    "interest_level",
    "purchase_intent", 
    "trust_in_sender",
    "technical_credibility",
    "pricing_sensitivity"
  ]
}

Response: 200 OK
{
  "analysis_id": "ind_001",
  "persona_profile": {
    "name": "Lisa Carter",
    "relevant_background": "Data Scientist at Microsoft, expertise in ML models...",
    "relevant_preferences": "Values clear documentation, collaborative tools...",
    "current_context": "Working on search relevance improvements..."
  },
  "response_analysis": {
    "overall_reaction": "Very interested but cautiously optimistic",
    "detailed_scores": {
      "interest_level": 8.5,
      "purchase_intent": 6.0,
      "trust_in_sender": 4.0,
      "technical_credibility": 7.0,
      "pricing_sensitivity": 7.5
    },
    "reasoning": "As a data scientist, I'm naturally drawn to AI tools that could enhance my workflow. The promise of transforming data analysis is compelling, though I'd need to see concrete evidence of capabilities...",
    "concerns": [
      "Unknown company credibility", 
      "Vague promises without technical details",
      "Integration with existing Microsoft tools"
    ],
    "positive_factors": [
      "Relevant to daily work",
      "AI advancement aligns with interests", 
      "Free trial reduces risk"
    ]
  },
  "recommendations": {
    "to_improve_response": [
      "Include technical specifications or demos",
      "Add customer testimonials from similar roles",
      "Clarify integration capabilities with Microsoft stack"
    ],
    "optimal_follow_up": "Technical deep-dive webinar invitation",
    "best_timing": "Mid-week, morning (aligns with work schedule)"
  }
}
```

## ActivePieces Integration

### Workflow Nodes

```yaml
nodes:
  - name: "Load Market Segment"
    id: "tinytroupe-load-segment" 
    inputs:
      population: {type: "select", options: ["usa", "spain", "brazil"]}
      sample_size: {type: "number", default: 50}
      demographics: {type: "object"}
      fragments: {type: "array"}
    outputs:
      personas: {type: "array"}
      sample_stats: {type: "object"}

  - name: "Test Product Concept"
    id: "tinytroupe-test-product"
    inputs:
      personas: {type: "array", from: "load-segment.personas"}
      product: {type: "object"}
      evaluation_scale: {type: "select", options: ["likert_5", "yes_no_maybe"]}
    outputs:
      market_verdict: {type: "string"}
      detailed_results: {type: "object"}
      recommendations: {type: "array"}

  - name: "Compare Ad Variants"
    id: "tinytroupe-compare-ads"
    inputs:
      personas: {type: "array"}
      advertisements: {type: "array"}
      evaluation_criteria: {type: "array"}  
    outputs:
      winning_ad: {type: "object"}
      audience_insights: {type: "object"}
      
  - name: "Analyze Market Segments"
    id: "tinytroupe-segment-analysis"
    inputs:
      product: {type: "object"}
      segments: {type: "array"}
      question: {type: "string"}
    outputs:
      segment_comparison: {type: "object"}
      best_segment: {type: "string"}
      recommendations: {type: "array"}
```

## MCP Server Tools

### Tool Definitions for AI Agents

```python
@mcp_tool("test_marketing_concept")
def test_marketing_concept(
    concept: str,
    target_demographics: dict,
    evaluation_type: str = "likert_5",
    sample_size: int = 50
) -> dict:
    """Test marketing concept against demographic personas using proven research patterns"""
    
@mcp_tool("simulate_customer_persona") 
def simulate_customer_persona(
    customer_description: str,
    stimulus: str,
    analysis_dimensions: list = ["interest", "intent", "trust"]
) -> dict:
    """Generate detailed customer persona and simulate reaction to marketing stimulus"""
    
@mcp_tool("compare_advertisement_variants")
def compare_ad_variants(
    ad_variants: list,
    target_audience: str,
    sample_size: int = 30
) -> dict:
    """Compare multiple advertisement variants using existing agent personas"""

@mcp_tool("analyze_market_segments")
def analyze_market_segments(
    product: str,
    segments: list,
    evaluation_question: str
) -> dict:
    """Compare product acceptance across different market segments"""

@mcp_tool("run_focus_group")
def run_focus_group(
    topic: str,
    participant_criteria: str,
    questions: list,
    group_size: int = 8
) -> dict:
    """Simulate focus group discussion with demographically diverse participants"""
```

## Data Models

### Enhanced Persona Model
```python
{
  "persona_id": "string",
  "source_type": "existing_agent|demographic_sample|custom",
  "agent_name": "string", // if from existing agent
  "demographics": {
    "age": "integer",
    "gender": "string", 
    "nationality": "string",
    "education": "string",
    "occupation": "object"
  },
  "personality": {
    "big_five": "object", // Detailed personality traits
    "traits": "array",
    "style": "string"
  },
  "preferences": {
    "interests": "array",
    "likes": "array", 
    "dislikes": "array"
  },
  "behaviors": {
    "general": "array",
    "shopping": "array",
    "decision_making": "array"
  },
  "relationships": "array",
  "skills": "array",
  "beliefs": "array",
  "health": "string",
  "other_facts": "array",
  "fragments_applied": "array",
  "created_at": "timestamp"
}
```

## 🚀 Advanced API Categories (Phase 4 - NEW)

### 5. Enhanced World Simulations

#### Create Multi-Environment Simulation
```http
POST /worlds/multi-environment
Content-Type: application/json

{
  "simulation_name": "Cross-Department Collaboration Study",
  "environments": [
    {
      "world_name": "Marketing Department",
      "world_type": "social_network",
      "participants": ["lisa", "oscar"],
      "initial_context": "Marketing team planning product launch",
      "relationships": [
        {
          "agent_1": "lisa",
          "agent_2": "oscar", 
          "relationship_type": "colleague",
          "strength": 7.0
        }
      ]
    },
    {
      "world_name": "Executive Office",
      "world_type": "basic_world",
      "participants": ["marcos"],
      "initial_context": "Executive review of marketing proposals"
    }
  ],
  "coordination_rounds": 3,
  "global_context": "Company-wide product launch preparation"
}

Response: 200 OK
{
  "simulation_id": "sim_multi_001",
  "environments": ["Marketing Department", "Executive Office"],
  "total_participants": 3,
  "status": "completed",
  "results": {
    "Marketing Department": {
      "collaboration_insights": "Strong alignment on messaging strategy",
      "key_decisions": ["Focus on technical benefits", "Target early adopters"]
    },
    "Executive Office": {
      "executive_feedback": "Approve budget with minor adjustments",
      "strategic_guidance": "Emphasize competitive differentiation"
    }
  }
}
```

#### Investment Firm Consultation
```http
POST /worlds/investment-firm
Content-Type: application/json

{
  "firm_name": "Strategic Investments LLC",
  "firm_context": "Boutique investment firm specializing in tech sector analysis",
  "analyst_count": 2,
  "customer_profile": "High-net-worth individual interested in AI startups",
  "consultation_topic": "Evaluate investment potential in generative AI companies",
  "grounding_data": ["./financial_reports/q4_2024/", "./market_analysis/ai_trends.pdf"]
}

Response: 200 OK
{
  "firm_id": "firm_001",
  "participants": {
    "analysts": ["Financial Analyst - Tech Sector", "Financial Analyst - Emerging Markets"],
    "advisor": "Senior Investment Advisor",
    "customer": "Alexander Chen"
  },
  "consultation_insights": {
    "investment_recommendations": [
      "Diversified AI portfolio with 60% established players, 40% emerging startups",
      "Focus on companies with proprietary data advantages"
    ],
    "risk_assessment": "Moderate to high risk with strong growth potential",
    "timeline_recommendations": "18-24 month investment horizon"
  }
}
```

### 6. Content Enhancement APIs

#### Enrich Content
```http
POST /content/enrich
Content-Type: application/json

{
  "requirements": "Transform this outline into a comprehensive business proposal with detailed sections, financial projections, and risk analysis",
  "content": "AI Customer Service Platform\n- Reduce response time\n- Improve satisfaction\n- Cost savings",
  "content_type": "business_proposal",
  "context_info": "B2B SaaS company targeting enterprise clients",
  "use_past_results": true
}

Response: 200 OK
{
  "enhancement_id": "enh_001",
  "original_content": "AI Customer Service Platform...",
  "enhanced_content": "# AI Customer Service Platform: Comprehensive Business Proposal\n\n## Executive Summary\nOur AI Customer Service Platform represents a transformative solution designed to revolutionize customer support operations for enterprise clients...\n\n## Market Analysis\n[Detailed 2000+ word comprehensive proposal with sections, tables, financial projections, implementation timeline, risk analysis, competitive landscape, ROI calculations, etc.]",
  "status": "completed"
}
```

#### Apply Style to Content
```http
POST /content/style
Content-Type: application/json

{
  "content": "Our AI platform helps companies handle customer questions faster and better.",
  "style": "professional_executive",
  "content_type": "executive_summary",
  "temperature": 0.7
}

Response: 200 OK
{
  "enhancement_id": "style_001", 
  "enhanced_content": "Our advanced artificial intelligence platform empowers enterprise organizations to significantly accelerate customer inquiry resolution while substantially enhancing service quality and customer satisfaction metrics.",
  "style": "professional_executive"
}
```

### 7. Grounding System APIs

#### Add Grounding to Agent
```http
POST /grounding/add
Content-Type: application/json

{
  "source_type": "local_files",
  "source_paths": ["./financial_data/", "./market_reports/2024/"],
  "agent_id": "lisa",
  "grounding_name": "Financial Analysis Data"
}

Response: 200 OK
{
  "grounding_id": "ground_001",
  "agent_id": "lisa",
  "available_documents": [
    "Q4_Financial_Report.pdf",
    "Market_Trends_Analysis.docx", 
    "Competitive_Landscape.json"
  ],
  "status": "active"
}
```

#### Query Grounded Documents
```http
POST /grounding/query-documents
Content-Type: application/json

{
  "agent_id": "lisa",
  "query_type": "retrieve",
  "document_name": "Q4_Financial_Report.pdf"
}

Response: 200 OK
{
  "agent_id": "lisa",
  "result": "I have reviewed the Q4 Financial Report. Key findings include 23% revenue growth, improved profit margins of 15.2%, and strong performance in the enterprise segment...",
  "status": "completed"
}
```

### 8. Document Creation APIs

#### Create Professional Document
```http
POST /documents/create
Content-Type: application/json

{
  "agent_id": "lisa",
  "title": "AI Implementation Strategy Report",
  "content_prompt": "Create a comprehensive implementation strategy for AI adoption in enterprise customer service, including technical requirements, timeline, budget considerations, and risk mitigation strategies",
  "use_enrichment": true,
  "export_formats": ["md", "docx", "pdf"]
}

Response: 200 OK
{
  "document_id": "doc_001",
  "title": "AI Implementation Strategy Report",
  "status": "completed",
  "export_paths": {
    "md": "./exports/AI_Implementation_Strategy_Report.Lisa_Carter.md",
    "docx": "./exports/AI_Implementation_Strategy_Report.Lisa_Carter.docx", 
    "pdf": "./exports/AI_Implementation_Strategy_Report.Lisa_Carter.pdf"
  },
  "content_preview": "# AI Implementation Strategy Report\n\n## Executive Summary\nThis comprehensive strategy outlines a systematic approach to implementing artificial intelligence solutions within enterprise customer service operations..."
}
```

#### Create Document with Grounded Agent
```http
POST /documents/create-with-agent
Content-Type: application/json

{
  "agent_specification": "lisa",
  "custom_name": "AI Strategy Consultant",
  "document_task": "Write a detailed market analysis report on the AI customer service industry, incorporating the latest financial data and market trends",
  "grounding_sources": [
    {
      "type": "local_files",
      "paths": ["./market_data/ai_industry/", "./financial_reports/"]
    }
  ],
  "use_enrichment": true
}

Response: 200 OK
{
  "document_id": "doc_002", 
  "title": "AI Customer Service Market Analysis Report",
  "status": "completed",
  "export_paths": {
    "md": "./exports/AI_Customer_Service_Market_Analysis_Report.AI_Strategy_Consultant.md",
    "docx": "./exports/AI_Customer_Service_Market_Analysis_Report.AI_Strategy_Consultant.docx"
  }
}
```

## Authentication & Rate Limits

### API Key Tiers
```yaml
Free Tier:
  - 500 persona interactions/month
  - 10 research studies/month
  - Basic demographic sampling

Professional Tier ($99/month):
  - 5,000 persona interactions/month  
  - 100 research studies/month
  - Advanced demographic sampling
  - MCP server access

Enterprise Tier (Custom):
  - Unlimited usage
  - Custom demographic populations
  - Dedicated support
  - White-label options
```

## Implementation Architecture

### Service Stack
```
FastAPI Application (v3.0 - Phase 4 Enhanced)
├── /personas (Rich persona management)
├── /research (Market research patterns) 
├── /simulate (Advanced simulation)
├── /worlds (Enhanced world simulations) 🆕
├── /content (Content enhancement suite) 🆕
├── /grounding (Data source integration) 🆕
├── /documents (Professional document creation) 🆕
└── /mcp (MCP server endpoints)

TinyTroupe Core (Full Integration)
├── Agent Loading (production registry)
├── Enhanced Worlds (TinyWorld, TinySocialNetwork)
├── Content Enhancement (TinyEnricher, TinyStyler)
├── Grounding System (FilesAndWebGroundingFaculty)
├── Document Creation (TinyWordProcessor, ArtifactExporter)
├── Factory Integration (demographic sampling)
├── Research Patterns (proven methodologies)
├── Result Extraction (structured output)
├── Temporal Simulation (TinyCalendar integration)
└── Validation (quality assurance)

External Integrations
├── ActivePieces (workflow nodes)
├── MCP Protocol (AI agent tools)
├── Document Export (MD, DOCX, PDF, JSON)
├── File System (grounding data sources)
└── Analytics (usage tracking)
```

### Key Implementation Benefits

1. **🚀 Complete TinyTroupe Integration**: Full access to all TinyTroupe modules and capabilities
2. **🌍 Advanced Simulation Engine**: Multi-environment, social networks, temporal progression
3. **📝 Professional Content Suite**: Content enhancement, styling, and document generation
4. **🔗 Data-Driven Intelligence**: Grounding system connects agents to real-world data sources
5. **⚡ Production-Ready Architecture**: Scalable, validated, and battle-tested patterns
6. **🔧 Multiple Integration Points**: REST API + ActivePieces + MCP + Document Export
7. **📊 Enterprise-Grade Output**: Professional documents in multiple formats (MD, DOCX, PDF)
8. **🎯 Forward-Compatible Design**: Database-ready agent registry and extensible architecture

## 🎯 Phase 4 Achievements Summary

✅ **Enhanced World Simulations** - Multi-environment, social networks, temporal simulations
✅ **Content Enhancement Suite** - TinyEnricher and TinyStyler APIs for professional content
✅ **Grounding System** - Connect agents to files, web pages, and documents
✅ **Document Creation Platform** - Professional document generation with TinyWordProcessor
✅ **Investment Firm Simulations** - Financial consultation scenarios
✅ **Production-Ready Agent Registry** - Database forward-compatible architecture
✅ **Multi-Format Export** - Markdown, DOCX, JSON, PDF document support

This enhanced specification provides the most sophisticated TinyTroupe microservice available, leveraging all existing capabilities through modern API interfaces while adding powerful new content creation and data integration features.