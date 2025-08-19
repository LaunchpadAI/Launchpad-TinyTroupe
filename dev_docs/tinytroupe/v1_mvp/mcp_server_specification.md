# TinyTroupe MCP Server Specification
## Model Context Protocol Integration for AI Agent Market Research

### Overview

This specification defines MCP (Model Context Protocol) server tools that enable AI agents to directly access TinyTroupe's sophisticated market research capabilities. AI agents can generate personas, run simulations, and extract insights through natural language interfaces.

**Key Benefits:**
- AI agents can conduct market research autonomously
- No manual API integration required
- Natural language interfaces for complex research tasks
- Seamless integration with Claude, GPT, and other AI systems

## MCP Server Configuration

```json
{
  "mcpServers": {
    "tinytroupe-research": {
      "command": "npx",
      "args": ["@tinytroupe/mcp-server"],
      "env": {
        "TINYTROUPE_API_KEY": "your-api-key-here",
        "TINYTROUPE_BASE_URL": "https://api.tinytroupe-research.com/v1"
      }
    }
  }
}
```

## Core MCP Tools

### 1. Persona Management Tools

#### `create_market_personas`
```python
@mcp_tool("create_market_personas")
def create_market_personas(
    population: str,
    sample_size: int,
    demographic_criteria: str,
    behavioral_traits: Optional[List[str]] = None
) -> dict:
    """
    Create diverse market personas for research
    
    Args:
        population: Population source (usa, spain, brazil)
        sample_size: Number of personas to generate (10-200)
        demographic_criteria: Natural language criteria like "health-conscious millennials with disposable income"
        behavioral_traits: Optional list of traits like ["price_sensitive", "tech_early_adopter"]
    
    Returns:
        Dictionary with persona_ids, sample_statistics, and persona_summaries
        
    Example:
        create_market_personas(
            population="usa",
            sample_size=50, 
            demographic_criteria="urban professionals aged 28-45 who care about sustainability",
            behavioral_traits=["price_conscious", "health_conscious"]
        )
    """
    pass

@mcp_tool("load_expert_persona")
def load_expert_persona(
    expert_type: str,
    customizations: Optional[dict] = None
) -> dict:
    """
    Load a pre-built expert persona with rich background
    
    Args:
        expert_type: Type of expert (data_scientist, architect, physician, financial_advisor)
        customizations: Optional modifications like age, location, specific experience
    
    Returns:
        Dictionary with persona_id, detailed_background, and capabilities
        
    Example:
        load_expert_persona(
            expert_type="data_scientist",
            customizations={"specialization": "machine learning", "industry": "fintech"}
        )
    """
    pass
```

### 2. Market Research Tools

#### `test_product_concept`
```python
@mcp_tool("test_product_concept")
def test_product_concept(
    product_name: str,
    product_description: str,
    target_market: str,
    price_range: Optional[str] = None,
    sample_size: int = 50,
    evaluation_questions: Optional[List[str]] = None
) -> dict:
    """
    Test a product concept with diverse market personas
    
    Args:
        product_name: Name of the product
        product_description: Detailed description of the product and its benefits
        target_market: Target market description (e.g., "health-conscious professionals")
        price_range: Expected price range (e.g., "$10-20")
        sample_size: Number of personas to test with
        evaluation_questions: Custom questions, defaults to standard market research questions
    
    Returns:
        Dictionary with market_verdict, mean_score, insights, and detailed_responses
        
    Example:
        test_product_concept(
            product_name="EcoSmart Water Bottle",
            product_description="Self-cleaning water bottle with UV sterilization and temperature control",
            target_market="environmentally conscious urban professionals",
            price_range="$40-60"
        )
    """
    pass

@mcp_tool("compare_marketing_messages")
def compare_marketing_messages(
    product_name: str,
    message_variants: List[dict],
    target_audience: str,
    sample_size: int = 30
) -> dict:
    """
    Compare different marketing messages or advertisements
    
    Args:
        product_name: Name of the product being marketed
        message_variants: List of message variants with title, copy, and key_messages
        target_audience: Description of target audience
        sample_size: Number of personas to test with
    
    Returns:
        Dictionary with winning_message, detailed_comparison, and audience_insights
        
    Example:
        compare_marketing_messages(
            product_name="Fitness App",
            message_variants=[
                {"title": "Get Fit Fast", "copy": "Transform your body in 30 days", "key_messages": ["speed", "results"]},
                {"title": "Sustainable Fitness", "copy": "Build lasting healthy habits", "key_messages": ["longevity", "wellness"]}
            ],
            target_audience="busy professionals who want to stay healthy"
        )
    """
    pass

@mcp_tool("analyze_market_segments")
def analyze_market_segments(
    product_concept: str,
    segments_to_test: List[str],
    evaluation_question: str = "Would you be interested in this product?"
) -> dict:
    """
    Compare product acceptance across different market segments
    
    Args:
        product_concept: Description of the product or service
        segments_to_test: List of market segments to analyze (e.g., ["millennials", "gen_x", "families"])  
        evaluation_question: Question to ask each segment
    
    Returns:
        Dictionary with segment_comparison, best_segment, insights, and recommendations
        
    Example:
        analyze_market_segments(
            product_concept="Premium meal kit delivery service focused on organic ingredients",
            segments_to_test=["young_professionals", "families_with_children", "empty_nesters"],
            evaluation_question="Would you subscribe to this meal delivery service?"
        )
    """
    pass
```

