"""
Persona-related Pydantic models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .base import PersonaCreationMode, GroundingSourceType


class PersonaFromAgentRequest(BaseModel):
    agent_name: str
    
class PersonaFromFactoryRequest(BaseModel):
    context_text: str = Field(..., description="Text describing the target persona characteristics")
    age: Optional[int] = Field(None, ge=18, le=100, description="Age of the persona")
    
class PersonaFromDemographicRequest(BaseModel):
    age: int = Field(..., ge=18, le=100)
    nationality: str
    
class FragmentApplicationRequest(BaseModel):
    persona_id: str
    fragment_text: str
    
class PersonaValidationRequest(BaseModel):
    persona_spec: Dict[str, Any]
    expectations: List[str] = Field(..., description="List of expectations to validate against")
    include_agent_spec: bool = Field(default=False, description="Include the agent specification in validation")
    
class PersonaResponse(BaseModel):
    id: str
    name: str
    description: str
    details: Dict[str, Any]
    
class ValidationResponse(BaseModel):
    persona_id: str
    is_valid: bool
    score: float = Field(..., ge=0.0, le=1.0, description="Validation score between 0 and 1")
    issues: List[str] = Field(default=[], description="List of validation issues found")
    recommendations: List[str] = Field(default=[], description="List of recommendations for improvement")
    
class GroundedPersonaRequest(BaseModel):
    base_persona_id: str
    source_type: GroundingSourceType
    source_path: str
    additional_context: Optional[str] = Field(None, description="Additional context for grounding")