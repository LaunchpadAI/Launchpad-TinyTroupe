"""
Simulation-related Pydantic models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union, Literal
from datetime import datetime
from .base import SimulationType, OutputFormat, PersonaCreationMode


# Backward-compatible models to match frontend expectations
class ParticipantConfigLegacy(BaseModel):
    mode: PersonaCreationMode = Field(default=PersonaCreationMode.FROM_AGENT)
    specifications: Optional[List[Union[str, Dict[str, Any]]]] = Field(None, description="Agent specs or factory specs")
    population_params: Optional[Dict[str, Any]] = Field(None, description="Parameters for demographic sampling")
    fragments_to_apply: Optional[List[str]] = Field(None, description="Behavioral fragments to apply")

class InteractionConfigLegacy(BaseModel):
    allow_cross_communication: bool = Field(True, description="Enable agent-to-agent communication")
    rounds: int = Field(3, description="Number of simulation rounds")
    enable_memory: bool = Field(True, description="Enable episodic memory")
    cache_simulation: bool = Field(False, description="Cache simulation state")
    max_exchanges: Optional[int] = Field(None, description="Max exchanges for individual interactions")

class StimulusConfigLegacy(BaseModel):
    type: str = Field(..., description="Type of stimulus (question, advertisement, product, etc.)")
    content: str = Field(..., description="Main stimulus content")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context information")

class ExtractionConfigLegacy(BaseModel):
    extract_results: bool = Field(True, description="Whether to extract structured results")
    extraction_objective: str = Field("Extract key insights and outcomes", description="What to extract")
    result_type: str = Field("json", description="Format for extraction results")

class SimulationRequestLegacy(BaseModel):
    simulation_type: SimulationType
    participants: ParticipantConfigLegacy
    interaction_config: InteractionConfigLegacy = Field(default_factory=InteractionConfigLegacy)
    stimulus: StimulusConfigLegacy
    extraction_config: ExtractionConfigLegacy = Field(default_factory=ExtractionConfigLegacy)

# New models (for future use)
class ParticipantConfig(BaseModel):
    agent_name: str
    preparation_prompt: Optional[str] = Field(None, description="Optional preparation prompt for the agent")
    max_words_per_post: Optional[int] = Field(200, description="Maximum words per social media post")
    
class InteractionConfig(BaseModel):
    max_rounds: int = Field(default=5, ge=1, le=20, description="Number of interaction rounds")
    allow_questions_to_facilitator: bool = Field(default=True, description="Allow participants to ask questions")
    include_world_clock: bool = Field(default=False, description="Include simulated time progression")
    
class StimulusConfig(BaseModel):
    type: str = Field(..., description="Type of stimulus (e.g., 'advertisement', 'product_demo')")
    content: str = Field(..., description="The actual stimulus content")
    presentation_style: Optional[str] = Field("neutral", description="How to present the stimulus")
    
class ExtractionConfig(BaseModel):
    checkpoint_name: str = Field(..., description="Name of the simulation checkpoint to extract from")
    extraction_objective: str = Field(..., description="What specific insights to extract")
    result_type: OutputFormat = Field(default=OutputFormat.JSON, description="Format for extraction results")
    
class SimulationRequest(BaseModel):
    participants: List[ParticipantConfig]
    interaction: InteractionConfig
    stimulus: StimulusConfig
    extraction: ExtractionConfig
    
class SimulationResponse(BaseModel):
    simulation_id: str
    status: str = Field(..., description="Current simulation status")
    checkpoint_name: Optional[str] = None
    interactions: List[Dict[str, Any]] = Field(default=[], description="Recorded interactions")
    extracted_results: Optional[Dict[str, Any]] = Field(None, description="Extracted insights and results")
    participants: Optional[List[str]] = Field(None, description="List of participant names")
    results: Optional[Dict[str, Any]] = Field(None, description="Legacy results field")
    error: Optional[str] = Field(None, description="Error message if simulation failed")