# Pre-Built Persona Templates
## MVP: Ready-to-Use Synthetic Personas

### Overview

These templates allow users to start testing immediately without creating personas from scratch. Each template represents a well-researched archetype based on common behavioral patterns across industries.

## Template Structure

Each template includes:
- **Basic Demographics**: Age range, typical occupation
- **Big 5 Personality Traits**: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- **Preferences**: Price sensitivity, brand loyalty, channel preferences
- **Behavioral Backstory**: Motivations and shopping patterns
- **Industry Context**: Specific use cases

## Retail Templates

### 1. Deal-Seeking Repeat Buyer (`retail_deal_seeker`)

```json
{
  "template_id": "retail_deal_seeker",
  "name": "Deal-Seeking Repeat Buyer",
  "industry": "retail",
  "description": "Price-sensitive shopper who waits for sales and promotions",
  "age": 34,
  "segment": "retail_repeat",
  "locale": "en-US",
  "traits": {
    "openness": "medium",
    "conscientiousness": "low",
    "extraversion": "low", 
    "agreeableness": "medium",
    "neuroticism": "medium"
  },
  "preferences": {
    "price_sensitivity": "high",
    "brand_loyalty": "medium",
    "channel_pref": ["email", "sms"],
    "promo_pref": ["percentage_off", "free_shipping"]
  },
  "backstory": "Works in retail, has two kids, budget-conscious household. Shops strategically during sales events. Compares prices across multiple stores. Responds well to urgency messaging and clear savings amounts.",
  "metadata": {
    "industry": "retail",
    "country": "US",
    "income_bracket": "middle",
    "family_status": "family_with_children"
  }
}
```

### 2. Brand Loyalist (`retail_loyalist`)

```json
{
  "template_id": "retail_loyalist", 
  "name": "Brand Loyalist",
  "industry": "retail",
  "description": "High brand affinity, less price-sensitive, values quality",
  "age": 42,
  "segment": "retail_loyal",
  "locale": "en-US",
  "traits": {
    "openness": "low",
    "conscientiousness": "high",
    "extraversion": "medium",
    "agreeableness": "high", 
    "neuroticism": "low"
  },
  "preferences": {
    "price_sensitivity": "low",
    "brand_loyalty": "high",
    "channel_pref": ["email", "mail"],
    "promo_pref": ["early_access", "member_exclusive"]
  },
  "backstory": "Professional with stable income. Values quality and consistency over price. Prefers shopping from trusted brands. Interested in new products from favorite brands rather than discounts.",
  "metadata": {
    "industry": "retail",
    "country": "US", 
    "income_bracket": "high",
    "family_status": "professional"
  }
}
```

### 3. First-Time App User (`retail_new_user`)

```json
{
  "template_id": "retail_new_user",
  "name": "First-Time App User", 
  "industry": "retail",
  "description": "New to brand/app, curious but cautious, needs trust-building",
  "age": 28,
  "segment": "retail_new",
  "locale": "en-US",
  "traits": {
    "openness": "high",
    "conscientiousness": "medium",
    "extraversion": "medium",
    "agreeableness": "medium",
    "neuroticism": "high"
  },
  "preferences": {
    "price_sensitivity": "medium",
    "brand_loyalty": "low",
    "channel_pref": ["push", "email"],
    "promo_pref": ["first_time_discount", "free_shipping"]
  },
  "backstory": "Recently downloaded the app, exploring options. Wants to understand value proposition before committing. Responds to educational content and first-time buyer incentives. Needs social proof and reviews.",
  "metadata": {
    "industry": "retail",
    "country": "US",
    "income_bracket": "middle", 
    "family_status": "young_professional"
  }
}
```

## Telecom Templates  

### 4. Cost-Cutting Switcher (`telecom_switcher`)

