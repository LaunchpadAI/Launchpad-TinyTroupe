"""
Simulation-related Pydantic models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union, Literal
from datetime import datetime
from .base import SimulationType, OutputFormat, PersonaCreationMode


# Production simulation models
class ParticipantConfig(BaseModel):
    mode: PersonaCreationMode = Field(default=PersonaCreationMode.FROM_AGENT)
    specifications: Optional[List[Union[str, Dict[str, Any]]]] = Field(None, description="Agent specs or factory specs")
    population_params: Optional[Dict[str, Any]] = Field(None, description="Parameters for demographic sampling")
    fragments_to_apply: Optional[List[str]] = Field(None, description="Behavioral fragments to apply")

class InteractionConfig(BaseModel):
    allow_cross_communication: bool = Field(True, description="Enable agent-to-agent communication")
    rounds: int = Field(3, description="Number of simulation rounds")
    enable_memory: bool = Field(True, description="Enable episodic memory")
    enable_semantic_memory: Optional[bool] = Field(None, description="Enable semantic memory for document access. None=auto-detect based on simulation type")
    cache_simulation: bool = Field(False, description="Cache simulation state")

class StimulusConfig(BaseModel):
    type: str = Field(..., description="Type of stimulus (question, advertisement, product, etc.)")
    content: str = Field(..., description="Main stimulus content")
    images: Optional[List[str]] = Field(None, description="Base64 encoded images for vision analysis")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context information")

class ExtractionConfig(BaseModel):
    extract_results: bool = Field(True, description="Whether to extract structured results")
    extraction_objective: str = Field("Extract key insights and outcomes", description="What to extract")
    result_type: str = Field("json", description="Format for extraction results")

class SimulationRequest(BaseModel):
    simulation_type: SimulationType
    participants: ParticipantConfig
    interaction_config: InteractionConfig = Field(default_factory=InteractionConfig)
    stimulus: StimulusConfig
    extraction_config: ExtractionConfig = Field(default_factory=ExtractionConfig)

    
class SimulationResponse(BaseModel):
    simulation_id: str
    status: str = Field(..., description="Current simulation status")
    checkpoint_name: Optional[str] = None
    interactions: List[Dict[str, Any]] = Field(default=[], description="Recorded interactions")
    extracted_results: Optional[Dict[str, Any]] = Field(None, description="Extracted insights and results")
    participants: Optional[List[str]] = Field(None, description="List of participant names")
    results: Optional[Dict[str, Any]] = Field(None, description="Legacy results field")
    error: Optional[str] = Field(None, description="Error message if simulation failed")