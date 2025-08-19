"""
World and environment-related Pydantic models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .base import WorldType, RelationshipType


class EnvironmentTransition(BaseModel):
    from_environment: str
    to_environment: str
    trigger_condition: str = Field(..., description="Condition that triggers the transition")
    
class SocialRelationship(BaseModel):
    agent_1: str
    agent_2: str
    relationship_type: RelationshipType
    strength: float = Field(..., ge=0.0, le=1.0, description="Relationship strength from 0 to 1")
    description: Optional[str] = Field(None, description="Additional context about the relationship")
    
class TemporalSettings(BaseModel):
    start_time: str = Field(..., description="Simulation start time (ISO format)")
    time_scale: float = Field(1.0, gt=0, description="Time acceleration factor (1.0 = real time)")
    
class EnhancedWorldRequest(BaseModel):
    world_type: WorldType
    name: str = Field(..., description="Name of the world")
    description: str = Field(..., description="Description of the world environment")
    participants: List[str] = Field(..., description="List of agent names to include")
    
    social_relationships: Optional[List[SocialRelationship]] = Field(None, description="Social network relationships")
    temporal_settings: Optional[TemporalSettings] = Field(None, description="Temporal world settings")
    environments: Optional[List[str]] = Field(None, description="List of environment names for multi-environment worlds")
    environment_transitions: Optional[List[EnvironmentTransition]] = Field(None, description="Environment transition rules")
    
    simulation_rounds: int = Field(default=5, ge=1, le=50, description="Number of simulation rounds")
    interaction_style: str = Field(default="natural", description="Style of agent interactions")
    
class EnhancedWorldResponse(BaseModel):
    world_id: str
    world_type: WorldType
    name: str
    participants: List[str]
    interactions: List[Dict[str, Any]]
    world_state: Dict[str, Any]
    
class InvestmentFirmRequest(BaseModel):
    company_name: str = Field(..., description="Name of the company to research")
    research_depth: str = Field("comprehensive", description="Depth of research analysis")
    focus_areas: List[str] = Field(default=["financials", "market_position", "growth_prospects"], description="Areas to focus research on")
    agents: List[str] = Field(default=["lisa", "oscar"], description="Agent names for the research team")
    
class MultiEnvironmentRequest(BaseModel):
    environments: List[Dict[str, Any]] = Field(..., description="List of environment configurations")
    agents: List[str] = Field(..., description="Agents participating in multi-environment simulation")
    transition_rules: List[EnvironmentTransition] = Field(..., description="Rules for moving between environments")
    simulation_duration: int = Field(default=10, ge=1, le=100, description="Number of simulation steps")