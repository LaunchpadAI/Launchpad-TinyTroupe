"""
Intervention testing router for A/B testing and experiment management
Connects the InterventionTestingEngine to the v2 frontend
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import logging

from ..models.intervention import (
    CreateInterventionRequest,
    UpdateInterventionRequest,
    ExecuteInterventionRequest,
    InterventionResponse,
    InterventionResults,
    InterventionStatus,
    InterventionListResponse,
    CompareInterventionsRequest,
    InterventionComparisonResponse
)
from ..services.intervention_service import InterventionTestingEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interventions", tags=["interventions"])

# Dependency to get intervention service
def get_intervention_service() -> InterventionTestingEngine:
    return InterventionTestingEngine()

@router.post("/", response_model=InterventionResponse)
async def create_intervention(
    request: CreateInterventionRequest,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Create a new intervention experiment"""
    try:
        intervention = await service.create_intervention(request)
        logger.info(f"Created intervention: {intervention.intervention_id}")
        return intervention
    except Exception as e:
        logger.error(f"Error creating intervention: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=InterventionListResponse)
async def list_interventions(
    status: Optional[InterventionStatus] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """List interventions with optional filtering"""
    try:
        interventions = service.list_interventions(status=status)
        
        # Simple pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_interventions = interventions[start_idx:end_idx]
        
        return InterventionListResponse(
            interventions=paginated_interventions,
            total=len(interventions),
            page=page,
            per_page=per_page
        )
    except Exception as e:
        logger.error(f"Error listing interventions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{intervention_id}", response_model=InterventionResponse)
async def get_intervention(
    intervention_id: str,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Get intervention details"""
    try:
        intervention = service.get_intervention(intervention_id)
        if not intervention:
            raise HTTPException(status_code=404, detail="Intervention not found")
        return intervention
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting intervention {intervention_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{intervention_id}", response_model=InterventionResponse)
async def update_intervention(
    intervention_id: str,
    request: UpdateInterventionRequest,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Update an existing intervention"""
    try:
        intervention = await service.update_intervention(intervention_id, request)
        logger.info(f"Updated intervention: {intervention_id}")
        return intervention
    except Exception as e:
        logger.error(f"Error updating intervention {intervention_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{intervention_id}/execute")
async def execute_intervention(
    intervention_id: str,
    request: ExecuteInterventionRequest,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Execute an intervention experiment"""
    try:
        # Validate that intervention_id matches
        if request.intervention_id != intervention_id:
            raise ValueError("Intervention ID mismatch")
        
        result = await service.execute_intervention(request)
        logger.info(f"Executed intervention: {intervention_id}")
        return result
    except Exception as e:
        logger.error(f"Error executing intervention {intervention_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{intervention_id}/results", response_model=InterventionResults)
async def get_intervention_results(
    intervention_id: str,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Get comprehensive results for an intervention"""
    try:
        results = await service.get_intervention_results(intervention_id)
        return results
    except Exception as e:
        logger.error(f"Error getting results for intervention {intervention_id}: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/compare", response_model=InterventionComparisonResponse)
async def compare_interventions(
    request: CompareInterventionsRequest,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Compare multiple interventions"""
    try:
        comparison = await service.compare_interventions(request)
        logger.info(f"Compared {len(request.intervention_ids)} interventions")
        return comparison
    except Exception as e:
        logger.error(f"Error comparing interventions: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{intervention_id}")
async def delete_intervention(
    intervention_id: str,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Delete an intervention (soft delete to draft status)"""
    try:
        # Instead of actually deleting, we'll update status to failed/cancelled
        update_request = UpdateInterventionRequest(status=InterventionStatus.FAILED)
        intervention = await service.update_intervention(intervention_id, update_request)
        logger.info(f"Deleted (cancelled) intervention: {intervention_id}")
        return {"message": "Intervention cancelled successfully"}
    except Exception as e:
        logger.error(f"Error deleting intervention {intervention_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Additional endpoints for frontend integration

@router.get("/{intervention_id}/status")
async def get_intervention_status(
    intervention_id: str,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Get intervention execution status"""
    try:
        intervention = service.get_intervention(intervention_id)
        if not intervention:
            raise HTTPException(status_code=404, detail="Intervention not found")
        
        return {
            "intervention_id": intervention_id,
            "status": intervention.status,
            "progress": intervention.progress,
            "current_participants": intervention.current_participants,
            "total_participants": intervention.total_participants,
            "started_at": intervention.started_at,
            "updated_at": intervention.updated_at
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting status for intervention {intervention_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{intervention_id}/pause")
async def pause_intervention(
    intervention_id: str,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Pause a running intervention"""
    try:
        update_request = UpdateInterventionRequest(status=InterventionStatus.PAUSED)
        intervention = await service.update_intervention(intervention_id, update_request)
        return {"message": "Intervention paused successfully", "status": intervention.status}
    except Exception as e:
        logger.error(f"Error pausing intervention {intervention_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{intervention_id}/resume")
async def resume_intervention(
    intervention_id: str,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Resume a paused intervention"""
    try:
        update_request = UpdateInterventionRequest(status=InterventionStatus.RUNNING)
        intervention = await service.update_intervention(intervention_id, update_request)
        return {"message": "Intervention resumed successfully", "status": intervention.status}
    except Exception as e:
        logger.error(f"Error resuming intervention {intervention_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{intervention_id}/complete")
async def complete_intervention(
    intervention_id: str,
    service: InterventionTestingEngine = Depends(get_intervention_service)
):
    """Mark an intervention as completed"""
    try:
        update_request = UpdateInterventionRequest(status=InterventionStatus.COMPLETED)
        intervention = await service.update_intervention(intervention_id, update_request)
        return {"message": "Intervention completed successfully", "status": intervention.status}
    except Exception as e:
        logger.error(f"Error completing intervention {intervention_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for intervention service"""
    return {
        "status": "healthy",
        "service": "InterventionTestingEngine",
        "version": "1.0.0"
    }