"""
Research and testing endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from ..models.research import (
    ProductEvaluationRequest,
    AdvertisementTestRequest,
    CustomerInterviewRequest,
    BrainstormingRequest,
    StorytellingRequest,
    TVAdvertisementRequest,
    SegmentAnalysisRequest
)
from ..services.research_service import ResearchService
from ..services.agent_service import AgentService
from ..core.dependencies import get_research_service, get_agent_service

router = APIRouter(prefix="/api/v1/research", tags=["research"])


@router.post("/product-evaluation")
async def evaluate_product(
    request: ProductEvaluationRequest,
    research_service: ResearchService = Depends(get_research_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Conduct comprehensive product evaluation"""
    try:
        # Load agents
        agents = []
        for agent_name in request.agents:
            agent = agent_service.load_agent(agent_name)
            agents.append(agent)
        
        # Run product evaluation
        result = research_service.evaluate_product(request, agents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/advertisement-testing")
async def test_advertisement(
    request: AdvertisementTestRequest,
    research_service: ResearchService = Depends(get_research_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Test advertisement with focus group"""
    try:
        # Load agents
        agents = []
        for agent_name in request.agents:
            agent = agent_service.load_agent(agent_name)
            agents.append(agent)
        
        # Run advertisement test
        result = research_service.test_advertisement(request, agents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/segment-analysis")
async def analyze_segments(
    request: SegmentAnalysisRequest,
    research_service: ResearchService = Depends(get_research_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Analyze market segments"""
    try:
        # Load agents
        agents = []
        for agent_name in request.agents:
            agent = agent_service.load_agent(agent_name)
            agents.append(agent)
        
        # Analyze segments (implementation needed)
        return {
            "session_id": "segment_analysis_session",
            "segments": request.segments,
            "analysis_type": request.analysis_type,
            "participants": [agent.name for agent in agents],
            "message": "Segment analysis functionality to be implemented"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/customer-interview")
async def conduct_customer_interview(
    request: CustomerInterviewRequest,
    research_service: ResearchService = Depends(get_research_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Conduct customer interview"""
    try:
        # Load agent (single agent for interview)
        agent = agent_service.load_agent("lisa")  # Default to lisa for interviews
        
        # Conduct interview
        result = research_service.conduct_customer_interview(request, agent)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/brainstorming")
async def run_brainstorming(
    request: BrainstormingRequest,
    research_service: ResearchService = Depends(get_research_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Run collaborative brainstorming session"""
    try:
        # Load agents
        agents = []
        for agent_name in request.participants:
            agent = agent_service.load_agent(agent_name)
            agents.append(agent)
        
        # Run brainstorming
        result = research_service.run_brainstorming(request, agents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/storytelling")
async def create_collaborative_story(
    request: StorytellingRequest,
    research_service: ResearchService = Depends(get_research_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Create collaborative story"""
    try:
        # Load agents
        agents = []
        for agent_name in request.participants:
            agent = agent_service.load_agent(agent_name)
            agents.append(agent)
        
        # Create story
        result = research_service.create_collaborative_story(request, agents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/tv-advertisement")
async def test_tv_advertisement(
    request: TVAdvertisementRequest,
    research_service: ResearchService = Depends(get_research_service),
    agent_service: AgentService = Depends(get_agent_service)
):
    """Test TV advertisement with focus group"""
    try:
        # Load agents for focus group
        agents = []
        agent_names = ["lisa", "oscar", "marcos"][:request.focus_group_size]
        
        for agent_name in agent_names:
            agent = agent_service.load_agent(agent_name)
            agents.append(agent)
        
        # Convert to AdvertisementTestRequest
        ad_test_request = AdvertisementTestRequest(
            advertisement_content=request.advertisement_script,
            target_audience=request.target_demographic,
            agents=agent_names
        )
        
        # Run TV advertisement test
        result = research_service.test_advertisement(ad_test_request, agents)
        
        # Add TV-specific context
        result["tv_advertisement"] = {
            "product_name": request.product_name,
            "advertisement_script": request.advertisement_script,
            "target_demographic": request.target_demographic,
            "test_duration": request.test_duration,
            "focus_group_size": request.focus_group_size
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))