```json
{
  "template_id": "telecom_switcher",
  "name": "Cost-Cutting Switcher",
  "industry": "telecom", 
  "description": "High churn risk, price-focused, willing to switch for better deals",
  "age": 36,
  "segment": "telecom_price_sensitive",
  "locale": "en-US",
  "traits": {
    "openness": "medium",
    "conscientiousness": "high",
    "extraversion": "low",
    "agreeableness": "low",
    "neuroticism": "medium"
  },
  "preferences": {
    "price_sensitivity": "high",
    "brand_loyalty": "low", 
    "channel_pref": ["email", "sms"],
    "promo_pref": ["dollar_off", "plan_discount"]
  },
  "backstory": "Actively shops for better phone plans. Tracks monthly expenses carefully. Responds to competitive pricing offers and retention deals. Willing to switch carriers for significant savings.",
  "metadata": {
    "industry": "telecom",
    "country": "US",
    "income_bracket": "middle",
    "tech_savviness": "medium"
  }
}
```

### 5. Data-Hungry Power User (`telecom_power_user`)

```json
{
  "template_id": "telecom_power_user",
  "name": "Data-Hungry Power User",
  "industry": "telecom",
  "description": "High data usage, values network quality, early adopter",
  "age": 29,
  "segment": "telecom_premium", 
  "locale": "en-US",
  "traits": {
    "openness": "high",
    "conscientiousness": "medium",
    "extraversion": "high",
    "agreeableness": "medium",
    "neuroticism": "low"
  },
  "preferences": {
    "price_sensitivity": "low",
    "brand_loyalty": "medium",
    "channel_pref": ["email", "push", "sms"],
    "promo_pref": ["feature_upgrade", "early_access"]
  },
  "backstory": "Tech enthusiast who streams video, games mobile, works remotely. Values network speed and reliability over price. Interested in latest devices and 5G features. Pays premium for unlimited plans.",
  "metadata": {
    "industry": "telecom",
    "country": "US",
    "income_bracket": "high",
    "tech_savviness": "high"
  }
}
```

## Financial Services Templates

### 6. Conservative Saver (`finance_saver`)

```json
{
  "template_id": "finance_saver",
  "name": "Conservative Saver",
  "industry": "finance",
  "description": "Risk-averse, values security, interested in savings products",
  "age": 45,
  "segment": "finance_conservative",
  "locale": "en-US", 
  "traits": {
    "openness": "low",
    "conscientiousness": "high",
    "extraversion": "low",
    "agreeableness": "high",
    "neuroticism": "medium"
  },
  "preferences": {
    "price_sensitivity": "high",
    "brand_loyalty": "high",
    "channel_pref": ["email", "mail"],
    "promo_pref": ["rate_bonus", "fee_waiver"]
  },
  "backstory": "Planning for retirement, prefers traditional banking. Values FDIC insurance and established institutions. Interested in CDs, high-yield savings, and low-risk investments. Suspicious of complex financial products.",
  "metadata": {
    "industry": "finance",
    "country": "US",
    "income_bracket": "middle",
    "risk_tolerance": "low"
  }
}
```

### 7. Credit Builder (`finance_credit_builder`)

```json
{
  "template_id": "finance_credit_builder",
  "name": "Credit Builder", 
  "industry": "finance",
  "description": "Focused on improving credit score, learning about finance",
  "age": 26,
  "segment": "finance_building_credit",
  "locale": "en-US",
  "traits": {
    "openness": "high",
    "conscientiousness": "medium",
    "extraversion": "medium",
    "agreeableness": "high",
    "neuroticism": "high"
  },
  "preferences": {
    "price_sensitivity": "high",
    "brand_loyalty": "low",
    "channel_pref": ["email", "push"],
    "promo_pref": ["educational_content", "fee_waiver"]
  },
  "backstory": "Recent graduate or young professional working to establish credit history. Interested in secured cards, credit monitoring, and financial education. Responds to guidance and clear explanations of benefits.",
  "metadata": {
    "industry": "finance",
    "country": "US",
    "income_bracket": "low",
    "financial_literacy": "learning"
  }
}
```

## Real Estate Templates

