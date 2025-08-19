"""
World and environment endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from ..models.world import (
    EnhancedWorldRequest,
    EnhancedWorldResponse,
    InvestmentFirmRequest,
    MultiEnvironmentRequest
)
from ..services.world_service import WorldService
from ..services.agent_service import AgentService
from ..core.dependencies import get_world_service, get_agent_service

router = APIRouter(prefix="/api/v1/worlds", tags=["worlds"])


@router.post("/create-enhanced", response_model=EnhancedWorldResponse)
async def create_enhanced_world(
    request: EnhancedWorldRequest,
    world_service: WorldService = Depends(get_world_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Create an enhanced world with specified configuration"""
    try:
        # Load agents
        agents = []
        for agent_name in request.participants:
            agent = agent_service.load_agent(agent_name)
            agents.append(agent)
        
        # Create enhanced world
        result = world_service.create_enhanced_world(request, agents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/investment-firm")
async def run_investment_firm_simulation(
    request: InvestmentFirmRequest,
    world_service: WorldService = Depends(get_world_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Run investment firm research simulation"""
    try:
        # Load agents
        agents = []
        for agent_name in request.agents:
            agent = agent_service.load_agent(agent_name)
            agents.append(agent)
        
        # Create research world
        from ..models.world import EnhancedWorldRequest
        from ..models.base import WorldType
        
        enhanced_request = EnhancedWorldRequest(
            world_type=WorldType.BASIC,
            name=f"Investment Research: {request.company_name}",
            description=f"Research analysis for {request.company_name}",
            participants=request.agents,
            simulation_rounds=5,
            interaction_style="analytical"
        )
        
        result = world_service.create_enhanced_world(enhanced_request, agents)
        
        # Add investment-specific context
        research_context = f"""
        Company: {request.company_name}
        Research Depth: {request.research_depth}
        Focus Areas: {', '.join(request.focus_areas)}
        
        Please conduct comprehensive research and analysis.
        """
        
        return {
            "world_id": result.world_id,
            "company_name": request.company_name,
            "research_context": research_context,
            "interactions": result.interactions,
            "research_team": [agent.name for agent in agents]
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/multi-environment")
async def run_multi_environment_simulation(
    request: MultiEnvironmentRequest,
    world_service: WorldService = Depends(get_world_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Run multi-environment simulation"""
    try:
        # Load agents
        agents = []
        for agent_name in request.agents:
            agent = agent_service.load_agent(agent_name)
            agents.append(agent)
        
        # Run multi-environment simulation
        result = world_service.run_multi_environment_simulation(request, agents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{world_id}/status")
async def get_world_status(
    world_id: str,
    world_service: WorldService = Depends(get_world_service)
):
    """Get status of a world"""
    try:
        # Check if world exists in active worlds
        world = world_service.active_worlds.get(world_id)
        if not world:
            raise HTTPException(status_code=404, detail="World not found")
        
        return {
            "world_id": world_id,
            "status": "active",
            "agent_count": len(world.agents),
            "current_time": getattr(world, "current_time", None),
            "interaction_count": getattr(world, "interaction_count", 0)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))