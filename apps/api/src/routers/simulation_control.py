"""
Simulation control endpoints implementing TinyTroupe control patterns
Manages simulation sessions, checkpoints, and state persistence
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from ..models.simulation_control import (
    SimulationSessionRequest,
    CheckpointRequest,
    RestoreRequest,
    SessionResponse,
    CheckpointResponse,
    SessionListResponse,
    SessionStatsResponse
)
from ..services.simulation_control_service import SimulationControlService
from ..core.dependencies import get_simulation_control_service

router = APIRouter(prefix="/api/v1/simulation-control", tags=["simulation-control"])

@router.post("/sessions/begin", response_model=SessionResponse)
async def begin_session(
    request: SimulationSessionRequest,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """
    Start a new simulation session using control.begin()
    Following TinyTroupe control patterns for caching and state management
    """
    try:
        session = await control_service.begin_session(request)
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to start session: {str(e)}")

@router.post("/sessions/{session_id}/checkpoint", response_model=CheckpointResponse)
async def create_checkpoint(
    session_id: str,
    request: CheckpointRequest,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """
    Create a checkpoint using control.checkpoint()
    Saves current simulation state for recovery
    """
    try:
        # Ensure session_id matches request
        request.session_id = session_id
        checkpoint = await control_service.create_checkpoint(request)
        return checkpoint
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create checkpoint: {str(e)}")

@router.post("/sessions/{session_id}/restore", response_model=SessionResponse)
async def restore_from_checkpoint(
    session_id: str,
    request: RestoreRequest,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """
    Restore simulation state from a checkpoint
    Can restore to existing session or create new session
    """
    try:
        # Ensure session_id matches request
        request.session_id = session_id
        restored_session = await control_service.restore_from_checkpoint(request)
        return restored_session
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to restore from checkpoint: {str(e)}")

@router.delete("/sessions/{session_id}/end")
async def end_session(
    session_id: str,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """
    End a simulation session using control.end()
    Cleans up resources and finalizes session
    """
    try:
        result = await control_service.end_session(session_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to end session: {str(e)}")

@router.get("/sessions/{session_id}/status", response_model=SessionResponse)
async def get_session_status(
    session_id: str,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """Get the current status of a simulation session"""
    try:
        session_status = await control_service.get_session_status(session_id)
        return session_status
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session status: {str(e)}")

@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions(
    include_ended: bool = False,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """List all simulation sessions"""
    try:
        sessions = await control_service.list_sessions(include_ended=include_ended)
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")

@router.get("/sessions/{session_id}/stats", response_model=SessionStatsResponse)
async def get_session_stats(
    session_id: str,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """Get detailed statistics for a simulation session"""
    try:
        stats = await control_service.get_session_stats(session_id)
        return stats
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session stats: {str(e)}")

# Utility endpoints for session management

@router.get("/sessions/{session_id}/checkpoints")
async def list_session_checkpoints(
    session_id: str,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """List all checkpoints for a session"""
    try:
        session_status = await control_service.get_session_status(session_id)
        return {"checkpoints": session_status.checkpoints}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list checkpoints: {str(e)}")

@router.post("/sessions/{session_id}/pause")
async def pause_session(
    session_id: str,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """Pause a running simulation session"""
    try:
        # Simple implementation - just update status
        session = control_service.active_sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session["status"] = "paused"
        return {"session_id": session_id, "status": "paused"}
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to pause session: {str(e)}")

@router.post("/sessions/{session_id}/resume")
async def resume_session(
    session_id: str,
    control_service: SimulationControlService = Depends(get_simulation_control_service)
):
    """Resume a paused simulation session"""
    try:
        # Simple implementation - just update status
        session = control_service.active_sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session["status"] = "running"
        return {"session_id": session_id, "status": "running"}
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to resume session: {str(e)}")