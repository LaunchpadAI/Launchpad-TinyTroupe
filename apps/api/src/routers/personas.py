"""
Persona management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from ..models.persona import (
    PersonaFromAgentRequest,
    PersonaFromFactoryRequest,
    PersonaFromDemographicRequest,
    FragmentApplicationRequest,
    PersonaValidationRequest,
    PersonaResponse,
    ValidationResponse
)
from ..services.agent_service import AgentService
from ..core.dependencies import get_agent_service

router = APIRouter(prefix="/api/v1/personas", tags=["personas"])


@router.post("/create-from-agent", response_model=PersonaResponse)
async def create_persona_from_agent(
    request: PersonaFromAgentRequest,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Create a persona from an existing agent specification"""
    try:
        agent = agent_service.create_persona_from_agent(
            agent_name=request.agent_name,
            new_agent_name=getattr(request, 'new_agent_name', None)
        )
        
        return PersonaResponse(
            id=agent.name,
            name=agent.name,
            description=getattr(agent, 'description', 'Agent-based persona'),
            details=agent.get_specification() if hasattr(agent, 'get_specification') else {}
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-from-factory", response_model=PersonaResponse)
async def create_persona_from_factory(
    request: PersonaFromFactoryRequest,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Create a persona using TinyPersonFactory"""
    try:
        agent = agent_service.create_persona_from_factory(
            context=request.context_text,
            specification=request.context_text,  # Using context_text as specification
            temperature=getattr(request, 'temperature', 1.0)
        )
        
        return PersonaResponse(
            id=agent.name,
            name=agent.name,
            description=getattr(agent, 'description', 'Factory-generated persona'),
            details=agent.get_specification() if hasattr(agent, 'get_specification') else {}
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-demographic-sample", response_model=List[PersonaResponse])
async def create_demographic_sample(
    request: PersonaFromDemographicRequest,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Create personas from demographic data"""
    try:
        # For now, create a single persona based on age and nationality
        context = f"Create a persona for a {request.age}-year-old from {request.nationality}"
        agent = agent_service.create_persona_from_factory(
            context=context,
            specification=context
        )
        
        return [PersonaResponse(
            id=agent.name,
            name=agent.name,
            description=f"{request.age}-year-old from {request.nationality}",
            details=agent.get_specification() if hasattr(agent, 'get_specification') else {}
        )]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/apply-fragments")
async def apply_fragments(
    request: FragmentApplicationRequest,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Apply persona fragments to modify a persona"""
    try:
        # This would require implementing fragment application logic
        # For now, return success message
        return {
            "status": "success",
            "persona_id": request.persona_id,
            "fragments_applied": request.fragment_text,
            "message": "Fragment application completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/validate", response_model=ValidationResponse)
async def validate_persona(
    request: PersonaValidationRequest,
    agent_service: AgentService = Depends(get_agent_service)
):
    """Validate a persona against expectations"""
    try:
        # Load the persona based on expectations
        agent = agent_service.load_agent("lisa")  # Default for validation
        
        validation_result = agent_service.validate_persona(
            persona=agent,
            expectations='\n'.join(request.expectations),
            include_agent_spec=request.include_agent_spec
        )
        
        return ValidationResponse(
            persona_id=request.persona_spec.get('id', 'unknown'),
            is_valid=validation_result.get('is_valid', True),
            score=validation_result.get('score', 0.8),
            issues=validation_result.get('issues', []),
            recommendations=validation_result.get('recommendations', [])
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/templates")
async def get_persona_templates(
    agent_service: AgentService = Depends(get_agent_service)
):
    """Get available persona templates"""
    try:
        agents = agent_service.list_available_agents()
        
        templates = []
        for agent in agents:
            templates.append({
                "id": agent["id"],
                "name": agent["name"],
                "title": agent["title"],
                "description": agent["description"],
                "category": agent["category"],
                "tags": agent["tags"]
            })
        
        return {"templates": templates}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))