### 3. Advanced Research Tools

#### `run_focus_group`
```python
@mcp_tool("run_focus_group")
def run_focus_group(
    topic: str,
    participant_criteria: str,
    moderator_questions: List[str],
    group_size: int = 6,
    enable_interaction: bool = False
) -> dict:
    """
    Simulate a focus group discussion on any topic
    
    Args:
        topic: Focus group topic or product to discuss
        participant_criteria: Criteria for selecting participants
        moderator_questions: List of questions for the moderator to ask
        group_size: Number of participants (3-8)
        enable_interaction: Whether participants can respond to each other
    
    Returns:
        Dictionary with session_transcripts, thematic_analysis, key_insights, and recommendations
        
    Example:
        run_focus_group(
            topic="Electric vehicle adoption barriers",
            participant_criteria="car owners aged 30-50 considering their next vehicle purchase",
            moderator_questions=[
                "What's your current impression of electric vehicles?",
                "What would motivate you to choose electric for your next car?", 
                "What concerns do you have about electric vehicles?"
            ]
        )
    """
    pass

@mcp_tool("simulate_customer_interview")
def simulate_customer_interview(
    customer_profile: str,
    interview_topic: str,
    interview_questions: List[str],
    interview_context: Optional[str] = None
) -> dict:
    """
    Conduct an in-depth customer interview simulation
    
    Args:
        customer_profile: Detailed description of the customer to interview
        interview_topic: Topic or domain for the interview
        interview_questions: List of questions to explore
        interview_context: Additional context about the interview scenario
    
    Returns:
        Dictionary with interview_transcript, key_insights, pain_points, and opportunities
        
    Example:
        simulate_customer_interview(
            customer_profile="Small business owner running an online retail store, struggles with inventory management",
            interview_topic="Business operations and pain points",
            interview_questions=[
                "Tell me about your typical day managing your business",
                "What are your biggest challenges right now?",
                "What tools do you use and what's missing?"
            ]
        )
    """
    pass
```

### 4. Persona Analysis Tools