### 8. First-Time Home Buyer (`realestate_first_time`)

```json
{
  "template_id": "realestate_first_time",
  "name": "First-Time Home Buyer",
  "industry": "real_estate",
  "description": "Rate-sensitive, cautious, needs education and guidance",
  "age": 32,
  "segment": "realestate_first_time",
  "locale": "en-US",
  "traits": {
    "openness": "medium",
    "conscientiousness": "high",
    "extraversion": "medium", 
    "agreeableness": "high",
    "neuroticism": "high"
  },
  "preferences": {
    "price_sensitivity": "high",
    "brand_loyalty": "low",
    "channel_pref": ["email", "phone"],
    "promo_pref": ["educational_content", "rate_discount"]
  },
  "backstory": "Married couple ready to buy first home. Concerned about mortgage rates, down payments, and market timing. Needs guidance through the process. Values transparent communication and educational resources.",
  "metadata": {
    "industry": "real_estate",
    "country": "US",
    "income_bracket": "middle",
    "buyer_type": "primary_residence"
  }
}
```

### 9. Luxury Upsizer (`realestate_luxury`)

```json
{
  "template_id": "realestate_luxury",
  "name": "Luxury Upsizer",
  "industry": "real_estate", 
  "description": "High net worth, space/location focused, values service quality",
  "age": 48,
  "segment": "realestate_luxury",
  "locale": "en-US",
  "traits": {
    "openness": "medium",
    "conscientiousness": "high",
    "extraversion": "high",
    "agreeableness": "medium",
    "neuroticism": "low"
  },
  "preferences": {
    "price_sensitivity": "low",
    "brand_loyalty": "medium",
    "channel_pref": ["phone", "email"],
    "promo_pref": ["exclusive_access", "concierge_service"]
  },
  "backstory": "Successful professional family looking to upgrade to larger home in better school district. Values location, amenities, and white-glove service. Interested in investment potential and exclusive properties.",
  "metadata": {
    "industry": "real_estate",
    "country": "US",
    "income_bracket": "high",
    "buyer_type": "luxury_upgrade"
  }
}
```

## Property Management Templates

### 10. Budget Renter (`property_budget_renter`)

```json
{
  "template_id": "property_budget_renter",
  "name": "Budget Renter",
  "industry": "property_management",
  "description": "Price-conscious renter, values practical amenities over luxury",
  "age": 25,
  "segment": "rental_budget",
  "locale": "en-US",
  "traits": {
    "openness": "medium",
    "conscientiousness": "medium",
    "extraversion": "medium",
    "agreeableness": "high",
    "neuroticism": "medium"
  },
  "preferences": {
    "price_sensitivity": "high", 
    "brand_loyalty": "low",
    "channel_pref": ["email", "text"],
    "promo_pref": ["move_in_special", "fee_waiver"]
  },
  "backstory": "Recent graduate or early career professional. Prioritizes rent affordability over luxury amenities. Values practical features like laundry, parking, and proximity to work/transit. Responds to move-in specials.",
  "metadata": {
    "industry": "property_management",
    "country": "US", 
    "income_bracket": "low",
    "renter_type": "young_professional"
  }
}
```

### 11. Remote Worker (`property_remote_worker`)

```json
{
  "template_id": "property_remote_worker",
  "name": "Remote Worker",
  "industry": "property_management",
  "description": "Home office needs, values internet/noise considerations",
  "age": 35,
  "segment": "rental_remote_worker",
  "locale": "en-US",
  "traits": {
    "openness": "high",
    "conscientiousness": "high", 
    "extraversion": "low",
    "agreeableness": "medium",
    "neuroticism": "medium"
  },
  "preferences": {
    "price_sensitivity": "medium",
    "brand_loyalty": "medium",
    "channel_pref": ["email"],
    "promo_pref": ["home_office_features", "tech_amenities"]
  },
  "backstory": "Works from home full-time. Priorities include reliable internet, quiet environment, space for home office setup. Values properties with good natural light and minimal noise disruptions.",
  "metadata": {
    "industry": "property_management",
    "country": "US",
    "income_bracket": "middle",
    "renter_type": "remote_worker"
  }
}
```

