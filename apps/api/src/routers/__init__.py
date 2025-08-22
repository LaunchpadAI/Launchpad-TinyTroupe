"""
API route handlers organized by domain
"""

from fastapi import APIRouter
from .personas import router as personas_router
from .simulations import router as simulations_router
from .worlds import router as worlds_router
from .content import router as content_router
from .documents import router as documents_router
from .research import router as research_router
from .agents import router as agents_router
from .health import router as health_router
from .populations import router as populations_router
from .simulation_control import router as simulation_control_router
from .intervention import router as intervention_router
from .image_upload import router as image_upload_router

def create_api_router() -> APIRouter:
    """Create main API router with all sub-routers"""
    api_router = APIRouter()
    
    # Add all routers
    api_router.include_router(personas_router)
    api_router.include_router(simulations_router)
    api_router.include_router(worlds_router)
    api_router.include_router(content_router)
    api_router.include_router(documents_router)
    api_router.include_router(research_router)
    api_router.include_router(agents_router)
    api_router.include_router(health_router)
    api_router.include_router(populations_router)
    api_router.include_router(simulation_control_router)
    api_router.include_router(intervention_router)
    api_router.include_router(image_upload_router)
    
    return api_router

__all__ = [
    "create_api_router",
    "personas_router",
    "simulations_router", 
    "worlds_router",
    "content_router",
    "documents_router",
    "research_router",
    "agents_router",
    "health_router",
    "populations_router",
    "simulation_control_router",
    "intervention_router",
    "image_upload_router",
]