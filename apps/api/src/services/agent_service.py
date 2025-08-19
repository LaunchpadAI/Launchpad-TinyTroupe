"""
Agent management service
"""

from typing import List, Dict, Any, Optional
import tinytroupe
from tinytroupe.agent import TinyPerson
from tinytroupe.factory import TinyPersonFactory
from tinytroupe.validation import TinyPersonValidator


class AgentRegistry:
    """
    Production agent management system.
    Forward compatible with database storage.
    """
    
    def __init__(self, agent_specs_path: str):
        self.agent_specs_path = agent_specs_path
        
        # Agent catalog - in future this will be loaded from database
        self.available_agents = {
            "lisa": {
                "id": "lisa",
                "name": "Lisa Carter",
                "title": "Data Scientist",
                "description": "Marketing professional and data scientist, health-conscious",
                "file_path": f"{self.agent_specs_path}/Lisa.agent.json",
                "category": "professional",
                "tags": ["marketing", "data", "health"]
            },
            "oscar": {
                "id": "oscar", 
                "name": "Oscar Rodriguez",
                "title": "Architect",
                "description": "Architect focused on design and sustainability",
                "file_path": f"{self.agent_specs_path}/Oscar.agent.json",
                "category": "professional",
                "tags": ["architecture", "design", "sustainability"]
            },
            "marcos": {
                "id": "marcos",
                "name": "Marcos Almeida", 
                "title": "Physician",
                "description": "Physician specializing in neurology, analytical thinker",
                "file_path": f"{self.agent_specs_path}/Marcos.agent.json",
                "category": "medical",
                "tags": ["medicine", "neurology", "science"]
            }
        }
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """Get all available agents. Future: SELECT * FROM agents"""
        return list(self.available_agents.values())
    
    def get_agent_info(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent metadata. Future: SELECT * FROM agents WHERE id = agent_id"""
        return self.available_agents.get(agent_id)
    
    def load_agent(self, agent_id: str) -> TinyPerson:
        """Load agent instance. Future: load from DB stored spec"""
        agent_info = self.get_agent_info(agent_id)
        if not agent_info:
            raise ValueError(f"Agent '{agent_id}' not found")
        
        try:
            return TinyPerson.load_specification(agent_info["file_path"])
        except Exception as e:
            raise ValueError(f"Failed to load agent '{agent_id}': {str(e)}")
    
    def agent_exists(self, agent_id: str) -> bool:
        """Check if agent exists. Future: SELECT COUNT(*) FROM agents WHERE id = agent_id"""
        return agent_id in self.available_agents


class AgentService:
    """Service for agent-related operations"""
    
    def __init__(self, agent_specs_path: str):
        self.registry = AgentRegistry(agent_specs_path)
        self.factory = TinyPersonFactory()
        self.validator = TinyPersonValidator()
    
    def list_available_agents(self) -> List[Dict[str, Any]]:
        """Get list of all available agents"""
        return self.registry.list_agents()
    
    def get_agent_info(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific agent"""
        return self.registry.get_agent_info(agent_id)
    
    def load_agent(self, agent_id: str) -> TinyPerson:
        """Load an agent instance"""
        return self.registry.load_agent(agent_id)
    
    def create_persona_from_agent(self, agent_name: str, new_agent_name: Optional[str] = None) -> TinyPerson:
        """Create a persona from an existing agent"""
        agent = self.registry.load_agent(agent_name)
        if new_agent_name:
            agent.name = new_agent_name
        return agent
    
    def create_persona_from_factory(self, context: str, specification: str, temperature: float = 1.0) -> TinyPerson:
        """Create a persona using the factory"""
        return self.factory.generate_person(
            specification=specification,
            temperature=temperature,
            context=context
        )
    
    def validate_persona(self, persona: TinyPerson, expectations: str, include_agent_spec: bool = True) -> Dict[str, Any]:
        """Validate a persona against expectations"""
        return self.validator.validate_person(
            persona=persona,
            expectations=expectations,
            include_agent_spec=include_agent_spec
        )