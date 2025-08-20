"""
FastAPI dependency injection
"""

from functools import lru_cache
from ..services.agent_service import AgentService
from ..services.simulation_service import SimulationService  
from ..services.world_service import WorldService
from ..services.content_service import ContentService
from ..services.research_service import ResearchService
from ..services.population_service import PopulationService
from ..services.simulation_control_service import SimulationControlService
from .config import settings


@lru_cache()
def get_agent_service() -> AgentService:
    """Dependency injection for AgentService"""
    return AgentService(agent_specs_path=settings.AGENT_SPECS_PATH)

@lru_cache()
def get_simulation_service() -> SimulationService:
    """Dependency injection for SimulationService"""
    return SimulationService()

@lru_cache()
def get_world_service() -> WorldService:
    """Dependency injection for WorldService"""
    return WorldService()

@lru_cache()
def get_content_service() -> ContentService:
    """Dependency injection for ContentService"""
    return ContentService()

@lru_cache()
def get_research_service() -> ResearchService:
    """Dependency injection for ResearchService"""
    return ResearchService()

@lru_cache()
def get_population_service() -> PopulationService:
    """Dependency injection for PopulationService"""
    return PopulationService()

@lru_cache()
def get_simulation_control_service() -> SimulationControlService:
    """Dependency injection for SimulationControlService"""
    return SimulationControlService()