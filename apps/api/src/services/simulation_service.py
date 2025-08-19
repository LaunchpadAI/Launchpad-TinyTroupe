"""
Simulation service for running TinyTroupe simulations
"""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

import tinytroupe
from tinytroupe.environment import TinyWorld
from tinytroupe.extraction import ResultsExtractor, ResultsReducer
from tinytroupe.agent import TinyPerson
import tinytroupe.control as control

from ..models.simulation import SimulationRequest, SimulationResponse, ParticipantConfig


class SimulationService:
    """Service for managing TinyTroupe simulations"""
    
    def __init__(self):
        self.active_simulations: Dict[str, Dict[str, Any]] = {}
        self.extractor = ResultsExtractor()
        self.reducer = ResultsReducer()
    
    def run_simulation(self, request: SimulationRequest, agents: List[TinyPerson]) -> SimulationResponse:
        """Run a complete simulation with the given parameters"""
        simulation_id = str(uuid.uuid4())
        
        # Create world and add agents
        world = TinyWorld(f"Simulation_{simulation_id}")
        for agent in agents:
            world.add_agent(agent)
        
        # Store simulation state
        self.active_simulations[simulation_id] = {
            "world": world,
            "request": request,
            "status": "running",
            "started_at": datetime.now(),
            "interactions": []
        }
        
        try:
            # Present stimulus
            world.broadcast(request.stimulus.content)
            
            # Run interaction rounds
            interactions = []
            for round_num in range(request.interaction.max_rounds):
                world.run(1)
                
                # Capture interactions
                round_interactions = world.get_agent_interactions()
                interactions.extend(round_interactions)
                
                # Store in simulation state
                self.active_simulations[simulation_id]["interactions"].extend(round_interactions)
            
            # Extract results
            checkpoint_name = f"sim_{simulation_id}_checkpoint"
            control.checkpoint(checkpoint_name)
            
            extracted_results = self._extract_results(
                checkpoint_name,
                request.extraction.extraction_objective,
                request.extraction.result_type
            )
            
            # Update simulation status
            self.active_simulations[simulation_id]["status"] = "completed"
            
            return SimulationResponse(
                simulation_id=simulation_id,
                status="completed",
                checkpoint_name=checkpoint_name,
                interactions=interactions,
                extracted_results=extracted_results
            )
            
        except Exception as e:
            self.active_simulations[simulation_id]["status"] = "failed"
            raise Exception(f"Simulation failed: {str(e)}")
    
    def _extract_results(self, checkpoint_name: str, objective: str, result_type: str) -> Dict[str, Any]:
        """Extract structured results from simulation"""
        try:
            results = self.extractor.extract_results_from_checkpoint(
                checkpoint_name=checkpoint_name,
                extraction_objective=objective
            )
            
            # Process results based on type
            if result_type == "json":
                return self.reducer.reduce_agent_responses(results, "json")
            elif result_type == "text":
                return self.reducer.reduce_agent_responses(results, "text")
            else:
                return results
                
        except Exception as e:
            return {"error": f"Failed to extract results: {str(e)}"}
    
    def get_simulation_status(self, simulation_id: str) -> Optional[Dict[str, Any]]:
        """Get the status of a simulation"""
        simulation = self.active_simulations.get(simulation_id)
        if not simulation:
            return None
            
        return {
            "simulation_id": simulation_id,
            "status": simulation["status"],
            "started_at": simulation["started_at"].isoformat(),
            "interaction_count": len(simulation["interactions"])
        }
    
    def stop_simulation(self, simulation_id: str) -> bool:
        """Stop a running simulation"""
        if simulation_id in self.active_simulations:
            self.active_simulations[simulation_id]["status"] = "stopped"
            return True
        return False