#### `analyze_persona_reaction`
```python
@mcp_tool("analyze_persona_reaction")
def analyze_persona_reaction(
    persona_description: str,
    stimulus_type: str,
    stimulus_content: str,
    analysis_dimensions: List[str] = ["interest", "intent", "trust", "sentiment"]
) -> dict:
    """
    Analyze how a specific persona would react to marketing content
    
    Args:
        persona_description: Detailed persona description or persona_id
        stimulus_type: Type of stimulus (email, ad, website, product_demo)  
        stimulus_content: The actual content to analyze
        analysis_dimensions: What aspects to analyze
    
    Returns:
        Dictionary with reaction_summary, detailed_scores, reasoning, and recommendations
        
    Example:
        analyze_persona_reaction(
            persona_description="Tech-savvy millennial who values privacy and sustainability",
            stimulus_type="email_campaign",
            stimulus_content="Subject: New AI Privacy Tool - 50% Launch Discount\nBody: Protect your data with our revolutionary AI...",
            analysis_dimensions=["interest", "trust", "privacy_concern", "purchase_intent"]
        )
    """
    pass

@mcp_tool("compare_persona_reactions")
def compare_persona_reactions(
    personas: List[str],
    stimulus_content: str,
    comparison_focus: str = "overall_appeal"
) -> dict:
    """
    Compare how different personas react to the same stimulus
    
    Args:
        personas: List of persona descriptions or persona_ids
        stimulus_content: Content to test with all personas
        comparison_focus: What to focus the comparison on
    
    Returns:
        Dictionary with persona_comparisons, key_differences, and targeting_recommendations
        
    Example:
        compare_persona_reactions(
            personas=["budget-conscious parent", "luxury-focused professional", "environmentally-conscious millennial"],
            stimulus_content="Premium organic skincare line - starting at $45",
            comparison_focus="purchase_likelihood"
        )
    """
    pass
```

### 5. Research Insights Tools

#### `extract_market_insights`
```python
@mcp_tool("extract_market_insights")
def extract_market_insights(
    research_data: dict,
    insight_focus: str,
    output_format: str = "executive_summary"
) -> dict:
    """
    Extract specific insights from completed research
    
    Args:
        research_data: Results from previous research tools
        insight_focus: What insights to focus on (pricing, messaging, segments, etc.)
        output_format: How to format the output (executive_summary, detailed_analysis, bullet_points)
    
    Returns:
        Dictionary with key_insights, supporting_evidence, and actionable_recommendations
        
    Example:
        extract_market_insights(
            research_data=previous_research_results,
            insight_focus="optimal_pricing_strategy",
            output_format="executive_summary"
        )
    """
    pass

@mcp_tool("generate_persona_profiles")
def generate_persona_profiles(
    market_segment: str,
    use_case: str,
    profile_depth: str = "detailed"
) -> dict:
    """
    Generate detailed persona profiles for a market segment
    
    Args:
        market_segment: Market segment to profile (e.g., "B2B SaaS buyers")
        use_case: Specific use case or context (e.g., "enterprise software purchasing")  
        profile_depth: Level of detail (summary, detailed, comprehensive)
    
    Returns:
        Dictionary with persona_profiles including demographics, motivations, pain_points, and behaviors
        
    Example:
        generate_persona_profiles(
            market_segment="Healthcare IT decision makers",
            use_case="evaluating patient management software",
            profile_depth="comprehensive"
        )
    """
    pass
```

### 6. Workflow & Campaign Tools

#### `design_research_study`
```python
@mcp_tool("design_research_study")
def design_research_study(
    research_objective: str,
    target_market: str,
    research_budget: Optional[str] = None,
    timeline: Optional[str] = None
) -> dict:
    """
    Design a comprehensive market research study plan
    
    Args:
        research_objective: What you want to learn (e.g., "understand barriers to product adoption")
        target_market: Market or audience to research
        research_budget: Optional budget constraints
        timeline: Optional timeline requirements
    
    Returns:
        Dictionary with study_design, methodology, sample_requirements, and expected_outcomes
        
    Example:
        design_research_study(
            research_objective="Understand why customers churn from our SaaS platform",
            target_market="B2B customers who cancelled in the last 6 months",
            research_budget="limited",
            timeline="2 weeks"
        )
    """
    pass

@mcp_tool("optimize_campaign_targeting")
def optimize_campaign_targeting(
    campaign_description: str,
    current_performance: Optional[dict] = None,
    optimization_goal: str = "conversion_rate"
) -> dict:
    """
    Optimize marketing campaign targeting using persona insights
    
    Args:
        campaign_description: Description of the marketing campaign
        current_performance: Optional current performance metrics
        optimization_goal: What to optimize for (conversion_rate, engagement, roi)
    
    Returns:
        Dictionary with targeting_recommendations, message_optimizations, and expected_improvements
        
    Example:
        optimize_campaign_targeting(
            campaign_description="Email campaign for new project management tool targeting small businesses",
            current_performance={"open_rate": 0.18, "click_rate": 0.03, "conversion_rate": 0.005},
            optimization_goal="conversion_rate"
        )
    """
    pass
```

