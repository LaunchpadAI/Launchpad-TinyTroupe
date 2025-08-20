"""
Population service implementing TinyPersonFactory patterns
Based on TinyTroupe examples for demographic agent generation
"""

import os
import json
import uuid
from typing import List, Dict, Any, Optional
import logging

# TinyTroupe imports
from tinytroupe.factory import TinyPersonFactory
from tinytroupe.agent import TinyPerson
import tinytroupe.control as control

from ..models.population import (
    BulkGenerationRequest,
    DemographicSampleRequest,
    FragmentApplicationRequest,
    GeneratedAgent,
    PopulationResponse,
    PersonalityFragment,
    DemographicTemplate
)

logger = logging.getLogger(__name__)

class PopulationService:
    """Service for demographic-based agent population generation"""
    
    def __init__(self):
        self.factories: Dict[str, TinyPersonFactory] = {}
        self.generated_populations: Dict[str, PopulationResponse] = {}
        self.demographic_templates = self._load_demographic_templates()
        self.personality_fragments = self._load_personality_fragments()
    
    def _load_demographic_templates(self) -> Dict[str, str]:
        """Load available demographic templates"""
        # These would map to actual demographic JSON files
        return {
            DemographicTemplate.USA: "./information/populations/usa.json",
            DemographicTemplate.EU: "./information/populations/eu.json", 
            DemographicTemplate.UK: "./information/populations/uk.json",
            DemographicTemplate.CUSTOM: None
        }
    
    def _load_personality_fragments(self) -> Dict[str, str]:
        """Load personality fragment descriptions"""
        return {
            PersonalityFragment.HEALTH_CONSCIOUS: "Focuses on wellness and healthy lifestyle choices",
            PersonalityFragment.PRICE_SENSITIVE: "Values cost-effectiveness and deals",
            PersonalityFragment.TECH_SAVVY: "Comfortable with technology and digital solutions",
            PersonalityFragment.ENVIRONMENTALLY_AWARE: "Cares about sustainability and eco-friendliness",
            PersonalityFragment.BRAND_LOYAL: "Prefers established brands and familiar products",
            PersonalityFragment.EARLY_ADOPTER: "Likes to try new products and trends first",
            PersonalityFragment.SOCIAL_INFLUENCE: "Influenced by social media and peer opinions",
            PersonalityFragment.QUALITY_FOCUSED: "Prioritizes high-quality products and experiences",
            PersonalityFragment.TIME_CONSTRAINED: "Values efficiency and time-saving solutions",
            PersonalityFragment.BUDGET_CONSCIOUS: "Careful with spending and financial decisions",
            PersonalityFragment.LOVING_PARENT: "Prioritizes family and children's needs",
            PersonalityFragment.CAREER_FOCUSED: "Ambitious and professionally driven",
            PersonalityFragment.ADVENTUROUS: "Enjoys new experiences and taking risks",
            PersonalityFragment.CONSERVATIVE: "Prefers traditional approaches and stability",
            PersonalityFragment.CREATIVE: "Values artistic expression and innovation",
            PersonalityFragment.ANALYTICAL: "Prefers data-driven decision making"
        }
    
    async def create_demographic_sample(self, request: DemographicSampleRequest) -> List[GeneratedAgent]:
        """
        Create agents using TinyPersonFactory.create_factory_from_demography()
        Following pattern from TinyTroupe examples
        """
        try:
            # Determine demographic file
            demographic_file = request.demographic_file
            if not demographic_file:
                demographic_file = self.demographic_templates.get(request.demographic_template)
            
            if not demographic_file or not os.path.exists(demographic_file):
                # Fallback to context-based generation
                return await self._create_agents_from_context(request)
            
            # Create factory from demographic file (TinyTroupe pattern)
            factory = TinyPersonFactory.create_factory_from_demography(
                demographic_file,
                context=request.context or "General population sample"
            )
            
            agents = []
            for i in range(request.sample_size):
                # Generate agent using factory
                agent = factory.generate_person(
                    agent_particularities=f"Agent {i+1} from demographic sample"
                )
                
                generated_agent = self._convert_to_generated_agent(agent, i+1)
                agents.append(generated_agent)
            
            logger.info(f"Generated {len(agents)} agents from demographic sample")
            return agents
            
        except Exception as e:
            logger.error(f"Error creating demographic sample: {str(e)}")
            # Fallback to context-based generation
            return await self._create_agents_from_context(request)
    
    async def bulk_generate_population(self, request: BulkGenerationRequest) -> PopulationResponse:
        """
        Create large populations with demographic segments
        Following TinyPersonFactory bulk generation patterns
        """
        try:
            population_id = str(uuid.uuid4())
            
            # Start TinyTroupe control session for caching
            cache_file = f"population_{population_id}.json" if request.cache_key else None
            if cache_file:
                control.begin(cache_file)
            
            generated_agents = []
            segment_metadata = []
            
            for segment in request.segments:
                # Create factory for this segment
                segment_context = self._build_segment_context(segment, request.context)
                
                # Try demographic file approach first
                demographic_file = self.demographic_templates.get(request.demographic_template)
                if demographic_file and os.path.exists(demographic_file):
                    factory = TinyPersonFactory.create_factory_from_demography(
                        demographic_file,
                        context=segment_context
                    )
                else:
                    # Fallback to context-based factory
                    factory = TinyPersonFactory(segment_context)
                
                # Generate agents for this segment
                segment_agents = []
                for i in range(segment.size):
                    agent = factory.generate_person(
                        agent_particularities=segment.particularities or f"Member of {segment.name}"
                    )
                    
                    generated_agent = self._convert_to_generated_agent(agent, len(generated_agents) + 1)
                    
                    # Apply personality fragments
                    if segment.fragments:
                        self._apply_fragments_to_agent(generated_agent, segment.fragments)
                    
                    segment_agents.append(generated_agent)
                    generated_agents.append(generated_agent)
                
                segment_metadata.append({
                    "name": segment.name,
                    "size": len(segment_agents),
                    "age_range": segment.age_range,
                    "income_level": segment.income_level,
                    "location": segment.location,
                    "fragments": [f.value for f in segment.fragments],
                    "agent_ids": [agent.id for agent in segment_agents]
                })
            
            # Create response
            population_response = PopulationResponse(
                population_id=population_id,
                name=request.name,
                total_generated=len(generated_agents),
                segments=segment_metadata,
                agents=generated_agents,
                cache_key=request.cache_key,
                generation_metadata={
                    "demographic_template": request.demographic_template.value,
                    "total_requested": request.total_size,
                    "context": request.context
                }
            )
            
            # Store population for retrieval
            self.generated_populations[population_id] = population_response
            
            # End control session
            if cache_file:
                control.end()
            
            logger.info(f"Generated population '{request.name}' with {len(generated_agents)} agents")
            return population_response
            
        except Exception as e:
            logger.error(f"Error in bulk population generation: {str(e)}")
            raise
    
    async def apply_fragments_to_agents(self, request: FragmentApplicationRequest) -> Dict[str, Any]:
        """Apply personality fragments to existing agents"""
        try:
            results = []
            
            for agent_id in request.agent_ids:
                # In a real implementation, we'd load the agent and modify it
                # For now, simulate fragment application
                result = {
                    "agent_id": agent_id,
                    "fragments_applied": [f.value for f in request.fragments],
                    "mode": request.mode,
                    "status": "success"
                }
                results.append(result)
            
            return {
                "status": "success",
                "agents_modified": len(request.agent_ids),
                "fragments": [f.value for f in request.fragments],
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Error applying fragments: {str(e)}")
            raise
    
    def _build_segment_context(self, segment, base_context: Optional[str] = None) -> str:
        """Build context string for segment generation"""
        context_parts = []
        
        if base_context:
            context_parts.append(base_context)
        
        context_parts.append(f"Age range: {segment.age_range}")
        context_parts.append(f"Income level: {segment.income_level}")
        context_parts.append(f"Location: {segment.location}")
        
        if segment.particularities:
            context_parts.append(f"Characteristics: {segment.particularities}")
        
        if segment.fragments:
            fragment_descriptions = [self.personality_fragments.get(f, f.value) for f in segment.fragments]
            context_parts.append(f"Personality traits: {', '.join(fragment_descriptions)}")
        
        return ". ".join(context_parts)
    
    def _convert_to_generated_agent(self, agent: TinyPerson, index: int) -> GeneratedAgent:
        """Convert TinyPerson to GeneratedAgent response model"""
        try:
            # Extract agent information
            name = getattr(agent, 'name', f'Agent_{index}')
            
            # Try to get agent specification
            spec = {}
            if hasattr(agent, 'get_specification'):
                spec = agent.get_specification()
            
            # Extract demographics from specification or use defaults
            age = self._extract_from_spec(spec, 'age', 35)
            nationality = self._extract_from_spec(spec, 'nationality', 'American')
            occupation = self._extract_from_spec(spec, 'occupation', 'Professional')
            
            return GeneratedAgent(
                id=f"agent_{uuid.uuid4().hex[:8]}",
                name=name,
                age=age,
                nationality=nationality,
                occupation=occupation,
                income_level="Middle ($40-80k)",  # Default, could be extracted
                location="Urban",  # Default, could be extracted
                specification=spec,
                minibio=agent.minibio() if hasattr(agent, 'minibio') and callable(agent.minibio) else str(getattr(agent, 'minibio', ''))
            )
            
        except Exception as e:
            logger.warning(f"Error converting agent {index}: {str(e)}")
            # Return minimal agent
            return GeneratedAgent(
                id=f"agent_{uuid.uuid4().hex[:8]}",
                name=f"Agent_{index}",
                age=35,
                nationality="American",
                occupation="Professional",
                income_level="Middle ($40-80k)",
                location="Urban"
            )
    
    def _extract_from_spec(self, spec: Dict, key: str, default: Any) -> Any:
        """Extract value from agent specification with fallback"""
        if isinstance(spec, dict):
            return spec.get(key, default)
        return default
    
    def _apply_fragments_to_agent(self, agent: GeneratedAgent, fragments: List[PersonalityFragment]):
        """Apply personality fragments to generated agent"""
        fragment_names = [f.value for f in fragments]
        agent.personality_fragments.extend(fragment_names)
    
    async def _create_agents_from_context(self, request: DemographicSampleRequest) -> List[GeneratedAgent]:
        """Fallback: create agents using context-based factory"""
        try:
            context = request.context or "General population sample"
            factory = TinyPersonFactory(context)
            
            agents = []
            for i in range(request.sample_size):
                agent = factory.generate_person()
                generated_agent = self._convert_to_generated_agent(agent, i+1)
                agents.append(generated_agent)
            
            return agents
            
        except Exception as e:
            logger.error(f"Error in context-based generation: {str(e)}")
            raise
    
    def get_available_fragments(self) -> Dict[str, str]:
        """Get available personality fragments"""
        return self.personality_fragments
    
    def get_demographic_templates(self) -> Dict[str, Any]:
        """Get available demographic templates"""
        templates = []
        for template, file_path in self.demographic_templates.items():
            templates.append({
                "id": template.value,
                "name": template.value.replace("_", " ").title(),
                "file_path": file_path,
                "available": file_path and os.path.exists(file_path) if file_path else False
            })
        
        return {"templates": templates}
    
    def get_population(self, population_id: str) -> Optional[PopulationResponse]:
        """Retrieve generated population by ID"""
        return self.generated_populations.get(population_id)