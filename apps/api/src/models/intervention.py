"""
Intervention testing models for A/B testing and experiment management
Following TinyTroupe patterns for intervention experiments
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
from enum import Enum

class InterventionType(str, Enum):
    SINGLE_MESSAGE = "single_message"
    CAMPAIGN_SEQUENCE = "campaign_sequence" 
    PRODUCT_FEATURE = "product_feature"
    POLICY_SIMULATION = "policy_simulation"

class InterventionStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"

class Channel(str, Enum):
    EMAIL = "email"
    SOCIAL = "social"
    IN_APP = "in_app"
    SMS = "sms"
    PUSH = "push"
    WEB = "web"

class TimingOption(str, Enum):
    IMMEDIATE = "immediate"
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    DELAYED = "delayed"

class MediaType(str, Enum):
    TEXT = "text"
    RICH = "rich"
    IMAGE = "image"
    VIDEO = "video"

class MetricType(str, Enum):
    RATE = "rate"
    SCORE = "score"
    BINARY = "binary"
    SCALE = "scale"

class InterventionVariant(BaseModel):
    id: str
    name: str
    content: str
    channel: Channel
    timing: TimingOption
    weight: int = Field(ge=1, le=100, description="Percentage weight for this variant")
    media_type: MediaType = MediaType.TEXT
    metadata: Dict[str, Any] = {}

class SuccessMetric(BaseModel):
    id: str
    name: str
    description: str
    type: MetricType
    target: Optional[float] = None
    enabled: bool = True

class CreateInterventionRequest(BaseModel):
    name: str
    description: Optional[str] = None
    type: InterventionType
    variants: List[InterventionVariant] = Field(min_items=2, description="At least 2 variants required")
    success_metrics: List[SuccessMetric]
    target_population_id: Optional[str] = None
    target_segments: Optional[List[str]] = None
    schedule: Optional[Dict[str, Any]] = None
    auto_end_when_significant: bool = False
    enable_real_time_monitoring: bool = True

class UpdateInterventionRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[InterventionStatus] = None
    schedule: Optional[Dict[str, Any]] = None

class ExecuteInterventionRequest(BaseModel):
    intervention_id: str
    population_id: str
    force_start: bool = False

class InterventionResults(BaseModel):
    intervention_id: str
    variant_results: Dict[str, Dict[str, Any]]
    overall_metrics: Dict[str, Any]
    statistical_significance: Dict[str, Any]
    confidence_intervals: Dict[str, Any]
    effect_sizes: Dict[str, Any]
    individual_responses: List[Dict[str, Any]]
    completion_rate: float
    total_participants: int

class InterventionResponse(BaseModel):
    intervention_id: str
    name: str
    type: InterventionType
    status: InterventionStatus
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    variants: List[InterventionVariant]
    success_metrics: List[SuccessMetric]
    target_population_id: Optional[str] = None
    progress: float = 0.0
    current_participants: int = 0
    total_participants: int = 0
    metadata: Dict[str, Any] = {}

class InterventionListResponse(BaseModel):
    interventions: List[InterventionResponse]
    total: int
    page: int = 1
    per_page: int = 50

class CompareInterventionsRequest(BaseModel):
    intervention_ids: List[str]
    comparison_metrics: List[str]
    confidence_level: float = 0.95

class ComparisonResult(BaseModel):
    intervention_id: str
    name: str
    metrics: Dict[str, Any]
    statistical_tests: Dict[str, Any]
    
class InterventionComparisonResponse(BaseModel):
    comparisons: List[ComparisonResult]
    winner: Optional[str] = None
    statistical_summary: Dict[str, Any]
    recommendations: List[str] = []