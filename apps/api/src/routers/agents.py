"""
Agent management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from ..services.agent_service import AgentService
from ..core.dependencies import get_agent_service

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])


@router.get("/available")
async def get_available_agents(
    agent_service: AgentService = Depends(get_agent_service)
):
    """Get list of available agents"""
    try:
        agents = agent_service.list_available_agents()
        
        return {
            "agents": agents,
            "count": len(agents)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{agent_id}")
async def get_agent_info(
    agent_id: str,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Get information about a specific agent"""
    try:
        agent_info = agent_service.get_agent_info(agent_id)
        if not agent_info:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return agent_info
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{agent_id}/load")
async def load_agent(
    agent_id: str,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Load an agent instance"""
    try:
        agent = agent_service.load_agent(agent_id)
        
        return {
            "agent_id": agent_id,
            "name": agent.name,
            "status": "loaded",
            "specification": agent.get_specification() if hasattr(agent, 'get_specification') else {}
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))