# Enhanced Prompting Strategy for Authentic Personas

## Current Problem Analysis

### What's Happening Now:
1. **Generic Business Prompt**: "As high net worth individuals with experience in luxury real estate, please discuss..."
2. **Formal Structure**: Properties presented as bullet-point specifications
3. **Professional Framing**: "Please provide specific, actionable recommendations"
4. **No Personal Activation**: Nothing triggers personal experiences or authentic voice

### Why Personas Sound Similar:
- The prompt activates their "professional consultant" mode
- No personal context or emotional triggers
- Formal presentation encourages formal responses
- Missing conversational framing

## Enhanced Prompting Strategy

### Level 1: Stimulus Enhancement (Frontend)

#### Current Stimulus:
```
Property Overview:
- Address: 55 Fagan Dr
- Asking Price: $10,000,000
- Size: 8,500 sq ft
...

As high net worth individuals with experience in luxury real estate, please discuss:
1. Should the seller make modifications?
2. What renovations would add value?
```

#### Enhanced Authentic Stimulus:
```
Hey everyone, thanks for coming by. I wanted to get your honest take on this place.

So I'm looking at this property at 55 Fagan Dr - it's listed at $10 million, about 8,500 square feet. 
Classic estate, built in the 80s, has that old-school charm but maybe needs some updates.

[Show property images if available]

I know you've all been through the property game yourselves - what's your gut reaction? 
Don't hold back, I want to hear what you really think, not the polite version.

Some things I'm wondering about:
- Is this overpriced for what it is?
- What would you change if this was your place?
- Any red flags jumping out at you?

Just talk to me like we're having a beer, not like you're my realtor trying to make a sale.
```

### Level 2: Context Priming (Backend)

Add a pre-stimulus context setter that activates personal mode:

```python
def _prepare_authentic_context(self, agent_name: str, property_type: str) -> str:
    """Prepare context that activates authentic persona voice"""
    
    contexts = {
        "Tony Parker": """
        You're at a casual dinner with some friends who are asking about real estate.
        You've had a glass of wine, you're relaxed, and you're sharing honestly.
        This reminds you of properties you've seen in your career.
        Speak naturally, use your normal expressions, tell stories if they come up.
        """,
        
        "Wayne Gretzky": """
        You're at the golf club with some buddies discussing properties.
        Janet's not here so you can speak freely about what you really think.
        This is like giving advice to a teammate - be honest but supportive.
        Use hockey analogies if they help explain your point.
        """,
        
        "Kenny Pickett": """
        You're talking with other young players about smart investments.
        Amy's asked you to look at properties together, so you're thinking practically.
        Be real about the challenges of buying property early in your career.
        This is off the record - no media present.
        """,
        
        "Brandon McManus": """
        You're geeking out with someone who actually wants to hear about smart home tech.
        They're not rolling their eyes when you talk automation specs.
        Share what you learned from your Colorado smart home experience.
        Get into the technical details you usually have to hold back.
        """
    }
    
    return contexts.get(agent_name, "")
```

### Level 3: Prompt Engineering Enhancements

#### A. Natural Conversation Triggers
```python
CONVERSATION_STARTERS = [
    "So what's your first impression?",
    "Be honest - would you buy this?",
    "What reminds you of your own property experiences?",
    "Talk to me like I'm a friend, not a client.",
    "What would {spouse/partner} say about this place?",
    "Does this remind you of any properties you've owned?"
]
```

#### B. Personal Experience Activators
```python
EXPERIENCE_TRIGGERS = {
    "mistakes": "What mistakes have you made with properties that this reminds you of?",
    "success": "Does this have potential like properties you've done well with?",
    "family": "How would this work for your family situation?",
    "lifestyle": "Does this fit your actual lifestyle, not what people think?"
}
```

#### C. Authenticity Enhancers
```python
AUTHENTICITY_PROMPTS = [
    "Forget you're being recorded - what do you really think?",
    "If this was your best friend asking, what would you say?",
    "What's the thing about this property that others might miss?",
    "Based on your specific experience, not general knowledge..."
]
```

### Level 4: System Prompt Modifications

Modify the TinyPerson system prompt to emphasize authentic voice:

```
## Additional Authenticity Directives

When responding to property evaluations or similar discussions:

1. **Use Your Natural Voice**: 
   - Employ the speech patterns defined in your persona
   - Include your verbal tics naturally
   - Don't clean up your language to sound professional

2. **Draw from Personal Experience**:
   - Reference specific properties you've owned
   - Mention mistakes you've made
   - Share what you learned the hard way

3. **Show Authentic Reactions**:
   - If something seems overpriced, say it bluntly
   - If you're not an expert on something, admit it
   - Show enthusiasm or skepticism naturally

4. **Relationship References**:
   - Mention what your spouse/partner would think
   - Reference conversations with teammates/colleagues
   - Include family considerations naturally

5. **Avoid Consultant Mode**:
   - Don't structure responses as bullet points
   - Don't try to cover every aspect systematically
   - Focus on what actually matters to YOU personally
```

