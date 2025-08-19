"""
Content enhancement and processing endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from ..models.content import (
    ContentEnrichmentRequest,
    ContentStyleRequest,
    ContentEnhancementResponse,
    GroundingRequest,
    DocumentQueryRequest,
    GroundingResponse,
    DocumentCreationRequest,
    AgentDocumentRequest,
    DocumentCreationResponse
)
from ..services.content_service import ContentService
from ..services.agent_service import AgentService
from ..core.dependencies import get_content_service, get_agent_service

router = APIRouter(prefix="/api/v1/content", tags=["content"])


@router.post("/enrich", response_model=ContentEnhancementResponse)
async def enrich_content(
    request: ContentEnrichmentRequest,
    content_service: ContentService = Depends(get_content_service)
):
    """Enrich content using TinyEnricher"""
    try:
        result = content_service.enrich_content(request)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/style", response_model=ContentEnhancementResponse)
async def style_content(
    request: ContentStyleRequest,
    content_service: ContentService = Depends(get_content_service)
):
    """Apply styling to content using TinyStyler"""
    try:
        result = content_service.style_content(request)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/enhancement/{enhancement_id}")
async def get_enhancement(enhancement_id: str):
    """Get enhancement by ID"""
    # This would require implementing enhancement storage
    # For now, return placeholder response
    return {
        "enhancement_id": enhancement_id,
        "status": "completed",
        "message": "Enhancement retrieval not yet implemented"
    }


@router.get("/enhancements")
async def list_enhancements():
    """List all enhancements"""
    # This would require implementing enhancement storage
    # For now, return empty list
    return {"enhancements": []}


@router.post("/grounding/add", response_model=GroundingResponse)
async def add_grounding_source(
    request: GroundingRequest,
    content_service: ContentService = Depends(get_content_service)
):
    """Add a grounding source"""
    try:
        result = content_service.ground_content(request)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/grounding/create-grounded-persona")
async def create_grounded_persona(
    request: Dict[str, Any],
    content_service: ContentService = Depends(get_content_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Create a persona grounded to external sources"""
    try:
        base_persona_id = request.get("base_persona_id")
        source_type = request.get("source_type")
        source_path = request.get("source_path")
        additional_context = request.get("additional_context")
        
        if not all([base_persona_id, source_type, source_path]):
            raise ValueError("base_persona_id, source_type, and source_path are required")
        
        # Load base persona
        base_agent = agent_service.load_agent(base_persona_id)
        
        # Ground to source
        from ..models.content import GroundingRequest
        from ..models.base import GroundingSourceType
        
        grounding_request = GroundingRequest(
            source_type=GroundingSourceType(source_type),
            source_path=source_path,
            query=additional_context
        )
        
        grounding_result = content_service.ground_content(grounding_request)
        
        return {
            "grounded_persona_id": f"grounded_{base_persona_id}",
            "base_persona": base_persona_id,
            "grounding_source": source_path,
            "grounding_success": grounding_result.success,
            "grounding_results": grounding_result.results
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/grounding/query-documents")
async def query_documents(
    request: DocumentQueryRequest,
    content_service: ContentService = Depends(get_content_service)
):
    """Query documents using grounding"""
    try:
        results = content_service.query_document(
            document_path=request.document_path,
            query=request.query,
            max_results=request.max_results
        )
        
        return {
            "document_path": request.document_path,
            "query": request.query,
            "results": results,
            "result_count": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/grounding/{grounding_id}")
async def get_grounding(grounding_id: str):
    """Get grounding by ID"""
    # This would require implementing grounding storage
    # For now, return placeholder response
    return {
        "grounding_id": grounding_id,
        "status": "active",
        "message": "Grounding retrieval not yet implemented"
    }


@router.get("/grounding/list")
async def list_groundings():
    """List all groundings"""
    # This would require implementing grounding storage
    # For now, return empty list
    return {"groundings": []}