## Usage Examples

### Example 1: Product Launch Research
```python
# AI Agent conversation example
user: "I'm launching a new sustainable phone case. Help me understand the market."

# AI Agent uses MCP tools:
result1 = create_market_personas(
    population="usa",
    sample_size=100,
    demographic_criteria="environmentally conscious consumers aged 20-45 who buy phone accessories",
    behavioral_traits=["sustainability_focused", "price_conscious"]
)

result2 = test_product_concept(
    product_name="EcoCase Pro",
    product_description="Phone case made from 100% recycled ocean plastic with biodegradable packaging",
    target_market="eco-conscious smartphone users",
    price_range="$25-35"
)

result3 = extract_market_insights(
    research_data=result2,
    insight_focus="pricing_and_positioning",
    output_format="executive_summary"
)

# AI Agent provides natural language summary of findings
```

### Example 2: Marketing Message Optimization
```python
# AI Agent conversation example
user: "Which email subject line will work better for our fitness app?"

result = compare_marketing_messages(
    product_name="FitTracker Pro",
    message_variants=[
        {"title": "Transform Your Body in 30 Days", "copy": "Get the body you've always wanted...", "key_messages": ["transformation", "speed"]},
        {"title": "Build Sustainable Fitness Habits", "copy": "Create lasting change with science-based workouts...", "key_messages": ["habits", "science"]}
    ],
    target_audience="busy professionals who want to get fit but have limited time"
)

# AI Agent explains which message performed better and why
```

### Example 3: Customer Research
```python
# AI Agent conversation example  
user: "I need to understand why users aren't upgrading to our premium plan"

interview_result = simulate_customer_interview(
    customer_profile="Free tier user who has been active for 3+ months but hasn't upgraded",
    interview_topic="Premium upgrade decision factors",
    interview_questions=[
        "What value do you get from the free version?",
        "What would motivate you to upgrade?",
        "What concerns do you have about the premium plan?"
    ]
)

focus_result = run_focus_group(
    topic="Premium plan upgrade barriers",
    participant_criteria="active free users who have considered upgrading",
    moderator_questions=[
        "What's missing from the free plan?",
        "How do you perceive the value of premium features?",
        "What price would feel fair for premium?"
    ]
)

# AI Agent synthesizes insights and provides upgrade strategy recommendations
```

## MCP Server Implementation

### Server Structure
```
tinytroupe-mcp-server/
├── package.json
├── src/
│   ├── server.ts           # Main MCP server
│   ├── tools/             # Tool implementations
│   │   ├── personas.ts    # Persona management tools
│   │   ├── research.ts    # Market research tools
│   │   ├── simulation.ts  # Advanced simulation tools
│   │   └── insights.ts    # Analysis and insights tools
│   ├── lib/
│   │   ├── api-client.ts  # TinyTroupe API client
│   │   ├── types.ts       # Type definitions
│   │   └── utils.ts       # Utility functions
└── README.md
```

### Tool Registration Example
```typescript
// server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'tinytroupe-research',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Register all tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'test_product_concept',
      description: 'Test a product concept with diverse market personas',
      inputSchema: {
        type: 'object',
        properties: {
          product_name: { type: 'string' },
          product_description: { type: 'string' },
          target_market: { type: 'string' },
          price_range: { type: 'string', optional: true },
          sample_size: { type: 'number', default: 50 }
        },
        required: ['product_name', 'product_description', 'target_market']
      }
    },
    // ... other tools
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Route to appropriate tool implementation
});
```

### Authentication & Configuration
```typescript
// api-client.ts
class TinyTroupeClient {
  constructor(
    private apiKey: string,
    private baseUrl: string = 'https://api.tinytroupe-research.com/v1'
  ) {}

  async callAPI(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
}
```

This MCP server specification enables AI agents to conduct sophisticated market research through natural language interactions, making TinyTroupe's capabilities accessible to any AI system that supports the Model Context Protocol.