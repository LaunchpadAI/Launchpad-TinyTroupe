"""
Pydantic models and schemas for the TinyTroupe API
"""

from .base import (
    SimulationType,
    PersonaCreationMode,
    OutputFormat,
    WorldType,
    RelationshipType,
    GroundingSourceType,
)

from .persona import (
    PersonaFromAgentRequest,
    PersonaFromFactoryRequest,
    PersonaFromDemographicRequest,
    FragmentApplicationRequest,
    PersonaValidationRequest,
    PersonaResponse,
    ValidationResponse,
    GroundedPersonaRequest,
)

from .simulation import (
    ParticipantConfig,
    InteractionConfig,
    StimulusConfig,
    ExtractionConfig,
    SimulationRequest,
    SimulationResponse,
)

from .world import (
    EnvironmentTransition,
    SocialRelationship,
    TemporalSettings,
    EnhancedWorldRequest,
    EnhancedWorldResponse,
    InvestmentFirmRequest,
    MultiEnvironmentRequest,
)

from .content import (
    ContentEnrichmentRequest,
    ContentStyleRequest,
    ContentEnhancementResponse,
    GroundingRequest,
    DocumentQueryRequest,
    GroundingResponse,
    DocumentCreationRequest,
    AgentDocumentRequest,
    DocumentCreationResponse,
)

from .research import (
    ProductEvaluationRequest,
    AdvertisementTestRequest,
    SegmentAnalysisRequest,
    TVAdvertisementRequest,
    CustomerInterviewRequest,
    BrainstormingRequest,
    StorytellingRequest,
)

__all__ = [
    # Base enums
    "SimulationType",
    "PersonaCreationMode", 
    "OutputFormat",
    "WorldType",
    "RelationshipType",
    "GroundingSourceType",
    
    # Persona models
    "PersonaFromAgentRequest",
    "PersonaFromFactoryRequest",
    "PersonaFromDemographicRequest",
    "FragmentApplicationRequest",
    "PersonaValidationRequest",
    "PersonaResponse",
    "ValidationResponse",
    "GroundedPersonaRequest",
    
    # Simulation models
    "ParticipantConfig",
    "InteractionConfig",
    "StimulusConfig",
    "ExtractionConfig",
    "SimulationRequest",
    "SimulationResponse",
    
    # World models
    "EnvironmentTransition",
    "SocialRelationship",
    "TemporalSettings",
    "EnhancedWorldRequest",
    "EnhancedWorldResponse",
    "InvestmentFirmRequest",
    "MultiEnvironmentRequest",
    
    # Content models
    "ContentEnrichmentRequest",
    "ContentStyleRequest",
    "ContentEnhancementResponse",
    "GroundingRequest",
    "DocumentQueryRequest",
    "GroundingResponse",
    "DocumentCreationRequest",
    "AgentDocumentRequest",
    "DocumentCreationResponse",
    
    # Research models
    "ProductEvaluationRequest",
    "AdvertisementTestRequest",
    "SegmentAnalysisRequest",
    "TVAdvertisementRequest",
    "CustomerInterviewRequest",
    "BrainstormingRequest",
    "StorytellingRequest",
]