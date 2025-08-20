"""
Simulation control models following TinyTroupe control patterns
Based on control.begin(), control.checkpoint(), control.end() workflows
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime

class SimulationStatus(str, Enum):
    """Simulation status states"""
    CREATED = "created"
    RUNNING = "running" 
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    STOPPED = "stopped"

class CheckpointStatus(str, Enum):
    """Checkpoint status states"""
    CREATED = "created"
    SAVED = "saved"
    RESTORED = "restored"
    FAILED = "failed"

class SimulationSessionRequest(BaseModel):
    """Request to start a new simulation session"""
    session_name: str = Field(..., description="Unique name for the simulation session")
    cache_file: Optional[str] = Field(None, description="Cache file for persistence (optional)")
    description: Optional[str] = Field(None, description="Description of the simulation purpose")
    max_duration_minutes: Optional[int] = Field(30, ge=1, le=480, description="Maximum session duration")
    auto_checkpoint_interval: Optional[int] = Field(None, description="Auto-checkpoint interval in minutes")

class CheckpointRequest(BaseModel):
    """Request to create a simulation checkpoint"""
    session_id: str = Field(..., description="ID of the active simulation session")
    checkpoint_name: str = Field(..., description="Name for the checkpoint")
    description: Optional[str] = Field(None, description="Optional checkpoint description")
    include_agent_states: bool = Field(True, description="Include full agent states in checkpoint")

class RestoreRequest(BaseModel):
    """Request to restore from a checkpoint"""
    session_id: str = Field(..., description="ID of the simulation session")
    checkpoint_id: str = Field(..., description="ID of the checkpoint to restore")
    create_new_session: bool = Field(False, description="Create new session from checkpoint")

class SessionResponse(BaseModel):
    """Response for session operations"""
    session_id: str
    session_name: str
    status: SimulationStatus
    created_at: datetime
    cache_file: Optional[str]
    checkpoints: List[Dict[str, Any]] = Field(default=[])
    metadata: Dict[str, Any] = Field(default={})

class CheckpointResponse(BaseModel):
    """Response for checkpoint operations"""
    checkpoint_id: str
    checkpoint_name: str
    session_id: str
    status: CheckpointStatus
    created_at: datetime
    file_path: Optional[str]
    metadata: Dict[str, Any] = Field(default={})

class SessionListResponse(BaseModel):
    """Response for session list"""
    sessions: List[SessionResponse]
    total_count: int
    active_count: int

class SessionStatsResponse(BaseModel):
    """Session statistics response"""
    session_id: str
    uptime_minutes: float
    interactions_count: int
    agents_count: int
    checkpoints_count: int
    memory_usage_mb: Optional[float] = None
    cache_size_mb: Optional[float] = None