"""
Content enhancement and processing service
"""

from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

from tinytroupe.enrichment import TinyEnricher, TinyStyler
from tinytroupe.tools import TinyWordProcessor
from tinytroupe.agent.grounding import LocalFilesGroundingConnector, WebPagesGroundingConnector
from tinytroupe.agent import TinyPerson

from ..models.content import (
    ContentEnrichmentRequest, 
    ContentStyleRequest,
    ContentEnhancementResponse,
    GroundingRequest,
    GroundingResponse,
    DocumentCreationRequest,
    DocumentCreationResponse
)
from ..models.base import GroundingSourceType


class ContentService:
    """Service for content enhancement, styling, and processing"""
    
    def __init__(self):
        self.enricher = TinyEnricher()
        self.styler = TinyStyler()
        self.word_processor = TinyWordProcessor()
        
        # Grounding connectors
        self.file_connector = LocalFilesGroundingConnector()
        self.web_connector = WebPagesGroundingConnector()
    
    def enrich_content(self, request: ContentEnrichmentRequest) -> ContentEnhancementResponse:
        """Enrich content using TinyEnricher"""
        try:
            enhanced_content = self.enricher.enrich(
                content=request.content,
                enrichment_type=request.enrichment_type,
                context=request.context
            )
            
            return ContentEnhancementResponse(
                original_content=request.content,
                enhanced_content=enhanced_content,
                enrichment_type=request.enrichment_type,
                metadata={
                    "processed_at": datetime.now().isoformat(),
                    "enrichment_context": request.context
                }
            )
            
        except Exception as e:
            raise Exception(f"Content enrichment failed: {str(e)}")
    
    def style_content(self, request: ContentStyleRequest) -> ContentEnhancementResponse:
        """Apply styling to content using TinyStyler"""
        try:
            styled_content = self.styler.style(
                content=request.content,
                style=request.target_style,
                content_type=request.content_type,
                contextual_information=request.contextual_information
            )
            
            return ContentEnhancementResponse(
                original_content=request.content,
                enhanced_content=styled_content,
                style_applied=request.target_style,
                metadata={
                    "processed_at": datetime.now().isoformat(),
                    "content_type": request.content_type,
                    "preserve_facts": request.preserve_facts,
                    "contextual_information": request.contextual_information
                }
            )
            
        except Exception as e:
            raise Exception(f"Content styling failed: {str(e)}")
    
    def ground_content(self, request: GroundingRequest) -> GroundingResponse:
        """Ground content to external sources"""
        try:
            if request.source_type == GroundingSourceType.LOCAL_FILES:
                results = self.file_connector.connect(
                    source_path=request.source_path,
                    query=request.query
                )
            elif request.source_type == GroundingSourceType.WEB_PAGES:
                results = self.web_connector.connect(
                    source_path=request.source_path,
                    query=request.query
                )
            else:
                raise ValueError(f"Unsupported source type: {request.source_type}")
            
            return GroundingResponse(
                source_type=request.source_type,
                source_path=request.source_path,
                results=results,
                success=True,
                metadata={
                    "processed_at": datetime.now().isoformat(),
                    "query": request.query,
                    "result_count": len(results) if isinstance(results, list) else 1
                }
            )
            
        except Exception as e:
            return GroundingResponse(
                source_type=request.source_type,
                source_path=request.source_path,
                results=[],
                success=False,
                error_message=str(e),
                metadata={
                    "processed_at": datetime.now().isoformat(),
                    "query": request.query
                }
            )
    
    def query_document(self, document_path: str, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Query a document using grounding capabilities"""
        grounding_request = GroundingRequest(
            source_type=GroundingSourceType.LOCAL_FILES,
            source_path=document_path,
            query=query
        )
        
        response = self.ground_content(grounding_request)
        
        if response.success:
            # Limit results
            results = response.results[:max_results] if isinstance(response.results, list) else [response.results]
            return results
        else:
            raise Exception(f"Document query failed: {response.error_message}")
    
    def create_document(self, request: DocumentCreationRequest) -> DocumentCreationResponse:
        """Create a document using TinyWordProcessor"""
        try:
            document_content = self.word_processor.create_document(
                content_type=request.content_type,
                topic=request.topic,
                style=request.style,
                length=request.length,
                requirements=request.additional_requirements
            )
            
            document_id = str(uuid.uuid4())
            
            return DocumentCreationResponse(
                document_id=document_id,
                content=document_content,
                document_type=request.content_type,
                topic=request.topic,
                metadata={
                    "created_at": datetime.now().isoformat(),
                    "style": request.style,
                    "length": request.length,
                    "requirements": request.additional_requirements
                }
            )
            
        except Exception as e:
            raise Exception(f"Document creation failed: {str(e)}")
    
    def create_agent_document(self, agent: TinyPerson, document_type: str, topic: str, instructions: Optional[str] = None) -> DocumentCreationResponse:
        """Have an agent create a document"""
        try:
            # Prepare agent prompt
            prompt = f"Create a {document_type} about {topic}."
            if instructions:
                prompt += f" Additional instructions: {instructions}"
            
            # Get agent to create content
            agent.listen_and_act(prompt)
            document_content = agent.get_last_response()
            
            document_id = str(uuid.uuid4())
            
            return DocumentCreationResponse(
                document_id=document_id,
                content=document_content,
                document_type=document_type,
                topic=topic,
                created_by=agent.name,
                metadata={
                    "created_at": datetime.now().isoformat(),
                    "agent_name": agent.name,
                    "instructions": instructions
                }
            )
            
        except Exception as e:
            raise Exception(f"Agent document creation failed: {str(e)}")