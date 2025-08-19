"""
World and environment service
"""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

from tinytroupe.environment import TinyWorld, TinySocialNetwork
from tinytroupe.agent import TinyPerson
from tinytroupe.steering import TinyStory

from ..models.world import EnhancedWorldRequest, EnhancedWorldResponse, MultiEnvironmentRequest
from ..models.base import WorldType


class WorldService:
    """Service for managing TinyTroupe worlds and environments"""
    
    def __init__(self):
        self.active_worlds: Dict[str, TinyWorld] = {}
    
    def create_enhanced_world(self, request: EnhancedWorldRequest, agents: List[TinyPerson]) -> EnhancedWorldResponse:
        """Create an enhanced world with specified configuration"""
        world_id = str(uuid.uuid4())
        
        # Create world based on type
        if request.world_type == WorldType.BASIC:
            world = self._create_basic_world(request, agents)
        elif request.world_type == WorldType.SOCIAL_NETWORK:
            world = self._create_social_network_world(request, agents)
        elif request.world_type == WorldType.TEMPORAL:
            world = self._create_temporal_world(request, agents)
        elif request.world_type == WorldType.MULTI_ENVIRONMENT:
            world = self._create_multi_environment_world(request, agents)
        else:
            raise ValueError(f"Unsupported world type: {request.world_type}")
        
        # Store world
        self.active_worlds[world_id] = world
        
        # Run simulation
        interactions = self._run_world_simulation(world, request.simulation_rounds)
        
        return EnhancedWorldResponse(
            world_id=world_id,
            world_type=request.world_type,
            name=request.name,
            participants=[agent.name for agent in agents],
            interactions=interactions,
            world_state=self._get_world_state(world)
        )
    
    def _create_basic_world(self, request: EnhancedWorldRequest, agents: List[TinyPerson]) -> TinyWorld:
        """Create a basic TinyWorld"""
        world = TinyWorld(request.name)
        for agent in agents:
            world.add_agent(agent)
        return world
    
    def _create_social_network_world(self, request: EnhancedWorldRequest, agents: List[TinyPerson]) -> TinySocialNetwork:
        """Create a social network world"""
        world = TinySocialNetwork(request.name)
        
        # Add agents
        for agent in agents:
            world.add_agent(agent)
        
        # Add relationships if specified
        if request.social_relationships:
            for rel in request.social_relationships:
                world.add_relationship(
                    rel.agent_1, 
                    rel.agent_2, 
                    rel.relationship_type.value,
                    strength=rel.strength
                )
        
        return world
    
    def _create_temporal_world(self, request: EnhancedWorldRequest, agents: List[TinyPerson]) -> TinyWorld:
        """Create a temporal world with time progression"""
        world = TinyWorld(request.name)
        
        # Configure temporal settings
        if request.temporal_settings:
            world.set_start_time(request.temporal_settings.start_time)
            world.set_time_scale(request.temporal_settings.time_scale)
        
        for agent in agents:
            world.add_agent(agent)
        
        return world
    
    def _create_multi_environment_world(self, request: EnhancedWorldRequest, agents: List[TinyPerson]) -> TinyWorld:
        """Create a multi-environment world"""
        world = TinyWorld(request.name)
        
        # Create sub-environments
        if request.environments:
            for env_name in request.environments:
                world.add_environment(env_name)
        
        # Configure environment transitions
        if request.environment_transitions:
            for transition in request.environment_transitions:
                world.add_transition_rule(
                    transition.from_environment,
                    transition.to_environment,
                    transition.trigger_condition
                )
        
        for agent in agents:
            world.add_agent(agent)
        
        return world
    
    def _run_world_simulation(self, world: TinyWorld, rounds: int) -> List[Dict[str, Any]]:
        """Run simulation in the world and capture interactions"""
        interactions = []
        
        for round_num in range(rounds):
            world.run(1)
            round_interactions = world.get_agent_interactions()
            interactions.extend(round_interactions)
        
        return interactions
    
    def _get_world_state(self, world: TinyWorld) -> Dict[str, Any]:
        """Get current state of the world"""
        return {
            "agent_count": len(world.agents),
            "environment_count": getattr(world, "environment_count", 1),
            "simulation_time": getattr(world, "current_time", None),
            "total_interactions": getattr(world, "interaction_count", 0)
        }
    
    def run_multi_environment_simulation(self, request: MultiEnvironmentRequest, agents: List[TinyPerson]) -> Dict[str, Any]:
        """Run a complex multi-environment simulation"""
        simulation_id = str(uuid.uuid4())
        
        # Create main world
        main_world = TinyWorld(f"MultiEnv_{simulation_id}")
        
        # Set up environments and transitions
        for env_config in request.environments:
            main_world.add_environment(env_config)
        
        for transition in request.transition_rules:
            main_world.add_transition_rule(
                transition.from_environment,
                transition.to_environment, 
                transition.trigger_condition
            )
        
        # Add agents
        for agent in agents:
            main_world.add_agent(agent)
        
        # Run simulation
        interactions = []
        for step in range(request.simulation_duration):
            main_world.run(1)
            step_interactions = main_world.get_agent_interactions()
            interactions.extend(step_interactions)
        
        return {
            "simulation_id": simulation_id,
            "interactions": interactions,
            "final_state": self._get_world_state(main_world),
            "environment_visits": main_world.get_environment_visit_history() if hasattr(main_world, "get_environment_visit_history") else {}
        }