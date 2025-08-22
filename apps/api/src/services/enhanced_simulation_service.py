"""
Enhanced simulation service with authentic persona activation
"""

from typing import Dict, Any, List, Optional
import re
from ..services.simulation_service import SimulationService


class EnhancedSimulationService(SimulationService):
    """Enhanced simulation service with authentic persona activation"""
    
    # Authentic context setters for each persona
    PERSONA_CONTEXTS = {
        "Tony Parker": """
        You're at a casual dinner with some friends who are asking about real estate.
        You've had a glass of wine, you're relaxed, and you're sharing honestly.
        This reminds you of properties you've seen in your career.
        Speak naturally - use 'you know', 'I mean', tell stories from your experience.
        Reference lessons from Pop, Tim Duncan, or your time with the Spurs if relevant.
        """,
        
        "Wayne Gretzky": """
        You're at the golf club with some buddies discussing properties.
        Janet's not here so you can speak a bit more freely about what you really think.
        This is like giving advice to a teammate - be honest but supportive.
        Use hockey analogies naturally if they help explain your point.
        Your Canadian humility should show - deflect praise, credit others.
        """,
        
        "Kenny Pickett": """
        You're talking with other young players about smart investments.
        Amy's asked you to look at properties together, so you're thinking practically.
        Be real about the challenges of buying property early in your career.
        This is off the record - no media present, just friends talking.
        Use your typical phrases - 'obviously', 'at the end of the day', 'for sure'.
        """,
        
        "Brandon McManus": """
        You're with someone who actually wants to hear about smart home tech details.
        They're not rolling their eyes when you talk automation specs.
        Share what you learned from your Colorado smart home experience.
        Get into the technical details you usually have to hold back.
        Break things down into systems - be precise and analytical.
        """
    }
    
    # Conversation starters that feel natural
    NATURAL_OPENINGS = [
        "So what's your honest first impression?",
        "Tell me what you really think - don't hold back.",
        "Does this remind you of anything from your own experience?",
        "What would {partner} say if you brought them to see this?",
        "Based on what you've learned the hard way, what jumps out?"
    ]
    
    def _prepare_stimulus_message(self, stimulus, agents: List[str] = None) -> str:
        """
        Enhanced stimulus preparation with authenticity activation.
        Converts formal property descriptions to conversational tone.
        """
        
        # Start with the base content
        base_message = stimulus.content
        
        # Convert formal property listing to conversational if it's property evaluation
        if hasattr(stimulus, 'type') and stimulus.type == "property_evaluation":
            base_message = self._make_conversational(base_message)
        
        # Add natural image reference if present
        if hasattr(stimulus, 'images') and stimulus.images:
            image_count = len(stimulus.images)
            if image_count == 1:
                base_message += "\n\n[Looking at the property photo...]"
            else:
                base_message += f"\n\n[Looking through {image_count} photos of the property...]"
            
            # Add natural reactions to images
            base_message += "\nTake a look at these images - what's your gut reaction?"
        
        # Add authenticity activation
        base_message += "\n\nJust be yourself here - I want your real opinion, not the polished version."
        
        # If we know the agents, add personal context
        if agents:
            contexts = []
            for agent in agents:
                # Extract base name without unique suffixes
                clean_name = re.sub(r'_[a-f0-9]{8}$', '', agent)
                if clean_name in self.PERSONA_CONTEXTS:
                    contexts.append(f"[Context for {clean_name}: {self.PERSONA_CONTEXTS[clean_name]}]")
            
            if contexts:
                base_message = "\n\n".join(contexts) + "\n\n" + base_message
        
        return base_message
    
    def _make_conversational(self, formal_content: str) -> str:
        """
        Convert formal property listing format to natural conversation.
        This maintains all information but changes the tone.
        """
        
        # If it's already conversational, return as-is
        if "Property Overview:" not in formal_content:
            return formal_content
        
        lines = formal_content.split('\n')
        conversational_parts = []
        
        # Track what we're processing
        address = None
        price = None
        size = None
        bedrooms = None
        bathrooms = None
        year = None
        style = None
        features = None
        neighborhood = None
        description = None
        questions = []
        
        # Parse the formal structure
        in_property_section = False
        in_description = False
        collecting_description = []
        
        for line in lines:
            line = line.strip()
            
            if "Property Overview:" in line:
                in_property_section = True
                continue
            
            if in_description:
                if line and not line.startswith('-') and not any(q in line for q in ['?', 'discuss:', 'recommendations']):
                    collecting_description.append(line)
                else:
                    description = ' '.join(collecting_description)
                    in_description = False
            
            if line.startswith('- Address:'):
                address = line.replace('- Address:', '').strip()
            elif line.startswith('- Asking Price:'):
                price = line.replace('- Asking Price:', '').strip()
            elif line.startswith('- Size:'):
                size = line.replace('- Size:', '').strip()
            elif line.startswith('- Bedrooms:'):
                beds_baths = line.replace('- Bedrooms:', '').strip()
                parts = beds_baths.split('|')
                if parts:
                    bedrooms = parts[0].strip()
                if len(parts) > 1:
                    bathrooms = parts[1].replace('Bathrooms:', '').strip()
            elif line.startswith('- Year Built:'):
                year = line.replace('- Year Built:', '').strip()
            elif line.startswith('- Style:'):
                style = line.replace('- Style:', '').strip()
            elif line.startswith('- Key Features:'):
                features = line.replace('- Key Features:', '').strip()
            elif line.startswith('- Neighborhood:'):
                neighborhood = line.replace('- Neighborhood:', '').strip()
            elif line.startswith('Description:'):
                in_description = True
            elif '?' in line and not in_description:
                questions.append(line.strip())
        
        # Build conversational version
        conv = "Alright, so here's the deal - "
        
        if address:
            conv += f"I'm looking at this property at {address}. "
        else:
            conv += "I'm looking at this property. "
        
        if price:
            # Make price conversational
            if '$' in price:
                conv += f"They're asking {price} for it"
                if 'million' in price.lower() or 'M' in price:
                    conv += " - yeah, that much"
                conv += ". "
        
        # Size and rooms
        if size or bedrooms:
            conv += "\n\nThe place is "
            if size:
                conv += f"{size}"
            if bedrooms:
                if size:
                    conv += f", with {bedrooms}"
                else:
                    conv += f"{bedrooms}"
            if bathrooms:
                conv += f" and {bathrooms}"
            conv += ". "
        
        # Style and year
        if style or year:
            if year and style:
                conv += f"It's a {style} place, built in {year}. "
            elif style:
                conv += f"It's {style} style. "
            elif year:
                conv += f"Built in {year}. "
        
        # Neighborhood
        if neighborhood:
            conv += f"Located in {neighborhood}. "
        
        # Features
        if features:
            conv += f"\n\nSome highlights: {features}. "
        
        # Description
        if description:
            conv += f"\n\nHere's the thing: {description}"
        
        # Questions - make them conversational
        if questions:
            conv += "\n\nSo here's what I'm wondering:\n"
            for q in questions[:3]:  # Limit to 3 main questions
                # Remove numbering and make conversational
                q_clean = re.sub(r'^\d+\.\s*', '', q)
                conv += f"- {q_clean}\n"
        
        return conv
    
    def _add_authentic_inner_thoughts(self, agents: List[Any]) -> None:
        """
        Add persona-specific inner thoughts that activate authentic voice.
        Override the generic "What should I do now?" pattern.
        """
        for agent in agents:
            agent_name = agent.name if hasattr(agent, 'name') else str(agent)
            clean_name = re.sub(r'_[a-f0-9]{8}$', '', agent_name)
            
            thoughts = {
                "Tony Parker": [
                    "This reminds me of something Pop once told me about patience in decisions...",
                    "I should think about this like I thought about my property in San Antonio...",
                    "What would Tim Duncan do in this situation? He always had good advice...",
                    "From my experience with properties in France and Texas..."
                ],
                "Wayne Gretzky": [
                    "This is like reading the ice - you have to see where the market's going...",
                    "Janet would have strong opinions about this place...",
                    "Reminds me of when we sold the Thousand Oaks estate...",
                    "My dad always said to look for what others miss..."
                ],
                "Kenny Pickett": [
                    "Amy and I need to think practically about this...",
                    "This is a big decision at this stage of my career...",
                    "I should approach this like film study - methodical and thorough...",
                    "Can't make the same mistakes other young players make..."
                ],
                "Brandon McManus": [
                    "Let me think about this from a systems perspective...",
                    "The automation potential here is interesting...",
                    "Based on my Colorado smart home experience...",
                    "I need to calculate the ROI on the tech investments..."
                ]
            }
            
            if clean_name in thoughts:
                import random
                thought = random.choice(thoughts[clean_name])
                agent.think(thought)
    
    def run_focus_group_simulation(self, request, agents, world) -> Dict[str, Any]:
        """
        Enhanced focus group simulation with authentic persona activation.
        """
        
        # Prepare enhanced stimulus with authenticity activation
        agent_names = [a.name if hasattr(a, 'name') else str(a) for a in agents]
        enhanced_stimulus = self._prepare_stimulus_message(request.stimulus, agent_names)
        
        # Broadcast the enhanced stimulus
        world.broadcast(enhanced_stimulus)
        
        # Add authentic inner thoughts instead of generic ones
        self._add_authentic_inner_thoughts(agents)
        
        # Continue with standard simulation flow
        return super().run_focus_group_simulation(request, agents, world)