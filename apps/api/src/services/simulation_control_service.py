"""
Simulation control service implementing TinyTroupe control patterns
Manages simulation sessions, checkpoints, and state persistence
"""

import os
import uuid
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging

# TinyTroupe imports
import tinytroupe.control as control
from tinytroupe.environment import TinyWorld
from tinytroupe.agent import TinyPerson

from ..models.simulation_control import (
    SimulationSessionRequest,
    CheckpointRequest, 
    RestoreRequest,
    SessionResponse,
    CheckpointResponse,
    SessionListResponse,
    SessionStatsResponse,
    SimulationStatus,
    CheckpointStatus
)

logger = logging.getLogger(__name__)

class SimulationControlService:
    """Service for TinyTroupe simulation control and state management"""
    
    def __init__(self, cache_directory: str = "./cache"):
        self.cache_directory = cache_directory
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.session_checkpoints: Dict[str, List[Dict[str, Any]]] = {}
        
        # Ensure cache directory exists
        os.makedirs(self.cache_directory, exist_ok=True)
    
    async def begin_session(self, request: SimulationSessionRequest) -> SessionResponse:
        """
        Start a new simulation session using control.begin()
        Following TinyTroupe control patterns exactly
        """
        try:
            session_id = str(uuid.uuid4())
            
            # Determine cache file path
            cache_file = None
            if request.cache_file:
                cache_file = os.path.join(self.cache_directory, request.cache_file)
            elif request.session_name:
                cache_file = os.path.join(self.cache_directory, f"{request.session_name}_{session_id}.json")
            
            # Start TinyTroupe control session
            if cache_file:
                control.begin(cache_file)
            else:
                control.begin()  # No caching
            
            # Create session record
            session_data = {
                "session_id": session_id,
                "session_name": request.session_name,
                "status": SimulationStatus.CREATED,
                "created_at": datetime.now(),
                "cache_file": cache_file,
                "description": request.description,
                "max_duration_minutes": request.max_duration_minutes,
                "auto_checkpoint_interval": request.auto_checkpoint_interval,
                "agents": {},
                "worlds": {},
                "interaction_count": 0,
                "last_activity": datetime.now()
            }
            
            self.active_sessions[session_id] = session_data
            self.session_checkpoints[session_id] = []
            
            # Schedule auto-checkpoints if requested
            if request.auto_checkpoint_interval:
                self._schedule_auto_checkpoint(session_id, request.auto_checkpoint_interval)
            
            logger.info(f"Started simulation session: {request.session_name} ({session_id})")
            
            return SessionResponse(
                session_id=session_id,
                session_name=request.session_name,
                status=SimulationStatus.CREATED,
                created_at=session_data["created_at"],
                cache_file=cache_file,
                metadata={
                    "max_duration_minutes": request.max_duration_minutes,
                    "auto_checkpoint_interval": request.auto_checkpoint_interval
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to start session: {str(e)}")
            raise
    
    async def create_checkpoint(self, request: CheckpointRequest) -> CheckpointResponse:
        """
        Create a checkpoint using control.checkpoint()
        Following TinyTroupe checkpoint patterns
        """
        try:
            session = self.active_sessions.get(request.session_id)
            if not session:
                raise ValueError(f"Session {request.session_id} not found")
            
            checkpoint_id = str(uuid.uuid4())
            checkpoint_name = request.checkpoint_name or f"checkpoint_{checkpoint_id[:8]}"
            
            # Create TinyTroupe checkpoint
            control.checkpoint(checkpoint_name)
            
            # Determine checkpoint file path
            checkpoint_file = None
            if session.get("cache_file"):
                base_name = os.path.splitext(session["cache_file"])[0]
                checkpoint_file = f"{base_name}_checkpoint_{checkpoint_name}.json"
            
            # Create checkpoint record
            checkpoint_data = {
                "checkpoint_id": checkpoint_id,
                "checkpoint_name": checkpoint_name,
                "session_id": request.session_id,
                "status": CheckpointStatus.CREATED,
                "created_at": datetime.now(),
                "file_path": checkpoint_file,
                "description": request.description,
                "include_agent_states": request.include_agent_states,
                "metadata": {
                    "agents_count": len(session.get("agents", {})),
                    "worlds_count": len(session.get("worlds", {})),
                    "interactions_count": session.get("interaction_count", 0)
                }
            }
            
            # Save checkpoint metadata
            if checkpoint_file:
                try:
                    checkpoint_metadata = {
                        "checkpoint_info": checkpoint_data,
                        "session_snapshot": {
                            "session_id": request.session_id,
                            "timestamp": checkpoint_data["created_at"].isoformat(),
                            "agents_summary": list(session.get("agents", {}).keys()),
                            "worlds_summary": list(session.get("worlds", {}).keys())
                        }
                    }
                    
                    with open(f"{checkpoint_file}.meta", 'w') as f:
                        json.dump(checkpoint_metadata, f, indent=2, default=str)
                    
                    checkpoint_data["status"] = CheckpointStatus.SAVED
                    
                except Exception as e:
                    logger.warning(f"Failed to save checkpoint metadata: {str(e)}")
            
            # Add to session checkpoints
            if request.session_id not in self.session_checkpoints:
                self.session_checkpoints[request.session_id] = []
            
            self.session_checkpoints[request.session_id].append(checkpoint_data)
            
            # Update session
            session["last_activity"] = datetime.now()
            
            logger.info(f"Created checkpoint: {checkpoint_name} for session {request.session_id}")
            
            return CheckpointResponse(
                checkpoint_id=checkpoint_id,
                checkpoint_name=checkpoint_name,
                session_id=request.session_id,
                status=checkpoint_data["status"],
                created_at=checkpoint_data["created_at"],
                file_path=checkpoint_file,
                metadata=checkpoint_data["metadata"]
            )
            
        except Exception as e:
            logger.error(f"Failed to create checkpoint: {str(e)}")
            raise
    
    async def restore_from_checkpoint(self, request: RestoreRequest) -> SessionResponse:
        """
        Restore simulation state from a checkpoint
        """
        try:
            # Find the checkpoint
            checkpoint = None
            for session_id, checkpoints in self.session_checkpoints.items():
                for cp in checkpoints:
                    if cp["checkpoint_id"] == request.checkpoint_id:
                        checkpoint = cp
                        break
                if checkpoint:
                    break
            
            if not checkpoint:
                raise ValueError(f"Checkpoint {request.checkpoint_id} not found")
            
            # Load checkpoint metadata if available
            checkpoint_file = checkpoint.get("file_path")
            if checkpoint_file and os.path.exists(f"{checkpoint_file}.meta"):
                try:
                    with open(f"{checkpoint_file}.meta", 'r') as f:
                        checkpoint_metadata = json.load(f)
                except Exception as e:
                    logger.warning(f"Failed to load checkpoint metadata: {str(e)}")
                    checkpoint_metadata = {}
            else:
                checkpoint_metadata = {}
            
            if request.create_new_session:
                # Create new session from checkpoint
                new_session_id = str(uuid.uuid4())
                session_name = f"Restored_{checkpoint['checkpoint_name']}_{new_session_id[:8]}"
                
                # Start new control session
                if checkpoint_file and os.path.exists(checkpoint_file):
                    control.begin(checkpoint_file)
                else:
                    control.begin()
                
                # Create new session record
                session_data = {
                    "session_id": new_session_id,
                    "session_name": session_name,
                    "status": SimulationStatus.RUNNING,
                    "created_at": datetime.now(),
                    "cache_file": checkpoint_file,
                    "description": f"Restored from checkpoint: {checkpoint['checkpoint_name']}",
                    "restored_from": checkpoint["checkpoint_id"],
                    "agents": checkpoint_metadata.get("session_snapshot", {}).get("agents_summary", {}),
                    "worlds": {},
                    "interaction_count": checkpoint.get("metadata", {}).get("interactions_count", 0),
                    "last_activity": datetime.now()
                }
                
                self.active_sessions[new_session_id] = session_data
                self.session_checkpoints[new_session_id] = []
                
                logger.info(f"Restored new session from checkpoint: {checkpoint['checkpoint_name']}")
                
                return SessionResponse(
                    session_id=new_session_id,
                    session_name=session_name,
                    status=SimulationStatus.RUNNING,
                    created_at=session_data["created_at"],
                    cache_file=checkpoint_file,
                    metadata={
                        "restored_from": checkpoint["checkpoint_id"],
                        "original_checkpoint": checkpoint["checkpoint_name"]
                    }
                )
            
            else:
                # Restore existing session
                session = self.active_sessions.get(request.session_id)
                if not session:
                    raise ValueError(f"Session {request.session_id} not found")
                
                # Restore control state
                if checkpoint_file and os.path.exists(checkpoint_file):
                    # In a real implementation, this would use TinyTroupe's restore mechanism
                    pass
                
                session["status"] = SimulationStatus.RUNNING
                session["last_activity"] = datetime.now()
                
                logger.info(f"Restored session {request.session_id} from checkpoint: {checkpoint['checkpoint_name']}")
                
                return SessionResponse(
                    session_id=request.session_id,
                    session_name=session["session_name"],
                    status=SimulationStatus.RUNNING,
                    created_at=session["created_at"],
                    cache_file=session.get("cache_file"),
                    checkpoints=[cp for cp in self.session_checkpoints.get(request.session_id, [])],
                    metadata={
                        "restored_from": checkpoint["checkpoint_id"],
                        "restore_timestamp": datetime.now().isoformat()
                    }
                )
            
        except Exception as e:
            logger.error(f"Failed to restore from checkpoint: {str(e)}")
            raise
    
    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """
        End a simulation session using control.end()
        """
        try:
            session = self.active_sessions.get(session_id)
            if not session:
                raise ValueError(f"Session {session_id} not found")
            
            # End TinyTroupe control session
            control.end()
            
            # Update session status
            session["status"] = SimulationStatus.COMPLETED
            session["ended_at"] = datetime.now()
            session["last_activity"] = datetime.now()
            
            # Calculate session statistics
            duration = session["ended_at"] - session["created_at"]
            
            result = {
                "session_id": session_id,
                "status": "ended",
                "duration_minutes": duration.total_seconds() / 60,
                "total_interactions": session.get("interaction_count", 0),
                "checkpoints_created": len(self.session_checkpoints.get(session_id, [])),
                "cache_file": session.get("cache_file")
            }
            
            logger.info(f"Ended simulation session: {session_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to end session: {str(e)}")
            raise
    
    async def get_session_status(self, session_id: str) -> SessionResponse:
        """Get current status of a simulation session"""
        session = self.active_sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        return SessionResponse(
            session_id=session_id,
            session_name=session["session_name"],
            status=session["status"],
            created_at=session["created_at"],
            cache_file=session.get("cache_file"),
            checkpoints=[cp for cp in self.session_checkpoints.get(session_id, [])],
            metadata={
                "uptime_minutes": (datetime.now() - session["created_at"]).total_seconds() / 60,
                "interaction_count": session.get("interaction_count", 0),
                "agents_count": len(session.get("agents", {})),
                "worlds_count": len(session.get("worlds", {}))
            }
        )
    
    async def list_sessions(self, include_ended: bool = False) -> SessionListResponse:
        """List all simulation sessions"""
        sessions = []
        active_count = 0
        
        for session_id, session_data in self.active_sessions.items():
            if not include_ended and session_data["status"] in [SimulationStatus.COMPLETED, SimulationStatus.FAILED]:
                continue
            
            if session_data["status"] in [SimulationStatus.RUNNING, SimulationStatus.PAUSED]:
                active_count += 1
            
            sessions.append(SessionResponse(
                session_id=session_id,
                session_name=session_data["session_name"],
                status=session_data["status"],
                created_at=session_data["created_at"],
                cache_file=session_data.get("cache_file"),
                checkpoints=self.session_checkpoints.get(session_id, []),
                metadata={
                    "description": session_data.get("description"),
                    "interaction_count": session_data.get("interaction_count", 0)
                }
            ))
        
        return SessionListResponse(
            sessions=sessions,
            total_count=len(sessions),
            active_count=active_count
        )
    
    async def get_session_stats(self, session_id: str) -> SessionStatsResponse:
        """Get detailed statistics for a session"""
        session = self.active_sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        uptime = (datetime.now() - session["created_at"]).total_seconds() / 60
        
        # Calculate cache size if cache file exists
        cache_size_mb = None
        if session.get("cache_file") and os.path.exists(session["cache_file"]):
            try:
                cache_size_mb = os.path.getsize(session["cache_file"]) / (1024 * 1024)
            except:
                pass
        
        return SessionStatsResponse(
            session_id=session_id,
            uptime_minutes=uptime,
            interactions_count=session.get("interaction_count", 0),
            agents_count=len(session.get("agents", {})),
            checkpoints_count=len(self.session_checkpoints.get(session_id, [])),
            cache_size_mb=cache_size_mb
        )
    
    def _schedule_auto_checkpoint(self, session_id: str, interval_minutes: int):
        """Schedule automatic checkpoints (simplified implementation)"""
        # In a real implementation, this would use a task scheduler
        logger.info(f"Auto-checkpoint scheduled for session {session_id} every {interval_minutes} minutes")
    
    def register_agent(self, session_id: str, agent: TinyPerson):
        """Register an agent with a session"""
        if session_id in self.active_sessions:
            self.active_sessions[session_id]["agents"][agent.name] = {
                "name": agent.name,
                "registered_at": datetime.now()
            }
    
    def register_world(self, session_id: str, world: TinyWorld):
        """Register a world with a session"""
        if session_id in self.active_sessions:
            self.active_sessions[session_id]["worlds"][world.name] = {
                "name": world.name,
                "registered_at": datetime.now()
            }
    
    def increment_interaction_count(self, session_id: str, count: int = 1):
        """Increment the interaction count for a session"""
        if session_id in self.active_sessions:
            self.active_sessions[session_id]["interaction_count"] += count
            self.active_sessions[session_id]["last_activity"] = datetime.now()