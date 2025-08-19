"""
Research and testing models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class ProductEvaluationRequest(BaseModel):
    product_name: str = Field(..., description="Name of the product to evaluate")
    product_description: str = Field(..., description="Description of the product")
    evaluation_criteria: List[str] = Field(..., description="Criteria to evaluate the product against")
    target_demographic: Optional[str] = Field(None, description="Target demographic for evaluation")
    comparison_products: Optional[List[str]] = Field(None, description="Products to compare against")
    agents: List[str] = Field(default=["lisa", "oscar", "marcos"], description="Agent names for evaluation")
    interaction_rounds: int = Field(default=3, ge=1, le=10, description="Number of evaluation rounds")
    include_individual_feedback: bool = Field(True, description="Include individual agent feedback")
    include_group_consensus: bool = Field(True, description="Include group consensus")
    extract_insights: bool = Field(True, description="Extract structured insights from evaluation")
    
class AdvertisementTestRequest(BaseModel):
    advertisement_content: str = Field(..., description="Content of the advertisement to test")
    target_audience: str = Field(..., description="Target audience description")
    agents: List[str] = Field(default=["lisa", "oscar"], description="Agent names for testing")
    
class SegmentAnalysisRequest(BaseModel):
    segments: List[Dict[str, Any]] = Field(..., description="Market segments to analyze")
    analysis_type: str = Field(..., description="Type of analysis to perform")
    agents: List[str] = Field(default=["lisa", "oscar"], description="Agent names for analysis")
    
class TVAdvertisementRequest(BaseModel):
    product_name: str = Field(..., description="Name of the product being advertised")
    advertisement_script: str = Field(..., description="Script or description of the TV advertisement")
    target_demographic: str = Field(..., description="Target demographic for the advertisement")
    test_duration: int = Field(default=5, ge=1, le=20, description="Duration of the test in simulation rounds")
    focus_group_size: int = Field(default=3, ge=2, le=8, description="Number of agents in the focus group")
    
class CustomerInterviewRequest(BaseModel):
    product_or_service: str = Field(..., description="Product or service being discussed")
    interview_questions: List[str] = Field(..., description="Questions to ask during the interview")
    customer_profile: str = Field(..., description="Profile of the customer being interviewed")
    
class BrainstormingRequest(BaseModel):
    topic: str = Field(..., description="Topic for brainstorming session")
    context: Optional[str] = Field(None, description="Additional context for the brainstorming")
    participants: List[str] = Field(default=["lisa", "oscar", "marcos"], description="Agent names for brainstorming")
    
class StorytellingRequest(BaseModel):
    theme: str = Field(..., description="Theme or topic for the story")
    genre: Optional[str] = Field("general", description="Genre of the story")
    participants: List[str] = Field(default=["lisa", "oscar"], description="Agent names for collaborative storytelling")