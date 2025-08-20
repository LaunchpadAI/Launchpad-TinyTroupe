"""
Population management endpoints
Implementing TinyPersonFactory demographic-based agent generation
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from ..models.population import (
    BulkGenerationRequest,
    DemographicSampleRequest, 
    FragmentApplicationRequest,
    PopulationResponse,
    GeneratedAgent,
    AvailableFragmentsResponse,
    DemographicTemplatesResponse
)
from ..services.population_service import PopulationService
from ..core.dependencies import get_population_service

router = APIRouter(prefix="/api/v1/populations", tags=["populations"])

@router.post("/create-demographic-sample", response_model=List[GeneratedAgent])
async def create_demographic_sample(
    request: DemographicSampleRequest,
    population_service: PopulationService = Depends(get_population_service)
):
    """
    Create agents using TinyPersonFactory.create_factory_from_demography()
    Based on TinyTroupe demographic sampling patterns
    """
    try:
        agents = await population_service.create_demographic_sample(request)
        return agents
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create demographic sample: {str(e)}")

@router.post("/bulk-generate", response_model=PopulationResponse)
async def bulk_generate_population(
    request: BulkGenerationRequest,
    population_service: PopulationService = Depends(get_population_service)
):
    """
    Generate large populations with demographic segments
    Supports up to 1000 agents with fragment-based personality customization
    """
    try:
        population = await population_service.bulk_generate_population(request)
        return population
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate population: {str(e)}")

@router.get("/{population_id}", response_model=PopulationResponse)
async def get_population(
    population_id: str,
    population_service: PopulationService = Depends(get_population_service)
):
    """Retrieve a generated population by ID"""
    try:
        population = population_service.get_population(population_id)
        if not population:
            raise HTTPException(status_code=404, detail="Population not found")
        return population
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving population: {str(e)}")

@router.post("/apply-fragments")
async def apply_fragments_to_agents(
    request: FragmentApplicationRequest,
    population_service: PopulationService = Depends(get_population_service)
):
    """
    Apply personality fragments to existing agents
    Implements TinyTroupe fragment application patterns
    """
    try:
        result = await population_service.apply_fragments_to_agents(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to apply fragments: {str(e)}")

@router.get("/fragments/available", response_model=AvailableFragmentsResponse)
async def get_available_fragments(
    population_service: PopulationService = Depends(get_population_service)
):
    """Get all available personality fragments with descriptions"""
    try:
        fragments_dict = population_service.get_available_fragments()
        fragments_list = [
            {"id": frag_id, "name": frag_id.replace("_", " ").title(), "description": description}
            for frag_id, description in fragments_dict.items()
        ]
        return AvailableFragmentsResponse(fragments=fragments_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving fragments: {str(e)}")

@router.get("/demographics/templates", response_model=DemographicTemplatesResponse)
async def get_demographic_templates(
    population_service: PopulationService = Depends(get_population_service)
):
    """Get available demographic templates"""
    try:
        templates = population_service.get_demographic_templates()
        return DemographicTemplatesResponse(**templates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving templates: {str(e)}")

# Legacy endpoints for backward compatibility
@router.post("/create-from-demography", response_model=List[GeneratedAgent])
async def create_from_demography(
    request: DemographicSampleRequest,
    population_service: PopulationService = Depends(get_population_service)
):
    """
    Legacy endpoint: Create personas from demographic data
    Redirects to create_demographic_sample for consistency
    """
    return await create_demographic_sample(request, population_service)