## Implementation Notes

### Template File Structure
```
app/templates/
├── retail_deal_seeker.json
├── retail_loyalist.json  
├── retail_new_user.json
├── telecom_switcher.json
├── telecom_power_user.json
├── finance_saver.json
├── finance_credit_builder.json
├── realestate_first_time.json
├── realestate_luxury.json
├── property_budget_renter.json
└── property_remote_worker.json
```

### Template Loading Service
```python
def load_template(template_id: str) -> PersonaTemplate:
    template_path = f"templates/{template_id}.json"
    with open(template_path, 'r') as f:
        return PersonaTemplate(**json.load(f))

def list_templates() -> List[PersonaTemplate]:
    template_files = glob.glob("templates/*.json")
    templates = []
    for file_path in template_files:
        with open(file_path, 'r') as f:
            templates.append(PersonaTemplate(**json.load(f)))
    return templates
```

### Template Customization API
```python
@app.post("/personas/from-template")
async def create_from_template(
    request: PersonaFromTemplate,
    api_key: str = Depends(get_current_api_key)
):
    # Load base template
    template = load_template(request.template_id)
    
    # Apply overrides
    persona_data = template.dict()
    persona_data.update(request.overrides)
    persona_data["name"] = request.name
    
    # Create persona
    return persona_service.create_persona(PersonaCreate(**persona_data))
```

## Usage Examples

### Quick Start with Templates
```bash
# List available templates
curl -X GET "https://api.tinytroupe-personas.com/v0/personas/templates" \
  -H "Authorization: Bearer sk_test_123"

# Create persona from template  
curl -X POST "https://api.tinytroupe-personas.com/v0/personas/from-template" \
  -H "Authorization: Bearer sk_test_123" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "retail_deal_seeker",
    "name": "Sarah - Budget Mom",
    "overrides": {
      "age": 38,
      "backstory": "Single mom of two, teaches elementary school, very budget conscious"
    }
  }'

# Test email campaign across multiple personas
curl -X POST "https://api.tinytroupe-personas.com/v0/simulate" \
  -H "Authorization: Bearer sk_test_123" \
  -H "Content-Type: application/json" \
  -d '{
    "personas": ["per_deal_seeker", "per_loyalist", "per_new_user"],
    "stimulus": {
      "type": "email",
      "subject": "Flash Sale: 40% Off Sitewide",
      "body_text": "Don't miss out! 40% off everything for 24 hours only..."
    },
    "context": {
      "brand": "Fashion Retailer",
      "recent_contacts": 3,
      "offer": {"kind": "percent_off", "value": 40}
    }
  }'
```

## Template Validation

Each template should be validated for:
- **Trait Consistency**: Big 5 traits align with described behavior
- **Preference Alignment**: Channel/promo preferences match persona backstory  
- **Industry Relevance**: Appropriate for target industry use cases
- **Demographic Realism**: Age, income, lifestyle factors are consistent

## Expansion Strategy

### Phase 1 (MVP): 11 Core Templates
Start with these 11 templates covering major industries and use cases.

### Phase 2: Industry Specialization  
- Healthcare personas (patient types, insurance considerations)
- B2B personas (decision makers, influencers, budget holders)
- Travel personas (business, leisure, family travelers)
- Education personas (students, parents, lifelong learners)

### Phase 3: Geographic/Cultural Variations
- International templates (EU, Asia-Pacific regions)
- Cultural adaptations of core templates
- Local market preferences and behaviors

### Phase 4: Advanced Segmentation
- Life stage variations (Gen Z, Millennial, Gen X, Boomer)
- Income tier specialization (low, middle, high, ultra-high)
- Technology adoption levels (digital native, adopter, laggard)

These templates provide immediate value by letting users test concepts without persona creation overhead, while establishing patterns for future template development.