"""
Simulation endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from ..models.simulation import SimulationRequest, SimulationResponse
from ..services.simulation_service import SimulationService
from ..services.agent_service import AgentService
from ..core.dependencies import get_simulation_service, get_agent_service

router = APIRouter(prefix="/api/v1/simulate", tags=["simulations"])


@router.post("/focus-group", response_model=SimulationResponse)
async def run_focus_group(
    request: SimulationRequest,
    simulation_service: SimulationService = Depends(get_simulation_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Run a focus group simulation"""
    try:
        # Load agents
        agents = []
        for participant in request.participants:
            agent = agent_service.load_agent(participant.agent_name)
            agents.append(agent)
        
        # Run simulation
        result = simulation_service.run_simulation(request, agents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/individual-interaction", response_model=SimulationResponse)
async def run_individual_interaction(
    request: SimulationRequest,
    simulation_service: SimulationService = Depends(get_simulation_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Run individual agent interaction simulation"""
    try:
        # Load single agent
        if len(request.participants) != 1:
            raise ValueError("Individual interaction requires exactly one participant")
        
        agent = agent_service.load_agent(request.participants[0].agent_name)
        result = simulation_service.run_simulation(request, [agent])
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/social-simulation", response_model=SimulationResponse)
async def run_social_simulation(
    request: SimulationRequest,
    simulation_service: SimulationService = Depends(get_simulation_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Run social interaction simulation"""
    try:
        # Load agents
        agents = []
        for participant in request.participants:
            agent = agent_service.load_agent(participant.agent_name)
            agents.append(agent)
        
        # Run simulation with social dynamics
        result = simulation_service.run_simulation(request, agents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/market-research", response_model=SimulationResponse)
async def run_market_research(
    request: SimulationRequest,
    simulation_service: SimulationService = Depends(get_simulation_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Run market research simulation"""
    try:
        # Load agents
        agents = []
        for participant in request.participants:
            agent = agent_service.load_agent(participant.agent_name)
            agents.append(agent)
        
        # Run market research simulation
        result = simulation_service.run_simulation(request, agents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status/{simulation_id}")
async def get_simulation_status(
    simulation_id: str,
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """Get status of a running simulation"""
    try:
        status = simulation_service.get_simulation_status(simulation_id)
        if not status:
            raise HTTPException(status_code=404, detail="Simulation not found")
        
        return status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop/{simulation_id}")
async def stop_simulation(
    simulation_id: str,
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """Stop a running simulation"""
    try:
        success = simulation_service.stop_simulation(simulation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Simulation not found")
        
        return {"status": "stopped", "simulation_id": simulation_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract/structured-results")
async def extract_structured_results(
    request: Dict[str, Any],
    simulation_service: SimulationService = Depends(get_simulation_service)
):
    """Extract structured results from a simulation checkpoint"""
    try:
        checkpoint_name = request.get("checkpoint_name")
        extraction_objective = request.get("extraction_objective", "Extract key insights")
        result_type = request.get("result_type", "json")
        
        if not checkpoint_name:
            raise ValueError("checkpoint_name is required")
        
        results = simulation_service._extract_results(
            checkpoint_name=checkpoint_name,
            objective=extraction_objective,
            result_type=result_type
        )
        
        return {
            "checkpoint_name": checkpoint_name,
            "extraction_objective": extraction_objective,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))