"""
Content enhancement and processing models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .base import GroundingSourceType


class ContentEnrichmentRequest(BaseModel):
    content: str = Field(..., description="Content to enrich")
    enrichment_type: str = Field(..., description="Type of enrichment to apply")
    context: Optional[str] = Field(None, description="Additional context for enrichment")
    
class ContentStyleRequest(BaseModel):
    content: str = Field(..., description="Content to style")
    target_style: str = Field(..., description="Target style description")
    content_type: Optional[str] = Field(None, description="Type of content being styled")
    preserve_facts: bool = Field(True, description="Whether to preserve factual information")
    contextual_information: Optional[str] = Field(None, description="Additional context for styling")
    
class ContentEnhancementResponse(BaseModel):
    original_content: str
    enhanced_content: str
    enrichment_type: Optional[str] = Field(None, description="Type of enrichment applied")
    style_applied: Optional[str] = Field(None, description="Style transformation applied")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the enhancement")
    
class GroundingRequest(BaseModel):
    source_type: GroundingSourceType
    source_path: str = Field(..., description="Path to the grounding source")
    query: Optional[str] = Field(None, description="Specific query for the grounding source")
    
class DocumentQueryRequest(BaseModel):
    document_path: str = Field(..., description="Path to the document")
    query: str = Field(..., description="Query to ask about the document")
    max_results: int = Field(default=5, ge=1, le=20, description="Maximum number of results to return")
    
class GroundingResponse(BaseModel):
    source_type: GroundingSourceType
    source_path: str
    results: List[Dict[str, Any]] = Field(default=[], description="Grounding results")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    success: bool = Field(..., description="Whether grounding was successful")
    error_message: Optional[str] = Field(None, description="Error message if grounding failed")
    
class DocumentCreationRequest(BaseModel):
    content_type: str = Field(..., description="Type of document to create")
    topic: str = Field(..., description="Main topic or subject")
    style: str = Field(default="professional", description="Writing style for the document")
    length: str = Field(default="medium", description="Target length (short/medium/long)")
    additional_requirements: Optional[str] = Field(None, description="Additional requirements or constraints")
    
class AgentDocumentRequest(BaseModel):
    agent_name: str = Field(..., description="Name of the agent to create the document")
    document_type: str = Field(..., description="Type of document to create")
    topic: str = Field(..., description="Topic for the document")
    instructions: Optional[str] = Field(None, description="Specific instructions for the agent")
    
class DocumentCreationResponse(BaseModel):
    document_id: str
    content: str
    document_type: str
    topic: str
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Document metadata")
    created_by: Optional[str] = Field(None, description="Agent or system that created the document")