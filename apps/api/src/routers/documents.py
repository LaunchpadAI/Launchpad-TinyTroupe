"""
Document creation and management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from ..models.content import (
    DocumentCreationRequest,
    AgentDocumentRequest,
    DocumentCreationResponse
)
from ..services.content_service import ContentService
from ..services.agent_service import AgentService
from ..core.dependencies import get_content_service, get_agent_service

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


@router.post("/create", response_model=DocumentCreationResponse)
async def create_document(
    request: DocumentCreationRequest,
    content_service: ContentService = Depends(get_content_service)
):
    """Create a document using TinyWordProcessor"""
    try:
        result = content_service.create_document(request)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-with-agent", response_model=DocumentCreationResponse)
async def create_document_with_agent(
    request: AgentDocumentRequest,
    content_service: ContentService = Depends(get_content_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Have an agent create a document"""
    try:
        # Load agent
        agent = agent_service.load_agent(request.agent_name)
        
        # Create document with agent
        result = content_service.create_agent_document(
            agent=agent,
            document_type=request.document_type,
            topic=request.topic,
            instructions=request.instructions
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{document_id}")
async def get_document(document_id: str):
    """Get document by ID"""
    # This would require implementing document storage
    # For now, return placeholder response
    return {
        "document_id": document_id,
        "status": "available",
        "message": "Document retrieval not yet implemented"
    }


@router.get("/{document_id}/content/{format_type}")
async def get_document_content(document_id: str, format_type: str):
    """Get document content in specified format"""
    # This would require implementing document storage and format conversion
    # For now, return placeholder response
    return {
        "document_id": document_id,
        "format_type": format_type,
        "content": "Document content retrieval not yet implemented",
        "message": "Document content formatting not yet implemented"
    }


@router.get("")
async def list_documents():
    """List all documents"""
    # This would require implementing document storage
    # For now, return empty list
    return {"documents": []}