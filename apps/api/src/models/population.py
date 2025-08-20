"""
Population and demographic-based agent generation models
Based on TinyTroupe examples and TinyPersonFactory patterns
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class DemographicTemplate(str, Enum):
    """Available demographic templates"""
    USA = "usa_demographics"
    EU = "eu_demographics" 
    UK = "uk_demographics"
    CUSTOM = "custom"

class PersonalityFragment(str, Enum):
    """Available personality fragments from TinyTroupe"""
    HEALTH_CONSCIOUS = "health_conscious"
    PRICE_SENSITIVE = "price_sensitive"
    TECH_SAVVY = "tech_savvy"
    ENVIRONMENTALLY_AWARE = "environmentally_aware"
    BRAND_LOYAL = "brand_loyal"
    EARLY_ADOPTER = "early_adopter"
    SOCIAL_INFLUENCE = "social_influence"
    QUALITY_FOCUSED = "quality_focused"
    TIME_CONSTRAINED = "time_constrained"
    BUDGET_CONSCIOUS = "budget_conscious"
    LOVING_PARENT = "loving_parent"
    CAREER_FOCUSED = "career_focused"
    ADVENTUROUS = "adventurous"
    CONSERVATIVE = "conservative"
    CREATIVE = "creative"
    ANALYTICAL = "analytical"

class PopulationSegment(BaseModel):
    """Segment definition for population generation"""
    name: str
    size: int = Field(..., ge=1, description="Number of agents in this segment")
    age_range: str = Field(..., description="Age range (e.g., '25-35', '18-25')")
    income_level: str = Field(..., description="Income level (e.g., 'Low ($20-40k)', 'Middle ($40-80k)')")
    location: str = Field(..., description="Geographic location (e.g., 'Urban', 'Suburban', 'Rural')")
    particularities: Optional[str] = Field(None, description="Specific characteristics for this segment")
    fragments: List[PersonalityFragment] = Field(default=[], description="Personality fragments to apply")

class BulkGenerationRequest(BaseModel):
    """Request for bulk agent generation using TinyPersonFactory"""
    name: str = Field(..., description="Name for this population")
    demographic_template: DemographicTemplate = Field(DemographicTemplate.USA, description="Base demographic template")
    total_size: int = Field(..., ge=1, le=1000, description="Total number of agents to generate")
    segments: List[PopulationSegment] = Field(..., min_items=1, description="Population segments")
    context: Optional[str] = Field(None, description="Additional context for generation")
    cache_key: Optional[str] = Field(None, description="Cache key for reusability")

class DemographicSampleRequest(BaseModel):
    """Request for demographic-based agent sampling"""
    demographic_file: Optional[str] = Field(None, description="Path to demographic JSON file")
    demographic_template: DemographicTemplate = Field(DemographicTemplate.USA)
    sample_size: int = Field(..., ge=1, le=100, description="Number of agents to sample")
    context: Optional[str] = Field(None, description="Context for agent generation")
    min_age: Optional[int] = Field(18, ge=16, le=100)
    max_age: Optional[int] = Field(80, ge=18, le=100)
    nationality_filter: Optional[List[str]] = Field(None, description="Filter by nationality")

class FragmentApplicationRequest(BaseModel):
    """Request to apply personality fragments to agents"""
    agent_ids: List[str] = Field(..., description="List of agent IDs to modify")
    fragments: List[PersonalityFragment] = Field(..., min_items=1, description="Fragments to apply")
    mode: str = Field("append", description="How to apply fragments: 'append', 'replace', 'merge'")

class GeneratedAgent(BaseModel):
    """Response model for generated agents"""
    id: str
    name: str
    age: int
    nationality: str
    occupation: str
    income_level: str
    location: str
    personality_fragments: List[str] = Field(default=[])
    specification: Optional[Dict[str, Any]] = Field(None, description="Full agent specification")
    minibio: Optional[str] = Field(None, description="Agent mini-biography")

class PopulationResponse(BaseModel):
    """Response for population generation requests"""
    population_id: str
    name: str
    total_generated: int
    segments: List[Dict[str, Any]]
    agents: List[GeneratedAgent]
    cache_key: Optional[str] = None
    generation_metadata: Dict[str, Any] = Field(default={})

class AvailableFragmentsResponse(BaseModel):
    """Response for available personality fragments"""
    fragments: List[Dict[str, str]] = Field(..., description="Available fragments with descriptions")

class DemographicTemplatesResponse(BaseModel):
    """Response for available demographic templates"""
    templates: List[Dict[str, Any]] = Field(..., description="Available demographic templates")