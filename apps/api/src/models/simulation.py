"""
Simulation-related Pydantic models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from .base import SimulationType, OutputFormat


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
    checkpoint_name: str
    interactions: List[Dict[str, Any]] = Field(default=[], description="Recorded interactions")
    extracted_results: Optional[Dict[str, Any]] = Field(None, description="Extracted insights and results")