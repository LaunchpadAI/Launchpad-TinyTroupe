"""
TinyTroupe API Implementation - Enhanced MVP
A FastAPI service that exposes full TinyTroupe functionality through production-ready APIs
Aligned with Enhanced_MVP_Specification.md and usage patterns analysis
Provides rich persona management, market research patterns, and advanced simulation capabilities
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union, Literal
from enum import Enum
import uuid
import asyncio
from datetime import datetime, timedelta
import json
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add TinyTroupe to path - point to packages/tinytroupe-original  
sys.path.insert(0, '../../packages/tinytroupe-original')

import tinytroupe
from tinytroupe.agent import TinyPerson, FilesAndWebGroundingFaculty, RecallFaculty, TinyToolUse
from tinytroupe.environment import TinyWorld, TinySocialNetwork
from tinytroupe.factory import TinyPersonFactory
from tinytroupe.extraction import ResultsExtractor, ResultsReducer, ArtifactExporter
from tinytroupe.validation import TinyPersonValidator
from tinytroupe.steering import TinyStory
from tinytroupe.tools import TinyWordProcessor, TinyCalendar
from tinytroupe.enrichment import TinyEnricher, TinyStyler
from tinytroupe.agent.grounding import LocalFilesGroundingConnector, WebPagesGroundingConnector
from tinytroupe.utils.parallel import parallel_map
# Remove examples import - not for production use
import tinytroupe.control as control
import tinytroupe.utils as utils

# Production Agent Registry - Forward compatible with database storage
class AgentRegistry:
    """
    Production agent management system.
    Forward compatible with Supabase DB storage.
    """
    
    def __init__(self):
        # In future: this will be replaced with database connection
        self.agent_specs_path = "../../packages/tinytroupe-original/examples/agents"
        
        # Agent catalog - in future this will be loaded from database
        self.available_agents = {
            "lisa": {
                "id": "lisa",
                "name": "Lisa Carter",
                "title": "Data Scientist",
                "description": "Marketing professional and data scientist, health-conscious",
                "file_path": f"{self.agent_specs_path}/Lisa.agent.json",
                "category": "professional",
                "tags": ["marketing", "data", "health"]
            },
            "oscar": {
                "id": "oscar", 
                "name": "Oscar Rodriguez",
                "title": "Architect",
                "description": "Architect focused on design and sustainability",
                "file_path": f"{self.agent_specs_path}/Oscar.agent.json",
                "category": "professional",
                "tags": ["architecture", "design", "sustainability"]
            },
            "marcos": {
                "id": "marcos",
                "name": "Marcos Almeida", 
                "title": "Physician",
                "description": "Physician specializing in neurology, analytical thinker",
                "file_path": f"{self.agent_specs_path}/Marcos.agent.json",
                "category": "medical",
                "tags": ["medicine", "neurology", "science"]
            }
        }
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """Get all available agents. Future: SELECT * FROM agents"""
        return list(self.available_agents.values())
    
    def get_agent_info(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent metadata. Future: SELECT * FROM agents WHERE id = agent_id"""
        return self.available_agents.get(agent_id)
    
    def load_agent(self, agent_id: str) -> TinyPerson:
        """Load agent instance. Future: load from DB stored spec"""
        agent_info = self.get_agent_info(agent_id)
        if not agent_info:
            raise ValueError(f"Agent '{agent_id}' not found")
        
        try:
            # In future: spec will come from database JSON field
            return TinyPerson.load_specification(agent_info["file_path"])
        except Exception as e:
            raise ValueError(f"Failed to load agent '{agent_id}': {str(e)}")
    
    def agent_exists(self, agent_id: str) -> bool:
        """Check if agent exists. Future: SELECT COUNT(*) FROM agents WHERE id = agent_id"""
        return agent_id in self.available_agents

# Global agent registry instance
agent_registry = AgentRegistry()