### Level 5: Multi-Round Conversation Design

Structure conversations to build authenticity over rounds:

**Round 1**: Initial reactions (gut feelings, first impressions)
**Round 2**: Personal experiences (stories, comparisons)
**Round 3**: Specific concerns (what worries you, deal breakers)
**Round 4**: Final thoughts (would you actually buy it?)

### Implementation Code Updates

#### Update simulation_service.py:
```python
def _prepare_stimulus_message(self, stimulus, agent_name=None) -> str:
    """Enhanced stimulus preparation with authenticity activation"""
    
    # Start with conversational framing
    if stimulus.type == "property_evaluation":
        message = self._convert_to_conversational(stimulus.content)
    else:
        message = stimulus.content
    
    # Add personal context if agent specified
    if agent_name:
        context = self._prepare_authentic_context(agent_name, stimulus.type)
        message = f"{context}\n\n{message}"
    
    # Handle images with natural language
    if hasattr(stimulus, 'images') and stimulus.images:
        image_count = len(stimulus.images)
        message += f"\n\n[Looking at {image_count} photos of the property...]"
    
    # Add authenticity trigger
    message += "\n\nJust give me your honest take - no need to be polite or professional."
    
    return message

def _convert_to_conversational(self, formal_content: str) -> str:
    """Convert formal property listing to conversational presentation"""
    # Parse the formal structure and rebuild conversationally
    # Example: "8,500 sq ft" -> "It's about 8,500 square feet"
    # "$10,000,000" -> "They're asking 10 million"
    # This maintains information but changes tone
    pass
```

#### Update Frontend Stimulus Creation:
```javascript
const createAuthenticStimulus = (property, questions) => {
  // Opening - conversational, not formal
  let stimulus = `Hey, I wanted to get your take on something.

So there's this property${property.address ? ` at ${property.address}` : ''} - `;

  // Price - conversational framing
  if (property.price) {
    stimulus += `they want ${property.price} for it. `;
  }

  // Size and basics - natural language
  if (property.sqft || property.bedrooms) {
    stimulus += `It's ${property.sqft ? `about ${property.sqft} square feet` : ''}`;
    stimulus += property.bedrooms ? `, ${property.bedrooms} bedrooms` : '';
    stimulus += property.bathrooms ? `, ${property.bathrooms} baths` : '';
    stimulus += '. ';
  }

  // Description - personal framing
  if (property.description) {
    stimulus += `\n\nHere's the thing: ${property.description}\n`;
  }

  // Images reference
  if (property.images?.length) {
    stimulus += `\nCheck out these photos and tell me what you think.\n`;
  }

  // Questions - conversational, not numbered
  stimulus += `\n${questions[0]}`; // Start with just one question
  
  // Closing - activate authentic voice
  stimulus += `\n\nBe straight with me - what's your real opinion?`;

  return stimulus;
};
```

## Testing the Enhanced Prompts

### A/B Test Scenarios:

#### Scenario A (Current - Formal):
"As high net worth individuals with experience in luxury real estate, please evaluate this property and provide recommendations."

#### Scenario B (Enhanced - Authentic):
"Hey, I'm looking at this place and could use your honest opinion. You've been through this before - what do you really think?"

### Expected Differences:

**Current Responses**: 
- "I believe the property has strong potential..."
- "The asking price appears to be slightly elevated..."
- "I would recommend considering upgrades to..."

**Enhanced Responses**:
- Tony: "You know, this reminds me of when I bought my first place in San Antonio, man..."
- Wayne: "Well, I think - Janet would kill me for saying this - but 10 million seems steep, eh?"
- Kenny: "Yeah, so Amy and I were just looking at something similar..."
- Brandon: "Honestly, the first thing I'm checking is the electrical panel..."

## Metrics for Success

1. **Vocabulary Diversity**: Count unique words per persona
2. **Personal Pronoun Usage**: I/me/my vs. generic statements
3. **Story/Anecdote Frequency**: Personal experiences mentioned
4. **Speech Pattern Consistency**: Verbal tics appearing naturally
5. **Opinion Variance**: Different perspectives on same property
6. **Emotional Expression**: Enthusiasm, skepticism, uncertainty
7. **Relationship Mentions**: References to family/colleagues

## Implementation Priority

1. **Quick Win**: Update frontend stimulus to conversational tone
2. **Medium Effort**: Add context priming in backend
3. **Full Implementation**: Complete prompt engineering system
4. **Advanced**: Multi-round conversation design with memory