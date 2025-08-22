"""
Agent management service
"""

from typing import List, Dict, Any, Optional
import os
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
            },
            # High Net Worth Individuals for Luxury Property Focus Groups - Real People
            "tony_parker": {
                "id": "tony_parker",
                "name": "Tony Parker",
                "title": "Former NBA Player",
                "description": "Former NBA champion with luxury real estate expertise",
                "file_path": "apps/api/agents/real-athletes/tony_parker_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["sports", "luxury_real_estate", "entertainment", "investment"]
            },
            "kenny_pickett": {
                "id": "kenny_pickett",
                "name": "Kenny Pickett", 
                "title": "NFL Quarterback",
                "description": "NFL quarterback with growing real estate portfolio focused on family-oriented luxury",
                "file_path": "apps/api/agents/real-athletes/kenny_pickett_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["sports", "family", "technology", "practical_luxury"]
            },
            "wayne_gretzky": {
                "id": "wayne_gretzky",
                "name": "Wayne Gretzky",
                "title": "Hockey Legend", 
                "description": "Hockey legend with extensive luxury real estate experience and classic luxury appreciation",
                "file_path": "apps/api/agents/real-athletes/wayne_gretzky_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["sports", "classic_luxury", "entertainment", "celebrity_privacy"]
            },
            "carey_price": {
                "id": "carey_price",
                "name": "Carey Price",
                "title": "NHL Goaltender",
                "description": "NHL goaltender focused on wellness-oriented luxury properties and health amenities",
                "file_path": "apps/api/agents/real-athletes/carey_price_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["sports", "wellness", "fitness", "family", "health"]
            },
            "eric_lamaze": {
                "id": "eric_lamaze",
                "name": "Eric Lamaze",
                "title": "Olympic Equestrian",
                "description": "Olympic equestrian champion with expertise in European-style luxury and country estates",
                "file_path": "apps/api/agents/real-athletes/eric_lamaze_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["equestrian", "european_luxury", "country_estates", "craftsmanship"]
            },
            "brian_griese": {
                "id": "brian_griese",
                "name": "Brian Griese",
                "title": "Former NFL Quarterback/Coach",
                "description": "Former NFL quarterback turned coach with expertise in smart homes and mountain luxury",
                "file_path": "apps/api/agents/real-athletes/brian_griese_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["sports", "smart_home", "mountain_luxury", "entertainment"]
            },
            "channing_frye": {
                "id": "channing_frye",
                "name": "Channing Frye",
                "title": "Former NBA Forward",
                "description": "Former NBA forward with expertise in family-oriented colonial architecture and fine art",
                "file_path": "apps/api/agents/real-athletes/channing_frye_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["sports", "family", "colonial_architecture", "fine_art"]
            },
            "tessa_virtue": {
                "id": "tessa_virtue",
                "name": "Tessa Virtue",
                "title": "Olympic Ice Dancing Champion",
                "description": "Olympic gold medalist with sophisticated French-inspired design taste",
                "file_path": "apps/api/agents/real-athletes/tessa_virtue_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["olympic", "french_design", "heritage_homes", "elegance"]
            },
            "jason_arnott": {
                "id": "jason_arnott",
                "name": "Jason Arnott",
                "title": "Former NHL All-Star",
                "description": "Former NHL All-Star with 'rock star' contemporary aesthetic and luxury entertaining focus",
                "file_path": "apps/api/agents/real-athletes/jason_arnott_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["sports", "contemporary", "entertaining", "luxury_finishes"]
            },
            "derrick_johnson": {
                "id": "derrick_johnson",
                "name": "Derrick Johnson",
                "title": "Former NFL Linebacker/Hall of Famer",
                "description": "College Football Hall of Famer with expertise in Texas luxury family properties",
                "file_path": "apps/api/agents/real-athletes/derrick_johnson_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["sports", "texas_luxury", "family_properties", "water_features"]
            },
            "brandon_mcmanus": {
                "id": "brandon_mcmanus",
                "name": "Brandon McManus",
                "title": "Former NFL Kicker",
                "description": "Former NFL kicker specializing in smart home technology and modern automation",
                "file_path": "apps/api/agents/real-athletes/brandon_mcmanus_tinytroupe.agent.json",
                "category": "high_net_worth",
                "tags": ["sports", "smart_technology", "automation", "contemporary"]
            },
            "real_estate": {
                "id": "real_estate",
                "name": "David Chen",
                "title": "Real Estate Mogul",
                "description": "Real estate developer with deep market and investment knowledge",
                "file_path": "apps/api/agents/artificial-personas/real_estate.agent.json",
                "category": "high_net_worth",
                "tags": ["real_estate", "development", "market_analysis", "investment"]
            }
        }
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """Get all available agents. Future: SELECT * FROM agents"""
        return list(self.available_agents.values())
    
    def get_agent_info(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent metadata. Future: SELECT * FROM agents WHERE id = agent_id"""
        return self.available_agents.get(agent_id)
    
    def load_agent(self, agent_id: str, unique_suffix: Optional[str] = None, disable_semantic_memory: bool = False) -> TinyPerson:
        """Load agent instance with optional unique suffix to avoid naming conflicts"""
        agent_info = self.get_agent_info(agent_id)
        if not agent_info:
            raise ValueError(f"Agent '{agent_id}' not found")
        
        try:
            # Resolve absolute path for agent file
            file_path = agent_info["file_path"]
            if not os.path.isabs(file_path):
                # Convert relative path to absolute path from project root
                # Current file is at apps/api/src/services/agent_service.py
                # We need to go up to project root (4 levels up)
                current_dir = os.path.dirname(os.path.abspath(__file__))
                project_root = os.path.join(current_dir, "..", "..", "..", "..")
                file_path = os.path.join(project_root, file_path)
                file_path = os.path.abspath(file_path)
            
            print(f"🔧 Loading agent from: {file_path}")
            agent = TinyPerson.load_specification(file_path)
            
            # Debug: Check how specification is stored
            print(f"🔍 Agent attributes: {[attr for attr in dir(agent) if 'spec' in attr.lower()]}")
            if hasattr(agent, '_specification'):
                print(f"✅ _specification found")
            elif hasattr(agent, 'specification'):
                print(f"✅ specification found (no underscore)")
            else:
                print(f"❌ No specification attribute found")
            
            # Add unique suffix to avoid naming conflicts
            if unique_suffix:
                agent.name = f"{agent.name}_{unique_suffix}"
            
            # Optionally configure semantic memory for simulations that only need episodic memory
            # This avoids Document property issues when extracting results from conversation history
            if disable_semantic_memory:
                # Instead of setting to None (which breaks serialization), 
                # create a new empty SemanticMemory to avoid Document issues
                from tinytroupe.agent.memory import SemanticMemory
                agent.semantic_memory = SemanticMemory()
            
            return agent
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
        # Session-scoped agent cache: {session_id: {agent_id: agent_instance}}
        self._session_cache: Dict[str, Dict[str, TinyPerson]] = {}
    
    def list_available_agents(self) -> List[Dict[str, Any]]:
        """Get list of all available agents"""
        return self.registry.list_agents()
    
    def get_agent_info(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific agent"""
        return self.registry.get_agent_info(agent_id)
    
    def load_agent(self, agent_id: str, unique_suffix: Optional[str] = None, disable_semantic_memory: bool = False) -> TinyPerson:
        """Load an agent instance with session-scoped caching for consistency"""
        
        # If no unique_suffix, use registry directly (backwards compatibility)
        if not unique_suffix:
            return self.registry.load_agent(agent_id, unique_suffix, disable_semantic_memory)
        
        # Check session cache first - reuse agents within same session
        session_id = unique_suffix
        if session_id not in self._session_cache:
            self._session_cache[session_id] = {}
            
        # Return cached agent if already loaded in this session
        if agent_id in self._session_cache[session_id]:
            cached_agent = self._session_cache[session_id][agent_id]
            print(f"♻️  REUSING cached agent: {cached_agent.name} (session: {session_id[:8]}...)")
            return cached_agent
        
        # Load new agent and cache it for this session
        print(f"🆕 LOADING new agent: {agent_id} (session: {session_id[:8]}...)")
        agent = self.registry.load_agent(agent_id, unique_suffix, disable_semantic_memory)
        
        # Store original agent_id for debugging
        agent._original_id = agent_id
        
        # Cache the agent for this session
        self._session_cache[session_id][agent_id] = agent
        
        return agent
    
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
    
    def load_agent_by_id(self, agent_id: str) -> Optional[TinyPerson]:
        """Load agent by ID - for fragment application"""
        try:
            return self.load_agent(agent_id)
        except ValueError:
            return None
    
    def apply_fragment_to_agent(self, agent: TinyPerson, fragment_text: str) -> Dict[str, Any]:
        """
        Apply personality fragment to an agent
        Following TinyTroupe fragment application patterns
        """
        try:
            # Get current specification
            current_spec = agent.get_specification() if hasattr(agent, 'get_specification') else {}
            
            # Apply fragment using TinyTroupe's fragment system
            # This is a simplified implementation - in real TinyTroupe, fragments are more structured
            
            # Create a fragment specification and apply it
            fragment_spec = f"Additionally, {fragment_text}"
            
            # If agent has apply_fragment method, use it
            if hasattr(agent, 'apply_fragment'):
                agent.apply_fragment(fragment_spec)
            else:
                # Fallback: modify agent's specification directly
                if hasattr(agent, '_specification'):
                    current_description = agent._specification.get('description', '')
                    agent._specification['description'] = f"{current_description}. {fragment_spec}"
                elif hasattr(agent, 'minibio'):
                    agent.minibio = f"{agent.minibio}. {fragment_spec}"
            
            # Get updated specification
            updated_spec = agent.get_specification() if hasattr(agent, 'get_specification') else {}
            
            return {
                "status": "success",
                "specification": updated_spec,
                "summary": f"Applied fragment: {fragment_text}",
                "original_spec": current_spec
            }
            
        except Exception as e:
            raise ValueError(f"Failed to apply fragment: {str(e)}")
    
    def get_available_fragments(self) -> Dict[str, str]:
        """Get available personality fragments with descriptions"""
        return {
            "health_conscious": "Focuses on wellness and healthy lifestyle choices",
            "price_sensitive": "Values cost-effectiveness and deals", 
            "tech_savvy": "Comfortable with technology and digital solutions",
            "environmentally_aware": "Cares about sustainability and eco-friendliness",
            "brand_loyal": "Prefers established brands and familiar products",
            "early_adopter": "Likes to try new products and trends first",
            "social_influence": "Influenced by social media and peer opinions",
            "quality_focused": "Prioritizes high-quality products and experiences",
            "time_constrained": "Values efficiency and time-saving solutions",
            "budget_conscious": "Careful with spending and financial decisions",
            "loving_parent": "Prioritizes family and children's needs",
            "career_focused": "Ambitious and professionally driven",
            "adventurous": "Enjoys new experiences and taking risks",
            "conservative": "Prefers traditional approaches and stability",
            "creative": "Values artistic expression and innovation",
            "analytical": "Prefers data-driven decision making"
        }
    
    def clear_session_cache(self, session_id: str) -> None:
        """Clear cached agents for a specific session"""
        if session_id in self._session_cache:
            print(f"🗑️  CLEARING session cache for: {session_id[:8]}...")
            del self._session_cache[session_id]
    
    def get_session_cache_info(self) -> Dict[str, Any]:
        """Get information about current session cache for debugging"""
        cache_info = {}
        for session_id, agents in self._session_cache.items():
            cache_info[session_id[:8]] = {
                "agent_count": len(agents),
                "agents": [f"{agent_id} -> {agent.name}" for agent_id, agent in agents.items()]
            }
        return cache_info