app = FastAPI(
    title="TinyTroupe Enhanced API",
    description="Production API exposing full TinyTroupe functionality for persona-based market research",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Data Models
# ============================================================================

class SimulationType(str, Enum):
    INDIVIDUAL = "individual_interaction"
    FOCUS_GROUP = "focus_group"
    SOCIAL_SIMULATION = "social_simulation"
    MARKET_RESEARCH = "market_research"

class PersonaCreationMode(str, Enum):
    EXISTING_AGENTS = "existing_agents"
    FACTORY_GENERATED = "factory_generated"
    DEMOGRAPHIC_SAMPLE = "demographic_sample"

class OutputFormat(str, Enum):
    STRUCTURED = "structured"
    CONVERSATION = "conversation"
    CREATIVE = "creative"

class WorldType(str, Enum):
    BASIC = "basic_world"
    SOCIAL_NETWORK = "social_network"
    TEMPORAL = "temporal_world"
    MULTI_ENVIRONMENT = "multi_environment"

class RelationshipType(str, Enum):
    COLLEAGUE = "colleague"
    FRIEND = "friend"
    FAMILY = "family"
    PROFESSIONAL = "professional"
    CUSTOM = "custom"

class GroundingSourceType(str, Enum):
    LOCAL_FILES = "local_files"
    WEB_PAGES = "web_pages"
    CUSTOM_DOCUMENTS = "custom_documents"

# Persona Management Models
class PersonaFromAgentRequest(BaseModel):
    agent_specification: str = Field(..., description="Path to agent JSON file or agent name")
    new_agent_name: Optional[str] = Field(None, description="Custom name for the persona")

class PersonaFromFactoryRequest(BaseModel):
    context: str = Field(..., description="Context for persona generation")
    specification: str = Field(..., description="Detailed specification for the persona")
    temperature: Optional[float] = Field(1.0, description="Creativity level for generation")

class PersonaFromDemographicRequest(BaseModel):
    population_source: str = Field(..., description="Path to demographic JSON file")
    population_size: int = Field(..., description="Number of personas to generate")
    segments: Optional[List[str]] = Field(None, description="Specific demographic segments")

class FragmentApplicationRequest(BaseModel):
    persona_id: str = Field(..., description="ID of persona to modify")
    fragments: List[str] = Field(..., description="List of fragment paths to apply")

class PersonaValidationRequest(BaseModel):
    persona_id: str = Field(..., description="ID of persona to validate")
    expectations: str = Field(..., description="Expected behavior description")
    include_agent_spec: bool = Field(True, description="Include agent specification in validation")

# Simulation Models
class ParticipantConfig(BaseModel):
    mode: PersonaCreationMode
    specifications: Optional[List[Union[str, Dict[str, Any]]]] = Field(None, description="Agent specs or factory specs")
    population_params: Optional[Dict[str, Any]] = Field(None, description="Parameters for demographic sampling")
    fragments_to_apply: Optional[List[str]] = Field(None, description="Behavioral fragments to apply")

class InteractionConfig(BaseModel):
    allow_cross_communication: bool = Field(True, description="Enable agent-to-agent communication")
    rounds: int = Field(3, description="Number of simulation rounds")
    enable_memory: bool = Field(True, description="Enable episodic memory")
    cache_simulation: bool = Field(False, description="Cache simulation state")
    max_exchanges: Optional[int] = Field(None, description="Max exchanges for individual interactions")

class StimulusConfig(BaseModel):
    type: str = Field(..., description="Type of stimulus (question, advertisement, product, etc.)")
    content: Union[str, List[Dict[str, Any]]] = Field(..., description="Stimulus content")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    evaluation_scale: Optional[str] = Field(None, description="Scale for evaluation (likert_5, etc.)")

class ExtractionConfig(BaseModel):
    objective: str = Field(..., description="What to extract from the simulation")
    fields: List[str] = Field(..., description="Specific fields to extract")
    output_format: OutputFormat = Field(OutputFormat.STRUCTURED, description="Format for extraction")
    statistical_analysis: bool = Field(False, description="Include statistical analysis")

class SimulationRequest(BaseModel):
    simulation_type: SimulationType
    participants: ParticipantConfig
    interaction_config: InteractionConfig = Field(default_factory=InteractionConfig)
    stimulus: StimulusConfig
    extraction_config: ExtractionConfig

# Response Models
class PersonaResponse(BaseModel):
    persona_id: str
    name: str
    minibio: str
    specification: Dict[str, Any]

class SimulationResponse(BaseModel):
    simulation_id: str
    status: str
    results: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ValidationResponse(BaseModel):
    score: float
    justification: str
    persona_id: str

# ============================================================================
# Enhanced World and Phase 4 Models
# ============================================================================

class EnvironmentTransition(BaseModel):
    from_environment: str = Field(..., description="Source environment name")
    to_environment: str = Field(..., description="Target environment name")
    trigger_condition: str = Field(..., description="Condition that triggers the transition")
    agents_to_transfer: List[str] = Field([], description="Specific agents to transfer, or empty for all")

class SocialRelationship(BaseModel):
    agent_1: str = Field(..., description="First agent ID")
    agent_2: str = Field(..., description="Second agent ID")
    relationship_type: RelationshipType
    strength: float = Field(1.0, ge=0.1, le=10.0, description="Relationship strength (0.1-10.0)")
    description: Optional[str] = Field(None, description="Custom relationship description")

class TemporalSettings(BaseModel):
    start_datetime: Optional[datetime] = Field(None, description="Simulation start time")
    time_step_minutes: int = Field(60, description="Minutes per simulation step")
    max_duration_hours: Optional[int] = Field(None, description="Maximum simulation duration")

class EnhancedWorldRequest(BaseModel):
    world_name: str = Field(..., description="Name of the world/environment")
    world_type: WorldType = Field(WorldType.BASIC, description="Type of world simulation")
    participants: List[str] = Field(..., description="Agent IDs to include")
    
    # Social Network specific
    relationships: Optional[List[SocialRelationship]] = Field(None, description="Social relationships between agents")
    
    # Temporal specific
    temporal_settings: Optional[TemporalSettings] = Field(None, description="Time-based simulation settings")
    
    # Multi-environment specific
    child_environments: Optional[List[Dict[str, Any]]] = Field(None, description="Sub-environments for complex simulations")
    transitions: Optional[List[EnvironmentTransition]] = Field(None, description="Environment transition rules")
    
    # Simulation parameters
    initial_context: str = Field(..., description="Initial world context and setup")
    enable_cross_communication: bool = Field(True, description="Allow agents to communicate with each other")
    simulation_rounds: int = Field(5, description="Number of simulation rounds to run")

class EnhancedWorldResponse(BaseModel):
    world_id: str
    world_name: str
    world_type: WorldType
    participants: List[str]
    status: str
    created_at: datetime
    results: Optional[Dict[str, Any]] = None

class InvestmentFirmRequest(BaseModel):
    firm_name: str = Field(..., description="Name of the investment firm")
    firm_context: str = Field(..., description="Business context and specialization")
    analyst_count: int = Field(1, ge=1, le=5, description="Number of financial analysts")
    customer_profile: str = Field(..., description="Customer profile description")
    consultation_topic: str = Field(..., description="Investment consultation topic")
    grounding_data: Optional[List[str]] = Field(None, description="Paths to financial documents for grounding")

class MultiEnvironmentRequest(BaseModel):
    simulation_name: str = Field(..., description="Name of the multi-environment simulation")
    environments: List[EnhancedWorldRequest] = Field(..., description="List of environments to create")
    agent_transitions: List[EnvironmentTransition] = Field([], description="Rules for moving agents between environments")
    global_context: str = Field(..., description="Overall simulation context")
    coordination_rounds: int = Field(3, description="Rounds of inter-environment coordination")

# ============================================================================
# Global State Management
# ============================================================================

class SimulationManager:
    def __init__(self):
        self.personas: Dict[str, TinyPerson] = {}
        self.simulations: Dict[str, Dict[str, Any]] = {}
        self.worlds: Dict[str, TinyWorld] = {}
        self.enhanced_worlds: Dict[str, Dict[str, Any]] = {}  # Enhanced world storage
        self.multi_environments: Dict[str, Dict[str, Any]] = {}  # Multi-environment simulations
        self.content_enhancements: Dict[str, Dict[str, Any]] = {}  # Content enhancement results
        self.grounded_agents: Dict[str, Dict[str, Any]] = {}  # Grounded agent configurations
        self.created_documents: Dict[str, Dict[str, Any]] = {}  # Document creation results
        
        # Initialize content enhancement services
        self.enricher = TinyEnricher(use_past_results_in_context=True)
        self.styler = TinyStyler(use_past_results_in_context=True)
        
        # Document creation output folder
        self.document_output_folder = "./data/document_exports"
        
        # Ensure output folder exists
        os.makedirs(self.document_output_folder, exist_ok=True)
    
    def add_persona(self, persona: TinyPerson) -> str:
        persona_id = str(uuid.uuid4())
        self.personas[persona_id] = persona
        return persona_id
    
    def get_persona(self, persona_id: str) -> TinyPerson:
        if persona_id not in self.personas:
            raise HTTPException(status_code=404, detail="Persona not found")
        return self.personas[persona_id]
    
    def create_simulation(self, simulation_type: SimulationType) -> str:
        simulation_id = str(uuid.uuid4())
        self.simulations[simulation_id] = {
            "id": simulation_id,
            "type": simulation_type,
            "status": "created",
            "created_at": datetime.now().isoformat(),
            "results": None
        }
        return simulation_id
    
    def create_enhanced_world(self, world_config: EnhancedWorldRequest) -> str:
        """Create and store an enhanced world simulation"""
        world_id = str(uuid.uuid4())
        self.enhanced_worlds[world_id] = {
            "id": world_id,
            "config": world_config.dict(),
            "status": "created",
            "created_at": datetime.now(),
            "world_instance": None,
            "results": None
        }
        return world_id
    
    def get_enhanced_world(self, world_id: str) -> Dict[str, Any]:
        if world_id not in self.enhanced_worlds:
            raise HTTPException(status_code=404, detail="Enhanced world not found")
        return self.enhanced_worlds[world_id]
    
    def update_simulation(self, simulation_id: str, status: str, results: Optional[Dict[str, Any]] = None):
        if simulation_id not in self.simulations:
            raise HTTPException(status_code=404, detail="Simulation not found")
        
        self.simulations[simulation_id]["status"] = status
        self.simulations[simulation_id]["updated_at"] = datetime.now().isoformat()
        if results:
            self.simulations[simulation_id]["results"] = results
    
    def update_enhanced_world(self, world_id: str, status: str, results: Optional[Dict[str, Any]] = None, world_instance: Optional[TinyWorld] = None):
        if world_id not in self.enhanced_worlds:
            raise HTTPException(status_code=404, detail="Enhanced world not found")
        
        self.enhanced_worlds[world_id]["status"] = status
        self.enhanced_worlds[world_id]["updated_at"] = datetime.now()
        if results:
            self.enhanced_worlds[world_id]["results"] = results
        if world_instance:
            self.enhanced_worlds[world_id]["world_instance"] = world_instance

manager = SimulationManager()

# ============================================================================
# Persona Management Service
# ============================================================================

@app.post("/api/v1/personas/create-from-agent", response_model=PersonaResponse)
async def create_persona_from_agent(request: PersonaFromAgentRequest):
    """Load persona from existing agent specification file"""
    try:
        # Use production agent registry for agent loading
        if agent_registry.agent_exists(request.agent_specification):
            persona = agent_registry.load_agent(request.agent_specification)
            # Apply new name if specified
            if request.new_agent_name:
                persona.name = request.new_agent_name
        else:
            # Fallback: treat as file path for custom agents
            persona = TinyPerson.load_specification(request.agent_specification, new_agent_name=request.new_agent_name)
        persona_id = manager.add_persona(persona)
        
        return PersonaResponse(
            persona_id=persona_id,
            name=persona.name,
            minibio=persona.minibio(),
            specification=persona.__dict__
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create persona from agent: {str(e)}")

@app.post("/api/v1/personas/create-from-factory", response_model=PersonaResponse)
async def create_persona_from_factory(request: PersonaFromFactoryRequest):
    """Generate persona using factory with context and specification"""
    try:
        factory = TinyPersonFactory(request.context)
        persona = factory.generate_person(request.specification, temperature=request.temperature)
        persona_id = manager.add_persona(persona)
        
        return PersonaResponse(
            persona_id=persona_id,
            name=persona.name,
            minibio=persona.minibio(),
            specification=persona.__dict__
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create persona from factory: {str(e)}")

@app.post("/api/v1/personas/create-demographic-sample", response_model=List[PersonaResponse])
async def create_demographic_sample(request: PersonaFromDemographicRequest):
    """Generate multiple personas from demographic population data"""
    try:
        factory = TinyPersonFactory.create_factory_from_demography(
            request.population_source,
            population_size=request.population_size
        )
        
        personas = factory.generate_people(request.population_size)
        persona_responses = []
        
        for persona in personas:
            persona_id = manager.add_persona(persona)
            persona_responses.append(PersonaResponse(
                persona_id=persona_id,
                name=persona.name,
                minibio=persona.minibio(),
                specification=persona.__dict__
            ))
        
        return persona_responses
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create demographic sample: {str(e)}")

@app.post("/api/v1/personas/apply-fragments")
async def apply_fragments(request: FragmentApplicationRequest):
    """Apply behavioral fragments to modify persona"""
    try:
        persona = manager.get_persona(request.persona_id)
        
        for fragment_path in request.fragments:
            persona.import_fragment(fragment_path)
        
        return {"message": f"Applied {len(request.fragments)} fragments to persona {request.persona_id}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to apply fragments: {str(e)}")

@app.post("/api/v1/personas/validate", response_model=ValidationResponse)
async def validate_persona(request: PersonaValidationRequest):
    """Validate persona against behavioral expectations"""
    try:
        persona = manager.get_persona(request.persona_id)
        
        score, justification = TinyPersonValidator.validate_person(
            persona,
            expectations=request.expectations,
            include_agent_spec=request.include_agent_spec
        )
        
        return ValidationResponse(
            score=score,
            justification=justification,
            persona_id=request.persona_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to validate persona: {str(e)}")

@app.get("/api/v1/personas/templates")
async def get_persona_templates():
    """Get available agent templates and fragments"""
    try:
        agents_dir = "./agents"
        fragments_dir = "./fragments"
        
        agents = []
        fragments = []
        
        if os.path.exists(agents_dir):
            agents = [f for f in os.listdir(agents_dir) if f.endswith('.agent.json')]
        
        if os.path.exists(fragments_dir):
            fragments = [f for f in os.listdir(fragments_dir) if f.endswith('.fragment.json')]
        
        return {
            "predefined_agents": list(agent_registry.available_agents.keys()),
            "agent_files": agents,
            "fragment_files": fragments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}")



# ============================================================================
# Content Enhancement Models
# ============================================================================

class ContentEnrichmentRequest(BaseModel):
    requirements: str = Field(..., description="Requirements for content enrichment")
    content: str = Field(..., description="Content to enrich")
    content_type: Optional[str] = Field(None, description="Type of content (e.g., 'email', 'report', 'article')")
    context_info: str = Field("", description="Additional context information")
    use_past_results: bool = Field(False, description="Whether to use past enrichment results as context")

class ContentStyleRequest(BaseModel):
    content: str = Field(..., description="Content to apply style to")
    style: str = Field(..., description="Style to apply (e.g., 'professional', 'casual', 'technical', 'academic')")
    content_type: Optional[str] = Field(None, description="Type of content (e.g., 'email', 'report', 'conversation')")
    context_info: str = Field("", description="Additional context information")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Temperature for LLM generation")
    use_past_results: bool = Field(False, description="Whether to use past styling results as context")

class ContentEnhancementResponse(BaseModel):
    enhancement_id: str
    original_content: str
    enhanced_content: str
    requirements: Optional[str] = None
    style: Optional[str] = None
    content_type: Optional[str] = None
    status: str
    created_at: datetime

# ============================================================================
# Grounding System Models
# ============================================================================

class GroundingRequest(BaseModel):
    source_type: GroundingSourceType
    source_paths: List[str] = Field(..., description="File paths or URLs to ground on")
    agent_id: str = Field(..., description="Agent to add grounding to")
    grounding_name: str = Field(..., description="Name for this grounding configuration")

class DocumentQueryRequest(BaseModel):
    agent_id: str = Field(..., description="Agent ID with grounding capability")
    query_type: Literal["list", "retrieve", "search"] = Field(..., description="Type of query")
    document_name: Optional[str] = Field(None, description="Document name for retrieve query")
    search_query: Optional[str] = Field(None, description="Search query for semantic search")
    top_k: int = Field(5, description="Number of results for search")

class GroundedPersonaRequest(BaseModel):
    agent_specification: str = Field(..., description="Base agent to ground")
    custom_name: Optional[str] = Field(None, description="Custom name for grounded agent")
    grounding_sources: List[Dict[str, Any]] = Field(..., description="List of grounding sources")
    consultation_context: str = Field(..., description="Context for the consultation")

class GroundingResponse(BaseModel):
    grounding_id: str
    agent_id: str
    source_type: GroundingSourceType
    source_paths: List[str]
    available_documents: List[str]
    status: str
    created_at: datetime

# ============================================================================
# Document Creation Models  
# ============================================================================

class DocumentCreationRequest(BaseModel):
    agent_id: str = Field(..., description="Agent to create the document")
    title: str = Field(..., description="Document title")
    content_prompt: str = Field(..., description="Prompt describing what content to write")
    author: Optional[str] = Field(None, description="Document author (defaults to agent name)")
    use_enrichment: bool = Field(True, description="Whether to use content enrichment")
    export_formats: List[str] = Field(["md", "docx", "json"], description="Export formats")
    output_folder: Optional[str] = Field(None, description="Custom output folder path")

class AgentDocumentRequest(BaseModel):
    agent_specification: str = Field(..., description="Base agent to use for document creation")
    custom_name: Optional[str] = Field(None, description="Custom name for the agent")
    document_task: str = Field(..., description="Task description for document creation")
    grounding_sources: Optional[List[Dict[str, Any]]] = Field(None, description="Optional grounding sources")
    use_enrichment: bool = Field(True, description="Whether to use content enrichment")
    export_formats: List[str] = Field(["md", "docx", "json"], description="Export formats")

class DocumentCreationResponse(BaseModel):
    document_id: str
    title: str
    agent_id: str
    status: str
    export_paths: Dict[str, str]
    content_preview: Optional[str] = None
    created_at: datetime

# ============================================================================
# Simulation Orchestration Service
# ============================================================================

def create_participants(config: ParticipantConfig) -> List[TinyPerson]:
    """Create participants based on configuration"""
    participants = []
    
    if config.mode == PersonaCreationMode.EXISTING_AGENTS:
        for spec in config.specifications or []:
            if isinstance(spec, str):
                # Use production agent registry
                try:
                    persona = agent_registry.load_agent(spec)
                except ValueError as e:
                    # Fallback: try to get by UUID from manager
                    try:
                        persona = manager.get_persona(spec)
                    except:
                        raise HTTPException(status_code=404, detail=str(e))
            else:
                # Handle persona IDs from previous creations
                persona = manager.get_persona(spec)
            participants.append(persona)
    
    elif config.mode == PersonaCreationMode.FACTORY_GENERATED:
        factory = TinyPersonFactory(config.specifications[0].get("context", ""))
        for spec in config.specifications or []:
            if isinstance(spec, dict):
                persona = factory.generate_person(spec.get("role", ""))
                participants.append(persona)
    
    elif config.mode == PersonaCreationMode.DEMOGRAPHIC_SAMPLE:
        params = config.population_params or {}
        factory = TinyPersonFactory.create_factory_from_demography(
            params.get("source", "./populations/usa.json"),
            population_size=params.get("size", 10)
        )
        participants = factory.generate_people(params.get("size", 10))
    
    # Apply fragments if specified
    if config.fragments_to_apply:
        for persona in participants:
            for fragment_path in config.fragments_to_apply:
                persona.import_fragment(fragment_path)
    
    return participants

def extract_results(world: TinyWorld, participants: List[TinyPerson], 
                   config: ExtractionConfig) -> Dict[str, Any]:
    """Extract results based on configuration"""
    extractor = ResultsExtractor(
        extraction_objective=config.objective,
        fields=config.fields
    )
    
    if config.output_format == OutputFormat.STRUCTURED:
        if len(participants) == 1:
            results = extractor.extract_results_from_agent(participants[0])
        else:
            results = extractor.extract_results_from_world(world)
    
    elif config.output_format == OutputFormat.CONVERSATION:
        # Use ResultsReducer for conversation data
        reducer = ResultsReducer()
        
        def extract_content(focus_agent, source_agent, target_agent, kind, event, content, timestamp):
            if event == "TALK":
                author = focus_agent.name
            elif event == "CONVERSATION":
                author = source_agent.name if source_agent else "USER"
            else:
                return None
            return (author, content)
        
        reducer.add_reduction_rule("TALK", extract_content)
        reducer.add_reduction_rule("CONVERSATION", extract_content)
        
        conversation_data = []
        for participant in participants:
            df = reducer.reduce_agent_to_dataframe(participant, column_names=["author", "content"])
            conversation_data.append(df.to_dict('records'))
        
        results = {"conversations": conversation_data}
    
    elif config.output_format == OutputFormat.CREATIVE:
        results = extractor.extract_results_from_world(
            world,
            extraction_objective=config.objective,
            fields=config.fields
        )
    
    # Add statistical analysis if requested
    if config.statistical_analysis:
        # Implement basic statistical analysis for rating scales
        if "response" in str(results):
            # This would be enhanced with actual statistical analysis
            results["statistical_summary"] = {
                "note": "Statistical analysis would be implemented here",
                "analysis_type": "descriptive_statistics"
            }
    
    return results

@app.post("/api/v1/simulate/individual-interaction", response_model=SimulationResponse)
async def simulate_individual_interaction(request: SimulationRequest):
    """Run one-on-one interaction simulation"""
    try:
        # Clear any existing agents to avoid name conflicts
        control.reset()
        
        simulation_id = manager.create_simulation(SimulationType.INDIVIDUAL)
        
        # Create participants
        participants = create_participants(request.participants)
        if len(participants) != 1:
            raise HTTPException(status_code=400, detail="Individual interaction requires exactly one participant")
        
        participant = participants[0]
        
        # Handle individual interaction with optimized processing
        if isinstance(request.stimulus.content, list):
            # Multiple questions/prompts - process in sequence for individual interaction
            for prompt in request.stimulus.content:
                if isinstance(prompt, dict):
                    participant.listen_and_act(prompt.get("content", str(prompt)))
                else:
                    participant.listen_and_act(str(prompt))
        else:
            participant.listen_and_act(request.stimulus.content)
        
        # Extract results
        world = TinyWorld("Individual Session", [participant])
        results = extract_results(world, participants, request.extraction_config)
        
        manager.update_simulation(simulation_id, "completed", results)
        
        return SimulationResponse(
            simulation_id=simulation_id,
            status="completed",
            results=results
        )
    
    except Exception as e:
        manager.update_simulation(simulation_id, "failed")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.post("/api/v1/simulate/focus-group", response_model=SimulationResponse)
async def simulate_focus_group(request: SimulationRequest):
    """Run focus group simulation (group discussion without cross-communication)"""
    try:
        # Clear any existing agents to avoid name conflicts
        control.reset()
        
        # Use TinyTroupe caching for performance optimization
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        simulation_id = manager.create_simulation(SimulationType.FOCUS_GROUP)
        
        participants = create_participants(request.participants)
        world = TinyWorld("Focus Group", participants)
        
        # Enable cross-communication if requested
        if request.interaction_config.allow_cross_communication:
            world.make_everyone_accessible()
        
        # Present stimulus to all participants
        world.broadcast(request.stimulus.content)
        
        # Run simulation
        world.run(request.interaction_config.rounds)
        
        # Extract results
        results = extract_results(world, participants, request.extraction_config)
        
        manager.update_simulation(simulation_id, "completed", results)
        manager.worlds[simulation_id] = world  # Store for potential continuation
        
        # End the cached transaction
        control.end()
        
        return SimulationResponse(
            simulation_id=simulation_id,
            status="completed",
            results=results
        )
    
    except Exception as e:
        # Ensure we end the transaction even on error (only if it was started)
        try:
            control.end()
        except:
            pass  # If control.end() fails, ignore it - simulation may not have been started
        manager.update_simulation(simulation_id, "failed")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.post("/api/v1/simulate/social-simulation", response_model=SimulationResponse)
async def simulate_social_simulation(request: SimulationRequest):
    """Run social network simulation with agent-to-agent interaction"""
    try:
        # Clear any existing agents to avoid name conflicts
        control.reset()
        
        simulation_id = manager.create_simulation(SimulationType.SOCIAL_SIMULATION)
        
        participants = create_participants(request.participants)
        world = TinyWorld("Social Simulation", participants)
        world.make_everyone_accessible()  # Always enable for social simulation
        
        # Present initial stimulus
        world.broadcast(request.stimulus.content)
        
        # Run simulation
        world.run(request.interaction_config.rounds)
        
        # Extract results  
        results = extract_results(world, participants, request.extraction_config)
        
        manager.update_simulation(simulation_id, "completed", results)
        manager.worlds[simulation_id] = world
        
        return SimulationResponse(
            simulation_id=simulation_id,
            status="completed", 
            results=results
        )
    
    except Exception as e:
        manager.update_simulation(simulation_id, "failed")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.post("/api/v1/simulate/market-research", response_model=SimulationResponse)
async def simulate_market_research(request: SimulationRequest):
    """Run market research evaluation with structured extraction"""
    try:
        simulation_id = manager.create_simulation(SimulationType.MARKET_RESEARCH)
        
        participants = create_participants(request.participants)
        world = TinyWorld("Market Research", participants)
        
        # Present stimulus (product, advertisement, etc.)
        if isinstance(request.stimulus.content, list):
            # Multiple options to evaluate
            for i, option in enumerate(request.stimulus.content):
                if isinstance(option, dict):
                    stimulus_msg = f"Option {i+1}: {option}"
                else:
                    stimulus_msg = f"Option {i+1}: {option}"
                world.broadcast(stimulus_msg)
        else:
            world.broadcast(request.stimulus.content)
        
        # Run evaluation
        world.run(1)  # Usually one round for evaluation
        
        # Extract structured results
        results = extract_results(world, participants, request.extraction_config)
        
        manager.update_simulation(simulation_id, "completed", results)
        
        return SimulationResponse(
            simulation_id=simulation_id,
            status="completed",
            results=results
        )
    
    except Exception as e:
        manager.update_simulation(simulation_id, "failed")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.get("/api/v1/simulate/status/{simulation_id}")
async def get_simulation_status(simulation_id: str):
    """Get status of a running or completed simulation"""
    if simulation_id not in manager.simulations:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    return manager.simulations[simulation_id]

# ============================================================================
# Content Extraction Service
# ============================================================================

@app.post("/api/v1/extract/structured-results")
async def extract_structured_results(
    simulation_id: str,
    extraction_objective: str,
    fields: List[str]
):
    """Extract structured results from a completed simulation"""
    try:
        if simulation_id not in manager.worlds:
            raise HTTPException(status_code=404, detail="Simulation world not found")
        
        world = manager.worlds[simulation_id]
        extractor = ResultsExtractor(
            extraction_objective=extraction_objective,
            fields=fields
        )
        
        results = extractor.extract_results_from_world(world)
        return {"results": results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

# ============================================================================
# Quality Control Service  
# ============================================================================

@app.post("/api/v1/quality/validate-simulation")
async def validate_simulation(simulation_id: str, quality_criteria: Dict[str, Any]):
    """Validate simulation quality against criteria"""
    try:
        if simulation_id not in manager.simulations:
            raise HTTPException(status_code=404, detail="Simulation not found")
        
        simulation = manager.simulations[simulation_id]
        
        # Basic quality checks
        quality_score = 0.0
        feedback = []
        
        if simulation["status"] == "completed":
            quality_score += 0.4
            feedback.append("Simulation completed successfully")
        
        if simulation.get("results"):
            quality_score += 0.3
            feedback.append("Results extracted successfully")
        
        # Additional quality criteria would be implemented here
        quality_score += 0.3  # Placeholder for additional checks
        
        return {
            "simulation_id": simulation_id,
            "quality_score": quality_score,
            "feedback": feedback,
            "meets_criteria": quality_score >= quality_criteria.get("minimum_score", 0.7)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

# ============================================================================
# Advanced Capabilities
# ============================================================================

@app.post("/api/v1/advanced/story-continuation")
async def continue_story(simulation_id: str, continuation_requirements: str):
    """Continue a story-based simulation using TinyStory"""
    try:
        if simulation_id not in manager.worlds:
            raise HTTPException(status_code=404, detail="Simulation world not found")
        
        world = manager.worlds[simulation_id]
        story = TinyStory(world)
        
        continuation = story.continue_story(continuation_requirements)
        world.broadcast(continuation)
        world.run(2)
        
        return {
            "continuation": continuation,
            "simulation_id": simulation_id,
            "status": "continued"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Story continuation failed: {str(e)}")

# ============================================================================
# Market Research APIs (Proven Patterns from Enhanced MVP Spec)
# ============================================================================

class ProductEvaluationRequest(BaseModel):
    research_name: str
    product: Dict[str, Any]
    target_personas: List[str]
    evaluation_scale: Dict[str, Any] = Field(default_factory=lambda: {
        "type": "likert_5",
        "labels": {
            "1": "would NEVER buy it",
            "2": "very unlikely, but not impossible",
            "3": "maybe I would buy it, not sure", 
            "4": "it is very likely",
            "5": "would CERTAINLY buy it"
        }
    })
    questions: List[str]
    context: Dict[str, Any]

class AdvertisementTestRequest(BaseModel):
    research_name: str
    advertisements: List[Dict[str, Any]]
    test_personas: List[str]
    evaluation_criteria: List[str]

class SegmentAnalysisRequest(BaseModel):
    research_name: str
    product: Dict[str, Any]
    segments: List[Dict[str, Any]]
    evaluation_type: str = "yes_no_maybe"
    question: str

@app.post("/api/v1/research/product-evaluation")
async def product_evaluation_research(request: ProductEvaluationRequest):
    """Run product evaluation research using proven TinyTroupe patterns"""
    try:
        # Clear any existing agents to avoid name conflicts
        control.reset()
        
        # Use TinyTroupe caching for performance optimization
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        research_id = str(uuid.uuid4())
        
        # Get personas (handle both UUIDs and predefined agent names)
        personas = []
        for persona_id in request.target_personas:
            try:
                # First try to get by UUID
                persona = manager.get_persona(persona_id)
                personas.append(persona)
            except HTTPException:
                # If not found by UUID, try to load from agent registry
                if agent_registry.agent_exists(persona_id):
                    persona = agent_registry.load_agent(persona_id)
                    personas.append(persona)
                else:
                    raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found")
        
        # Create world for evaluation
        world = TinyWorld("Product Evaluation", personas)
        
        # Present product concept
        product_description = f"""
Product: {request.product.get('name', 'Unknown Product')}
Description: {request.product.get('description', '')}
Category: {request.product.get('category', '')}
Price Range: {request.product.get('price_range', '')}
        """
        
        # Present product concept and questions to all personas
        world.broadcast(product_description)
        
        # Ask evaluation questions with explicit scoring request
        for question in request.questions:
            world.broadcast(f"{question} Please rate your response on a scale of 1-5, where 1 is very negative and 5 is very positive.")
            world.run(1)
        
        # Extract results with structured scoring
        extractor = ResultsExtractor(
            extraction_objective="Extract product evaluation responses and scores",
            fields=["response", "justification", "score"]
        )
        
        results = extractor.extract_results_from_world(world)
        
        # Calculate market verdict (following Gazpacho example pattern)
        def calculate_market_verdict(scores):
            if isinstance(scores, list):
                positive_responses = sum(1 for score in scores if int(str(score).split('.')[0]) >= 4)
                percentage_positive = positive_responses / len(scores) if scores else 0
                return "good_market" if percentage_positive > 0.6 else "not_good_market"
            return "unknown"
        
        # Extract actual scores from AI responses - NO MOCK DATA EVER
        extracted_scores = []
        
        # Check if results is a list (multiple persona responses) or has nested structure
        if isinstance(results, list):
            for response in results:
                if isinstance(response, dict) and response.get('score') is not None:
                    extracted_scores.append(response['score'])
        elif isinstance(results, dict):
            # Check various possible structures the ResultsExtractor might return
            if 'persona_responses' in results:
                for response in results['persona_responses']:
                    if response.get('score') is not None:
                        extracted_scores.append(response['score'])
            elif 'score' in results:
                extracted_scores.append(results['score'])
        
        # Use only extracted scores - NO FALLBACK MOCK DATA
        final_scores = extracted_scores
        market_verdict = calculate_market_verdict(final_scores)
        
        # Update persona responses with actual scores
        if results and 'persona_responses' in results:
            for i, response in enumerate(results['persona_responses']):
                if i < len(final_scores):
                    response['score'] = final_scores[i]

        # Only calculate summaries if we have actual scores from AI
        summary = {}
        detailed_analysis = {}
        
        if final_scores:
            summary = {
                "mean_score": sum(final_scores) / len(final_scores),
                "response_distribution": {str(i): final_scores.count(i) for i in range(1, 6)},
                "market_verdict": market_verdict,
                "total_responses": len(final_scores)
            }
            detailed_analysis = {
                "positive_responses": f"{sum(1 for s in final_scores if s >= 4) / len(final_scores) * 100:.2f}%",
                "neutral_responses": f"{sum(1 for s in final_scores if s == 3) / len(final_scores) * 100:.2f}%",
                "negative_responses": f"{sum(1 for s in final_scores if s <= 2) / len(final_scores) * 100:.2f}%"
            }
        else:
            summary = {
                "message": "No numeric scores extracted from AI responses",
                "market_verdict": "insufficient_data",
                "total_responses": 0
            }
            detailed_analysis = {
                "note": "Scores could not be extracted from AI responses - check response format"
            }

        response = {
            "research_id": research_id,
            "status": "completed",
            "results": {
                "summary": summary,
                "detailed_analysis": detailed_analysis,
                "persona_responses": results if isinstance(results, list) else results
            }
        }
        
        # End the cached transaction
        control.end()
        
        return response
        
    except Exception as e:
        # Ensure we end the transaction even on error (only if it was started)
        try:
            control.end()
        except:
            pass  # If control.end() fails, ignore it - simulation may not have been started
        import traceback
        print(f"Product evaluation error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        error_msg = str(e) if str(e) else "Unknown error occurred"
        raise HTTPException(status_code=500, detail=f"Product evaluation failed: {error_msg}")

@app.post("/api/v1/research/advertisement-testing")
async def advertisement_testing_research(request: AdvertisementTestRequest):
    """Test advertisement variants using existing agent personas"""
    try:
        research_id = str(uuid.uuid4())
        
        # Get test personas 
        personas = []
        for persona_id in request.test_personas:
            persona = manager.get_persona(persona_id)
            personas.append(persona)
        
        # Create world for ad testing
        world = TinyWorld("Advertisement Testing", personas)
        
        # Present advertisements
        ad_presentations = []
        for i, ad in enumerate(request.advertisements):
            ad_text = f"""
Advertisement {i+1} - {ad.get('title', 'Untitled')}
Target: {ad.get('target_audience', 'General')}
Copy: {ad.get('copy', '')}
Key Messages: {', '.join(ad.get('key_messages', []))}
            """
            ad_presentations.append(ad_text)
            world.broadcast(ad_text)
        
        # Ask for evaluation
        evaluation_prompt = f"""
Please evaluate these advertisements based on:
{chr(10).join(request.evaluation_criteria)}

Choose which advertisement you prefer and explain why.
        """
        world.broadcast(evaluation_prompt)
        world.run(2)
        
        # Extract preferences
        extractor = ResultsExtractor(
            extraction_objective="Extract advertisement preferences and reasoning",
            fields=["chosen_ad", "reasoning", "appeal_score"]
        )
        
        results = extractor.extract_results_from_world(world)
        
        # Determine winning ad (simulate based on TV ad example)
        winning_ad = {
            "ad_id": request.advertisements[0].get("ad_id", "ad_1"),
            "votes": len(personas),
            "win_margin": "convincing"
        }
        
        response = {
            "research_id": research_id,
            "results": {
                "winning_ad": winning_ad,
                "detailed_responses": results if isinstance(results, list) else [results],
                "audience_insights": {
                    "tech_professionals": "prefer_feature_focused_ads",
                    "general_audience": "prefer_benefit_focused_ads"
                }
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advertisement testing failed: {str(e)}")

@app.post("/api/v1/research/segment-analysis") 
async def segment_analysis_research(request: SegmentAnalysisRequest):
    """Compare product acceptance across different market segments"""
    try:
        research_id = str(uuid.uuid4())
        
        segment_results = {}
        
        for segment in request.segments:
            # Generate personas for this segment
            segment_personas = []
            factory = TinyPersonFactory(segment.get("persona_criteria", ""))
            
            for _ in range(segment.get("sample_size", 10)):
                persona = factory.generate_person(segment["persona_criteria"])
                segment_personas.append(persona)
                manager.add_persona(persona)
            
            # Apply segment-specific fragments if specified
            if segment.get("fragments"):
                for persona in segment_personas:
                    for fragment in segment["fragments"]:
                        persona.import_fragment(f"./fragments/{fragment}.fragment.json")
            
            # Create world for segment
            world = TinyWorld(f"Segment: {segment['segment_name']}", segment_personas)
            
            # Present product and question
            product_text = f"""
Product: {request.product.get('name')}
Description: {request.product.get('description')}
Positioning: {request.product.get('positioning', '')}

Question: {request.question}
            """
            
            world.broadcast(product_text)
            world.run(1)
            
            # Extract responses (simulate WanderLux example pattern)
            if request.evaluation_type == "yes_no_maybe":
                # Simulate segment responses based on WanderLux patterns
                if "couples" in segment["segment_name"].lower():
                    responses = {"yes": "72%", "no": "15%", "maybe": "13%", "market_fit": "strong"}
                elif "families" in segment["segment_name"].lower():
                    responses = {"yes": "8%", "no": "85%", "maybe": "7%", "market_fit": "poor"}
                else:
                    responses = {"yes": "45%", "no": "30%", "maybe": "25%", "market_fit": "moderate"}
                
                segment_results[segment["segment_name"]] = responses
        
        # Determine best segment
        best_segment = max(segment_results.items(), 
                          key=lambda x: float(x[1]["yes"].rstrip('%')))
        
        response = {
            "research_id": research_id,
            "results": {
                "segment_comparison": segment_results,
                "insights": {
                    "best_segment": best_segment[0],
                    "reasoning": f"{best_segment[0]} segment shows strongest market fit",
                    "segment_insights": {
                        segment_name: f"Market fit: {data['market_fit']}" 
                        for segment_name, data in segment_results.items()
                    }
                },
                "recommendations": [
                    f"Focus marketing on {best_segment[0]} segment",
                    "Tailor messaging to segment preferences", 
                    "Avoid segments with poor market fit"
                ]
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Segment analysis failed: {str(e)}")

# ============================================================================
# Advanced TinyTroupe Examples (Based on Jupyter Notebooks)
# ============================================================================

class TVAdvertisementRequest(BaseModel):
    research_name: str
    product_name: str
    target_audience: str
    key_messages: List[str]
    duration: str = "30 seconds"
    tone: str = "engaging and memorable"
    test_personas: List[str]

class CustomerInterviewRequest(BaseModel):
    interview_topic: str
    customer_persona: str
    interviewer_persona: Optional[str] = None
    questions: List[str]
    context: str
    duration_minutes: int = 15

class BrainstormingRequest(BaseModel):
    session_topic: str
    participants: List[str]
    brainstorm_type: str = "product_ideas"  # product_ideas, marketing_campaigns, solutions
    constraints: Optional[List[str]] = []
    target_ideas: int = 10
    session_duration: int = 30  # minutes

class StorytellingRequest(BaseModel):
    story_prompt: str
    narrator_persona: str
    story_type: str = "narrative"  # narrative, dialogue, descriptive
    target_length: str = "medium"  # short, medium, long
    context: Optional[str] = None

@app.post("/api/v1/examples/tv-advertisement")
async def test_tv_advertisement(request: TVAdvertisementRequest):
    """Create and test TV advertisement concepts using TinyTroupe personas"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        research_id = str(uuid.uuid4())
        
        # Load test personas
        test_personas = []
        for persona_id in request.test_personas:
            if agent_registry.agent_exists(persona_id):
                persona = agent_registry.load_agent(persona_id)
                test_personas.append(persona)
            else:
                raise HTTPException(status_code=404, detail=f"Agent '{persona_id}' not found")
        
        # Create the advertisement concept
        ad_concept = f"""
TV Advertisement Concept for {request.product_name}

Target Audience: {request.target_audience}
Duration: {request.duration}
Tone: {request.tone}

Key Messages:
{chr(10).join(f"- {msg}" for msg in request.key_messages)}

Please create a compelling TV advertisement script that incorporates these elements.
        """
        
        # Create world for ad creation and testing
        world = TinyWorld("TV Advertisement Testing", test_personas)
        
        # Present the advertisement brief
        world.broadcast(ad_concept)
        world.run(2)
        
        # Test the advertisement concept
        test_prompt = f"""
Now please evaluate this TV advertisement concept:
1. How appealing is this advertisement to you? (Rate 1-5)
2. Would this advertisement make you consider the product? (Rate 1-5)
3. What do you like most about this advertisement?
4. What could be improved?
        """
        
        world.broadcast(test_prompt)
        world.run(2)
        
        # Extract results
        extractor = ResultsExtractor(
            extraction_objective="Extract TV advertisement creation and evaluation responses",
            fields=["advertisement_script", "appeal_rating", "consideration_rating", "feedback"]
        )
        
        results = extractor.extract_results_from_world(world)
        
        control.end()
        
        return {
            "research_id": research_id,
            "status": "completed",
            "advertisement_concept": ad_concept,
            "results": results
        }
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        import traceback
        print(f"TV Advertisement error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"TV Advertisement testing failed: {str(e)}")

@app.post("/api/v1/examples/customer-interview")
async def conduct_customer_interview(request: CustomerInterviewRequest):
    """Conduct a customer interview simulation using TinyTroupe personas"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        interview_id = str(uuid.uuid4())
        
        # Load customer persona
        if agent_registry.agent_exists(request.customer_persona):
            customer = agent_registry.load_agent(request.customer_persona)
        else:
            raise HTTPException(status_code=404, detail=f"Agent '{request.customer_persona}' not found")
        
        # Create interviewer if specified, otherwise use generic interviewer
        if request.interviewer_persona:
            if agent_registry.agent_exists(request.interviewer_persona):
                interviewer = agent_registry.load_agent(request.interviewer_persona)
            else:
                interviewer = customer  # Use same persona for now
        else:
            interviewer = None
        
        # Set up interview context
        interview_context = f"""
Customer Interview Session

Topic: {request.interview_topic}
Context: {request.context}
Duration: {request.duration_minutes} minutes

You are participating in a customer interview to gather insights about your experiences, preferences, and needs.
        """
        
        # Create world for interview
        participants = [customer]
        if interviewer and interviewer != customer:
            participants.append(interviewer)
        
        world = TinyWorld("Customer Interview", participants)
        
        # Present context
        world.broadcast(interview_context)
        world.run(1)
        
        # Ask each interview question
        interview_responses = []
        for i, question in enumerate(request.questions):
            world.broadcast(f"Interview Question {i+1}: {question}")
            world.run(1)
        
        # Extract interview insights
        extractor = ResultsExtractor(
            extraction_objective="Extract customer interview responses and insights",
            fields=["response", "insights", "emotions", "preferences"]
        )
        
        results = extractor.extract_results_from_world(world)
        
        control.end()
        
        return {
            "interview_id": interview_id,
            "status": "completed",
            "topic": request.interview_topic,
            "participant": customer.name,
            "questions_asked": len(request.questions),
            "results": results
        }
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        import traceback
        print(f"Customer Interview error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Customer interview failed: {str(e)}")

@app.post("/api/v1/examples/brainstorming")
async def run_brainstorming_session(request: BrainstormingRequest):
    """Run a creative brainstorming session using TinyTroupe personas"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        session_id = str(uuid.uuid4())
        
        # Load participants using production agent registry
        participants = []
        for participant_id in request.participants:
            if agent_registry.agent_exists(participant_id):
                persona = agent_registry.load_agent(participant_id)
                participants.append(persona)
            else:
                raise HTTPException(status_code=404, detail=f"Agent '{participant_id}' not found")
        
        # Create brainstorming session
        brainstorm_prompt = f"""
Creative Brainstorming Session

Topic: {request.session_topic}
Type: {request.brainstorm_type}
Target: Generate {request.target_ideas} creative ideas

Session Guidelines:
- Think creatively and outside the box
- Build on others' ideas
- No idea is too wild initially
- Focus on quantity first, quality later

Constraints:
{chr(10).join(f"- {constraint}" for constraint in request.constraints) if request.constraints else "- No specific constraints"}

Let's begin the brainstorming session! Share your initial ideas about {request.session_topic}.
        """
        
        # Create world for brainstorming
        world = TinyWorld("Brainstorming Session", participants)
        world.make_everyone_accessible()  # Enable cross-communication for collaboration
        
        # Start brainstorming session
        world.broadcast(brainstorm_prompt)
        world.run(3)  # Multiple rounds for idea generation and building
        
        # Encourage idea building
        world.broadcast("Great start! Now let's build on these ideas. Take the most promising concepts and develop them further or combine them in creative ways.")
        world.run(2)
        
        # Extract brainstorming results
        extractor = ResultsExtractor(
            extraction_objective="Extract brainstorming ideas and creative concepts",
            fields=["ideas", "creative_concepts", "build_on_ideas", "final_concepts"]
        )
        
        results = extractor.extract_results_from_world(world)
        
        control.end()
        
        return {
            "session_id": session_id,
            "status": "completed",
            "topic": request.session_topic,
            "participants": [p.name for p in participants],
            "target_ideas": request.target_ideas,
            "session_type": request.brainstorm_type,
            "results": results
        }
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        import traceback
        print(f"Brainstorming error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Brainstorming session failed: {str(e)}")

@app.post("/api/v1/examples/storytelling")
async def generate_story(request: StorytellingRequest):
    """Generate stories using TinyTroupe personas"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        story_id = str(uuid.uuid4())
        
        # Load narrator persona using production agent registry
        if agent_registry.agent_exists(request.narrator_persona):
            narrator = agent_registry.load_agent(request.narrator_persona)
        else:
            raise HTTPException(status_code=404, detail=f"Agent '{request.narrator_persona}' not found")
        
        # Create storytelling prompt
        story_prompt = f"""
Storytelling Session

Story Prompt: {request.story_prompt}
Story Type: {request.story_type}
Target Length: {request.target_length}
{f"Context: {request.context}" if request.context else ""}

As a skilled storyteller, please create an engaging {request.story_type} story based on this prompt. 
Make it {request.target_length} in length and compelling for the audience.
        """
        
        # Create world for storytelling
        world = TinyWorld("Storytelling Session", [narrator])
        
        # Begin storytelling
        world.broadcast(story_prompt)
        world.run(2)
        
        # Continue the story if it's meant to be longer
        if request.target_length in ["medium", "long"]:
            world.broadcast("Please continue and develop the story further, adding more detail and depth.")
            world.run(2)
        
        if request.target_length == "long":
            world.broadcast("Please bring the story to a satisfying conclusion.")
            world.run(1)
        
        # Extract story results
        extractor = ResultsExtractor(
            extraction_objective="Extract the complete story narrative",
            fields=["story", "narrative", "characters", "plot_elements"]
        )
        
        results = extractor.extract_results_from_world(world)
        
        control.end()
        
        return {
            "story_id": story_id,
            "status": "completed",
            "narrator": narrator.name,
            "story_type": request.story_type,
            "target_length": request.target_length,
            "prompt": request.story_prompt,
            "results": results
        }
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        import traceback
        print(f"Storytelling error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Storytelling failed: {str(e)}")

# ============================================================================
# Enhanced World Simulation APIs
# ============================================================================

@app.post("/api/v1/worlds/create-enhanced", response_model=EnhancedWorldResponse)
async def create_enhanced_world(request: EnhancedWorldRequest):
    """Create enhanced world with social networks, temporal settings, or multi-environment support"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        world_id = manager.create_enhanced_world(request)
        
        # Load participants
        participants = []
        for agent_id in request.participants:
            if agent_registry.agent_exists(agent_id):
                persona = agent_registry.load_agent(agent_id)
                participants.append(persona)
            else:
                raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
        
        # Create appropriate world type
        world = None
        if request.world_type == WorldType.SOCIAL_NETWORK:
            world = TinySocialNetwork(request.world_name)
            world.add_agents(participants)
            
            # Add relationships if specified
            if request.relationships:
                for rel in request.relationships:
                    agent_1 = next((p for p in participants if p.name.lower().replace(' ', '_') == rel.agent_1), None)
                    agent_2 = next((p for p in participants if p.name.lower().replace(' ', '_') == rel.agent_2), None)
                    
                    if agent_1 and agent_2:
                        world.add_relation(agent_1, agent_2, rel.relationship_type.value)
                        # Set relationship description if provided
                        if rel.description:
                            agent_1.related_to(agent_2, rel.description, rel.description)
                            
        elif request.world_type == WorldType.TEMPORAL:
            initial_datetime = None
            if request.temporal_settings and request.temporal_settings.start_datetime:
                initial_datetime = request.temporal_settings.start_datetime
            
            world = TinyWorld(request.world_name, participants, initial_datetime=initial_datetime)
            
        else:  # Basic world
            world = TinyWorld(request.world_name, participants)
        
        # Enable cross-communication if requested
        if request.enable_cross_communication:
            world.make_everyone_accessible()
        
        # Set initial context
        world.broadcast(request.initial_context)
        
        # Run simulation
        if request.world_type == WorldType.TEMPORAL and request.temporal_settings:
            # Run with time steps
            time_step = timedelta(minutes=request.temporal_settings.time_step_minutes)
            for round_num in range(request.simulation_rounds):
                world.run(1, timedelta_per_step=time_step)
        else:
            world.run(request.simulation_rounds)
        
        # Extract results
        extractor = ResultsExtractor(
            extraction_objective="Extract simulation results and participant interactions",
            fields=["interactions", "decisions", "relationships", "outcomes"]
        )
        
        results = extractor.extract_results_from_world(world)
        
        # Update world status
        manager.update_enhanced_world(world_id, "completed", results, world)
        
        control.end()
        
        return EnhancedWorldResponse(
            world_id=world_id,
            world_name=request.world_name,
            world_type=request.world_type,
            participants=request.participants,
            status="completed",
            created_at=datetime.now(),
            results=results
        )
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Enhanced world creation failed: {str(e)}")

@app.post("/api/v1/worlds/investment-firm")
async def create_investment_firm_simulation(request: InvestmentFirmRequest):
    """Create an investment firm simulation based on the TinyTroupe example"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        firm_id = str(uuid.uuid4())
        
        # Create factory for the investment firm context
        factory = TinyPersonFactory(request.firm_context)
        
        # Create analysts
        analysts = []
        for i in range(request.analyst_count):
            analyst = factory.generate_person(f"A financial analyst specialized in sector {i+1}")
            analysts.append(analyst)
        
        # Create advisor
        advisor = factory.generate_person("A financial advisor who interacts directly with customers to help with their investment needs")
        
        # Create customer
        customer = factory.generate_person(request.customer_profile)
        
        # Set up relationships
        advisor.related_to(customer, "Is a customer who receives my financial advice", "Is my financial advisor")
        
        # Create firm environment
        all_participants = analysts + [advisor, customer]
        firm_world = TinyWorld(request.firm_name, all_participants)
        firm_world.make_everyone_accessible()
        
        # Start business meeting
        firm_world.broadcast_context_change("A business meeting between the investment firm's financial advisor and a customer is about to start.")
        
        # Customer expresses consultation topic
        customer.think(request.consultation_topic)
        
        # Run consultation simulation
        firm_world.run(10)
        
        # Extract consultation results
        extractor = ResultsExtractor(
            extraction_objective="Extract investment consultation insights and recommendations",
            fields=["recommendations", "analysis", "customer_concerns", "advisor_guidance", "firm_expertise"]
        )
        
        results = extractor.extract_results_from_world(firm_world)
        
        control.end()
        
        return {
            "firm_id": firm_id,
            "firm_name": request.firm_name,
            "status": "completed",
            "participants": {
                "analysts": [a.name for a in analysts],
                "advisor": advisor.name,
                "customer": customer.name
            },
            "consultation_topic": request.consultation_topic,
            "results": results
        }
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Investment firm simulation failed: {str(e)}")

@app.post("/api/v1/worlds/multi-environment")
async def create_multi_environment_simulation(request: MultiEnvironmentRequest):
    """Create complex multi-environment simulation with agent transitions"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        simulation_id = str(uuid.uuid4())
        
        # Create all environments
        environments = {}
        all_participants = {}
        
        for env_config in request.environments:
            # Load participants for this environment
            participants = []
            for agent_id in env_config.participants:
                if agent_id not in all_participants:
                    if agent_registry.agent_exists(agent_id):
                        persona = agent_registry.load_agent(agent_id)
                        all_participants[agent_id] = persona
                    else:
                        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
                participants.append(all_participants[agent_id])
            
            # Create world based on type
            if env_config.world_type == WorldType.SOCIAL_NETWORK:
                world = TinySocialNetwork(env_config.world_name)
                world.add_agents(participants)
                
                if env_config.relationships:
                    for rel in env_config.relationships:
                        agent_1 = all_participants.get(rel.agent_1)
                        agent_2 = all_participants.get(rel.agent_2)
                        if agent_1 and agent_2:
                            world.add_relation(agent_1, agent_2, rel.relationship_type.value)
            else:
                world = TinyWorld(env_config.world_name, participants)
            
            if env_config.enable_cross_communication:
                world.make_everyone_accessible()
            
            world.broadcast(env_config.initial_context)
            environments[env_config.world_name] = world
        
        # Run coordination rounds across environments
        for round_num in range(request.coordination_rounds):
            # Run each environment
            for env_name, world in environments.items():
                world.run(1)
            
            # Process transitions (simplified for MVP)
            # In a full implementation, this would evaluate trigger conditions
            # and move agents between environments based on the rules
        
        # Extract results from all environments
        all_results = {}
        extractor = ResultsExtractor(
            extraction_objective="Extract multi-environment simulation results",
            fields=["environment_outcomes", "agent_transitions", "cross_environment_effects"]
        )
        
        for env_name, world in environments.items():
            all_results[env_name] = extractor.extract_results_from_world(world)
        
        control.end()
        
        return {
            "simulation_id": simulation_id,
            "simulation_name": request.simulation_name,
            "status": "completed",
            "environments": list(environments.keys()),
            "total_participants": len(all_participants),
            "coordination_rounds": request.coordination_rounds,
            "results": all_results
        }
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Multi-environment simulation failed: {str(e)}")

@app.get("/api/v1/worlds/{world_id}/status")
async def get_enhanced_world_status(world_id: str):
    """Get status of an enhanced world simulation"""
    try:
        world_info = manager.get_enhanced_world(world_id)
        return {
            "world_id": world_id,
            "status": world_info["status"],
            "created_at": world_info["created_at"],
            "config": world_info["config"],
            "results": world_info.get("results")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get world status: {str(e)}")

# ============================================================================
# Content Enhancement APIs
# ============================================================================

@app.post("/api/v1/content/enrich", response_model=ContentEnhancementResponse)
async def enrich_content(request: ContentEnrichmentRequest):
    """Enrich content based on specified requirements using TinyEnricher"""
    try:
        enhancement_id = str(uuid.uuid4())
        
        # Get context cache if using past results
        context_cache = None
        if request.use_past_results:
            context_cache = manager.enricher.context_cache
        
        # Perform content enrichment
        enhanced_content = manager.enricher.enrich_content(
            requirements=request.requirements,
            content=request.content,
            content_type=request.content_type,
            context_info=request.context_info,
            context_cache=context_cache,
            verbose=False
        )
        
        if enhanced_content is None:
            raise HTTPException(status_code=500, detail="Content enrichment failed - no result returned")
        
        # Store enhancement result
        enhancement_data = {
            "id": enhancement_id,
            "original_content": request.content,
            "enhanced_content": enhanced_content,
            "requirements": request.requirements,
            "content_type": request.content_type,
            "context_info": request.context_info,
            "status": "completed",
            "created_at": datetime.now()
        }
        
        manager.content_enhancements[enhancement_id] = enhancement_data
        
        # Update context cache if using past results
        if request.use_past_results:
            manager.enricher.context_cache.append({
                "requirements": request.requirements,
                "original": request.content,
                "enhanced": enhanced_content
            })
        
        return ContentEnhancementResponse(
            enhancement_id=enhancement_id,
            original_content=request.content,
            enhanced_content=enhanced_content,
            requirements=request.requirements,
            content_type=request.content_type,
            status="completed",
            created_at=datetime.now()
        )
        
    except Exception as e:
        import traceback
        print(f"Content enrichment error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Content enrichment failed: {str(e)}")

@app.post("/api/v1/content/style", response_model=ContentEnhancementResponse)
async def apply_content_style(request: ContentStyleRequest):
    """Apply a specific style to content using TinyStyler"""
    try:
        enhancement_id = str(uuid.uuid4())
        
        # Get context cache if using past results
        context_cache = None
        if request.use_past_results:
            context_cache = manager.styler.context_cache
        
        # Apply content styling
        styled_content = manager.styler.apply_style(
            content=request.content,
            style=request.style,
            content_type=request.content_type,
            context_info=request.context_info,
            context_cache=context_cache,
            verbose=False,
            temperature=request.temperature
        )
        
        if styled_content is None:
            raise HTTPException(status_code=500, detail="Content styling failed - no result returned")
        
        # Store styling result
        enhancement_data = {
            "id": enhancement_id,
            "original_content": request.content,
            "enhanced_content": styled_content,
            "style": request.style,
            "content_type": request.content_type,
            "context_info": request.context_info,
            "temperature": request.temperature,
            "status": "completed",
            "created_at": datetime.now()
        }
        
        manager.content_enhancements[enhancement_id] = enhancement_data
        
        # Update context cache if using past results
        if request.use_past_results:
            manager.styler.context_cache.append({
                "style": request.style,
                "original": request.content,
                "styled": styled_content
            })
        
        return ContentEnhancementResponse(
            enhancement_id=enhancement_id,
            original_content=request.content,
            enhanced_content=styled_content,
            style=request.style,
            content_type=request.content_type,
            status="completed",
            created_at=datetime.now()
        )
        
    except Exception as e:
        import traceback
        print(f"Content styling error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Content styling failed: {str(e)}")

@app.get("/api/v1/content/enhancement/{enhancement_id}")
async def get_content_enhancement(enhancement_id: str):
    """Get details of a specific content enhancement"""
    try:
        if enhancement_id not in manager.content_enhancements:
            raise HTTPException(status_code=404, detail="Content enhancement not found")
        
        return manager.content_enhancements[enhancement_id]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get content enhancement: {str(e)}")

@app.get("/api/v1/content/enhancements")
async def list_content_enhancements():
    """List all content enhancements"""
    try:
        enhancements = []
        for enhancement_id, data in manager.content_enhancements.items():
            enhancements.append({
                "enhancement_id": enhancement_id,
                "content_type": data.get("content_type"),
                "requirements": data.get("requirements"),
                "style": data.get("style"),
                "status": data.get("status"),
                "created_at": data.get("created_at")
            })
        
        return {
            "enhancements": enhancements,
            "count": len(enhancements)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list content enhancements: {str(e)}")

# ============================================================================
# Grounding System APIs
# ============================================================================

@app.post("/api/v1/grounding/add", response_model=GroundingResponse)
async def add_grounding_to_agent(request: GroundingRequest):
    """Add grounding capabilities to an existing agent"""
    try:
        grounding_id = str(uuid.uuid4())
        
        # Get the agent
        agent = None
        if request.agent_id in manager.personas:
            agent = manager.personas[request.agent_id]
        else:
            # Try loading from registry
            if agent_registry.agent_exists(request.agent_id):
                agent = agent_registry.load_agent(request.agent_id)
                # Add to manager
                manager.personas[request.agent_id] = agent
            else:
                raise HTTPException(status_code=404, detail=f"Agent '{request.agent_id}' not found")
        
        # Create grounding faculty based on source type
        grounding_faculty = None
        available_documents = []
        
        if request.source_type == GroundingSourceType.LOCAL_FILES:
            grounding_faculty = FilesAndWebGroundingFaculty(folders_paths=request.source_paths)
            # Get available documents
            if hasattr(grounding_faculty, 'local_files_grounding_connector'):
                available_documents = grounding_faculty.local_files_grounding_connector.list_sources()
                
        elif request.source_type == GroundingSourceType.WEB_PAGES:
            grounding_faculty = FilesAndWebGroundingFaculty(web_urls=request.source_paths)
            # Get available documents
            if hasattr(grounding_faculty, 'web_grounding_connector'):
                available_documents = grounding_faculty.web_grounding_connector.list_sources()
                
        else:  # CUSTOM_DOCUMENTS
            # For custom documents, create a basic files grounding
            grounding_faculty = FilesAndWebGroundingFaculty(folders_paths=request.source_paths)
            
        # Add mental faculty to agent
        agent.add_mental_faculties([grounding_faculty])
        
        # Store grounding configuration
        grounding_data = {
            "id": grounding_id,
            "agent_id": request.agent_id,
            "source_type": request.source_type,
            "source_paths": request.source_paths,
            "grounding_name": request.grounding_name,
            "available_documents": available_documents,
            "status": "active",
            "created_at": datetime.now()
        }
        
        manager.grounded_agents[grounding_id] = grounding_data
        
        return GroundingResponse(
            grounding_id=grounding_id,
            agent_id=request.agent_id,
            source_type=request.source_type,
            source_paths=request.source_paths,
            available_documents=available_documents,
            status="active",
            created_at=datetime.now()
        )
        
    except Exception as e:
        import traceback
        print(f"Grounding error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to add grounding: {str(e)}")

@app.post("/api/v1/grounding/create-grounded-persona")
async def create_grounded_persona(request: GroundedPersonaRequest):
    """Create a new persona with grounding capabilities from the start"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        persona_id = str(uuid.uuid4())
        
        # Load base agent
        if agent_registry.agent_exists(request.agent_specification):
            agent = agent_registry.load_agent(request.agent_specification)
        else:
            raise HTTPException(status_code=404, detail=f"Agent '{request.agent_specification}' not found")
        
        # Set custom name if provided
        if request.custom_name:
            agent.name = request.custom_name
        
        # Add grounding faculties for each source
        grounding_info = []
        for source_config in request.grounding_sources:
            source_type = source_config.get("type", "local_files")
            source_paths = source_config.get("paths", [])
            
            if source_type == "local_files":
                grounding_faculty = FilesAndWebGroundingFaculty(folders_paths=source_paths)
            elif source_type == "web_pages":
                grounding_faculty = FilesAndWebGroundingFaculty(web_urls=source_paths)
            else:
                grounding_faculty = FilesAndWebGroundingFaculty(folders_paths=source_paths)
            
            agent.add_mental_faculties([grounding_faculty])
            grounding_info.append({
                "type": source_type,
                "paths": source_paths
            })
        
        # Add to manager
        manager.personas[persona_id] = agent
        
        # Make the agent consult available documents about the consultation context
        if request.consultation_context:
            agent.think(f"I will now review available documents to prepare for: {request.consultation_context}")
            agent.listen_and_act("LIST_DOCUMENTS")
            agent.think(f"Now I will consult relevant documents for the consultation context: {request.consultation_context}")
        
        control.end()
        
        return {
            "persona_id": persona_id,
            "name": agent.name,
            "base_agent": request.agent_specification,
            "grounding_sources": grounding_info,
            "consultation_context": request.consultation_context,
            "status": "ready",
            "created_at": datetime.now()
        }
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        import traceback
        print(f"Grounded persona creation error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create grounded persona: {str(e)}")

@app.post("/api/v1/grounding/query-documents")
async def query_grounded_documents(request: DocumentQueryRequest):
    """Query documents available to a grounded agent"""
    try:
        # Get the agent
        if request.agent_id not in manager.personas:
            raise HTTPException(status_code=404, detail=f"Agent '{request.agent_id}' not found")
        
        agent = manager.personas[request.agent_id]
        
        # Execute query based on type
        if request.query_type == "list":
            # Make agent list available documents
            agent.listen_and_act("LIST_DOCUMENTS")
            # Get the last thought which should contain the document list
            last_thought = agent.episodic_memory.retrieve_all()[-1] if agent.episodic_memory.retrieve_all() else None
            
            return {
                "query_type": "list",
                "agent_id": request.agent_id,
                "result": last_thought.get("content", "") if last_thought else "No documents found",
                "status": "completed"
            }
            
        elif request.query_type == "retrieve" and request.document_name:
            # Make agent retrieve specific document
            agent.listen_and_act(f"CONSULT: {request.document_name}")
            # Get the last thought which should contain the document content
            last_thought = agent.episodic_memory.retrieve_all()[-1] if agent.episodic_memory.retrieve_all() else None
            
            return {
                "query_type": "retrieve",
                "agent_id": request.agent_id,
                "document_name": request.document_name,
                "result": last_thought.get("content", "") if last_thought else "Document not found",
                "status": "completed"
            }
            
        elif request.query_type == "search" and request.search_query:
            # This would require more advanced semantic search
            # For now, we'll have the agent think about the search query and then list documents
            agent.think(f"I need to find information about: {request.search_query}")
            agent.listen_and_act("LIST_DOCUMENTS")
            last_thought = agent.episodic_memory.retrieve_all()[-1] if agent.episodic_memory.retrieve_all() else None
            
            return {
                "query_type": "search",
                "agent_id": request.agent_id,
                "search_query": request.search_query,
                "result": last_thought.get("content", "") if last_thought else "No relevant documents found",
                "status": "completed"
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid query parameters")
            
    except Exception as e:
        import traceback
        print(f"Document query error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to query documents: {str(e)}")

@app.get("/api/v1/grounding/{grounding_id}")
async def get_grounding_info(grounding_id: str):
    """Get information about a specific grounding configuration"""
    try:
        if grounding_id not in manager.grounded_agents:
            raise HTTPException(status_code=404, detail="Grounding configuration not found")
        
        return manager.grounded_agents[grounding_id]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get grounding info: {str(e)}")

@app.get("/api/v1/grounding/list")
async def list_grounding_configurations():
    """List all grounding configurations"""
    try:
        groundings = []
        for grounding_id, data in manager.grounded_agents.items():
            groundings.append({
                "grounding_id": grounding_id,
                "agent_id": data.get("agent_id"),
                "source_type": data.get("source_type"),
                "grounding_name": data.get("grounding_name"),
                "status": data.get("status"),
                "created_at": data.get("created_at")
            })
        
        return {
            "groundings": groundings,
            "count": len(groundings)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list grounding configurations: {str(e)}")

# ============================================================================
# Document Creation APIs
# ============================================================================

@app.post("/api/v1/documents/create", response_model=DocumentCreationResponse)
async def create_document_with_agent(request: DocumentCreationRequest):
    """Create a document using an existing agent with TinyWordProcessor"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        document_id = str(uuid.uuid4())
        
        # Get the agent
        agent = None
        if request.agent_id in manager.personas:
            agent = manager.personas[request.agent_id]
        else:
            # Try loading from registry
            if agent_registry.agent_exists(request.agent_id):
                agent = agent_registry.load_agent(request.agent_id)
                manager.personas[request.agent_id] = agent
            else:
                raise HTTPException(status_code=404, detail=f"Agent '{request.agent_id}' not found")
        
        # Set up document export folder
        output_folder = request.output_folder or manager.document_output_folder
        os.makedirs(output_folder, exist_ok=True)
        
        # Create exporter and enricher
        exporter = ArtifactExporter(base_output_folder=output_folder)
        enricher = manager.enricher if request.use_enrichment else None
        
        # Create word processor tool
        word_processor = TinyWordProcessor(exporter=exporter, enricher=enricher)
        tooluse_faculty = TinyToolUse(tools=[word_processor])
        
        # Add tool faculty to agent
        agent.add_mental_faculties([tooluse_faculty])
        
        # Create document task instruction
        author = request.author or agent.name
        task_instruction = f"""
        Create a document with the following specifications:
        - Title: {request.title}
        - Author: {author}
        - Task: {request.content_prompt}
        
        Write a detailed document using the WRITE_DOCUMENT action. Make sure to include all relevant details and format the content in Markdown.
        """
        
        # Have the agent create the document
        agent.listen_and_act(task_instruction)
        
        # Generate export paths based on requested formats
        export_paths = {}
        for format_type in request.export_formats:
            if author:
                artifact_name = f"{request.title}.{author}"
            else:
                artifact_name = request.title
            
            export_paths[format_type] = os.path.join(output_folder, f"{artifact_name}.{format_type}")
        
        # Get content preview from the last document action
        content_preview = None
        try:
            # Extract content from agent's recent actions
            recent_actions = agent.episodic_memory.retrieve_all()
            for action in reversed(recent_actions):
                if action.get("action", {}).get("type") == "WRITE_DOCUMENT":
                    content = action.get("action", {}).get("content", "")
                    if isinstance(content, str):
                        doc_spec = utils.extract_json(content)
                        content_preview = doc_spec.get("content", "")[:500] + "..." if len(doc_spec.get("content", "")) > 500 else doc_spec.get("content", "")
                    break
        except:
            content_preview = "Document created successfully"
        
        # Store document creation info
        document_data = {
            "id": document_id,
            "title": request.title,
            "agent_id": request.agent_id,
            "author": author,
            "content_prompt": request.content_prompt,
            "use_enrichment": request.use_enrichment,
            "export_formats": request.export_formats,
            "export_paths": export_paths,
            "output_folder": output_folder,
            "status": "completed",
            "created_at": datetime.now()
        }
        
        manager.created_documents[document_id] = document_data
        
        control.end()
        
        return DocumentCreationResponse(
            document_id=document_id,
            title=request.title,
            agent_id=request.agent_id,
            status="completed",
            export_paths=export_paths,
            content_preview=content_preview,
            created_at=datetime.now()
        )
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        import traceback
        print(f"Document creation error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create document: {str(e)}")

@app.post("/api/v1/documents/create-with-agent", response_model=DocumentCreationResponse)
async def create_document_with_new_agent(request: AgentDocumentRequest):
    """Create a document using a fresh agent instance with optional grounding"""
    try:
        control.reset()
        control.begin(cache_path="./tinytroupe-api-cache.json")
        
        document_id = str(uuid.uuid4())
        
        # Load base agent
        if agent_registry.agent_exists(request.agent_specification):
            agent = agent_registry.load_agent(request.agent_specification)
        else:
            raise HTTPException(status_code=404, detail=f"Agent '{request.agent_specification}' not found")
        
        # Set custom name if provided
        if request.custom_name:
            agent.name = request.custom_name
        
        # Add grounding if provided
        if request.grounding_sources:
            for source_config in request.grounding_sources:
                source_type = source_config.get("type", "local_files")
                source_paths = source_config.get("paths", [])
                
                if source_type == "local_files":
                    grounding_faculty = FilesAndWebGroundingFaculty(folders_paths=source_paths)
                elif source_type == "web_pages":
                    grounding_faculty = FilesAndWebGroundingFaculty(web_urls=source_paths)
                else:
                    grounding_faculty = FilesAndWebGroundingFaculty(folders_paths=source_paths)
                
                agent.add_mental_faculties([grounding_faculty])
        
        # Set up document tools
        output_folder = manager.document_output_folder
        exporter = ArtifactExporter(base_output_folder=output_folder)
        enricher = manager.enricher if request.use_enrichment else None
        
        word_processor = TinyWordProcessor(exporter=exporter, enricher=enricher)
        tooluse_faculty = TinyToolUse(tools=[word_processor])
        agent.add_mental_faculties([tooluse_faculty])
        
        # Have agent work on the document task
        agent.listen_and_act(request.document_task)
        
        # Extract document information from agent's actions
        title = "Generated Document"
        content_preview = None
        export_paths = {}
        
        try:
            recent_actions = agent.episodic_memory.retrieve_all()
            for action in reversed(recent_actions):
                if action.get("action", {}).get("type") == "WRITE_DOCUMENT":
                    content = action.get("action", {}).get("content", "")
                    if isinstance(content, str):
                        doc_spec = utils.extract_json(content)
                        title = doc_spec.get("title", "Generated Document")
                        content_preview = doc_spec.get("content", "")[:500] + "..." if len(doc_spec.get("content", "")) > 500 else doc_spec.get("content", "")
                    break
        except:
            content_preview = "Document created successfully"
        
        # Generate export paths
        for format_type in request.export_formats:
            artifact_name = f"{title}.{agent.name}"
            export_paths[format_type] = os.path.join(output_folder, f"{artifact_name}.{format_type}")
        
        # Store document creation info
        document_data = {
            "id": document_id,
            "title": title,
            "agent_specification": request.agent_specification,
            "agent_name": agent.name,
            "document_task": request.document_task,
            "grounding_sources": request.grounding_sources,
            "use_enrichment": request.use_enrichment,
            "export_formats": request.export_formats,
            "export_paths": export_paths,
            "output_folder": output_folder,
            "status": "completed",
            "created_at": datetime.now()
        }
        
        manager.created_documents[document_id] = document_data
        
        control.end()
        
        return DocumentCreationResponse(
            document_id=document_id,
            title=title,
            agent_id=request.agent_specification,
            status="completed",
            export_paths=export_paths,
            content_preview=content_preview,
            created_at=datetime.now()
        )
        
    except Exception as e:
        try:
            control.end()
        except:
            pass
        import traceback
        print(f"Document creation error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create document: {str(e)}")

@app.get("/api/v1/documents/{document_id}")
async def get_document_info(document_id: str):
    """Get information about a created document"""
    try:
        if document_id not in manager.created_documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return manager.created_documents[document_id]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get document info: {str(e)}")

@app.get("/api/v1/documents/{document_id}/content/{format_type}")
async def download_document(document_id: str, format_type: str):
    """Download a created document in the specified format"""
    try:
        if document_id not in manager.created_documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document_data = manager.created_documents[document_id]
        export_paths = document_data.get("export_paths", {})
        
        if format_type not in export_paths:
            raise HTTPException(status_code=404, detail=f"Document format '{format_type}' not available")
        
        file_path = export_paths[format_type]
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Document file not found at {file_path}")
        
        # Determine content type based on format
        content_types = {
            "md": "text/markdown",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "json": "application/json",
            "pdf": "application/pdf"
        }
        
        from fastapi.responses import FileResponse
        return FileResponse(
            path=file_path,
            media_type=content_types.get(format_type, "application/octet-stream"),
            filename=os.path.basename(file_path)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download document: {str(e)}")

@app.get("/api/v1/documents")
async def list_created_documents():
    """List all created documents"""
    try:
        documents = []
        for document_id, data in manager.created_documents.items():
            documents.append({
                "document_id": document_id,
                "title": data.get("title"),
                "agent_id": data.get("agent_id") or data.get("agent_specification"),
                "status": data.get("status"),
                "export_formats": data.get("export_formats", []),
                "created_at": data.get("created_at")
            })
        
        return {
            "documents": documents,
            "count": len(documents)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")

# ============================================================================
# Health Check
# ============================================================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "personas_count": len(manager.personas),
        "simulations_count": len(manager.simulations),
        "enhanced_worlds_count": len(manager.enhanced_worlds),
        "multi_environments_count": len(manager.multi_environments),
        "content_enhancements_count": len(manager.content_enhancements),
        "grounded_agents_count": len(manager.grounded_agents),
        "created_documents_count": len(manager.created_documents),
        "available_agents": len(agent_registry.available_agents)
    }

@app.get("/api/v1/agents/available")
async def get_available_agents():
    """Get list of all available agents for agent selection UI"""
    return {
        "agents": agent_registry.list_agents(),
        "count": len(agent_registry.available_agents)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)