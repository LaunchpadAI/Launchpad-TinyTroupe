"""
Database abstraction layer - prepared for future Supabase integration
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import json
from pathlib import Path

class DatabaseInterface(ABC):
    """Abstract interface for database operations"""
    
    @abstractmethod
    async def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent by ID"""
        pass
    
    @abstractmethod
    async def list_agents(self) -> List[Dict[str, Any]]:
        """List all agents"""
        pass
    
    @abstractmethod
    async def save_simulation(self, simulation_data: Dict[str, Any]) -> str:
        """Save simulation data"""
        pass
    
    @abstractmethod
    async def get_simulation(self, simulation_id: str) -> Optional[Dict[str, Any]]:
        """Get simulation by ID"""
        pass
    
    @abstractmethod
    async def save_document(self, document_data: Dict[str, Any]) -> str:
        """Save document data"""
        pass
    
    @abstractmethod
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        pass


class FileSystemDatabase(DatabaseInterface):
    """File system implementation for development/testing"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        (self.data_dir / "agents").mkdir(exist_ok=True)
        (self.data_dir / "simulations").mkdir(exist_ok=True)
        (self.data_dir / "documents").mkdir(exist_ok=True)
    
    async def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent by ID"""
        agent_file = self.data_dir / "agents" / f"{agent_id}.json"
        if not agent_file.exists():
            return None
        
        with open(agent_file, 'r') as f:
            return json.load(f)
    
    async def list_agents(self) -> List[Dict[str, Any]]:
        """List all agents"""
        agents = []
        agents_dir = self.data_dir / "agents"
        
        for agent_file in agents_dir.glob("*.json"):
            with open(agent_file, 'r') as f:
                agents.append(json.load(f))
        
        return agents
    
    async def save_simulation(self, simulation_data: Dict[str, Any]) -> str:
        """Save simulation data"""
        simulation_id = simulation_data.get("simulation_id")
        simulation_file = self.data_dir / "simulations" / f"{simulation_id}.json"
        
        with open(simulation_file, 'w') as f:
            json.dump(simulation_data, f, indent=2, default=str)
        
        return simulation_id
    
    async def get_simulation(self, simulation_id: str) -> Optional[Dict[str, Any]]:
        """Get simulation by ID"""
        simulation_file = self.data_dir / "simulations" / f"{simulation_id}.json"
        if not simulation_file.exists():
            return None
        
        with open(simulation_file, 'r') as f:
            return json.load(f)
    
    async def save_document(self, document_data: Dict[str, Any]) -> str:
        """Save document data"""
        document_id = document_data.get("document_id")
        document_file = self.data_dir / "documents" / f"{document_id}.json"
        
        with open(document_file, 'w') as f:
            json.dump(document_data, f, indent=2, default=str)
        
        return document_id
    
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        document_file = self.data_dir / "documents" / f"{document_id}.json"
        if not document_file.exists():
            return None
        
        with open(document_file, 'r') as f:
            return json.load(f)


class SupabaseDatabase(DatabaseInterface):
    """Future Supabase implementation"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        # Initialize Supabase client when implemented
    
    async def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent by ID from Supabase"""
        # TODO: Implement Supabase query
        # SELECT * FROM agents WHERE id = agent_id
        raise NotImplementedError("Supabase integration not yet implemented")
    
    async def list_agents(self) -> List[Dict[str, Any]]:
        """List all agents from Supabase"""
        # TODO: Implement Supabase query
        # SELECT * FROM agents
        raise NotImplementedError("Supabase integration not yet implemented")
    
    async def save_simulation(self, simulation_data: Dict[str, Any]) -> str:
        """Save simulation data to Supabase"""
        # TODO: Implement Supabase insert
        # INSERT INTO simulations (data) VALUES (simulation_data)
        raise NotImplementedError("Supabase integration not yet implemented")
    
    async def get_simulation(self, simulation_id: str) -> Optional[Dict[str, Any]]:
        """Get simulation by ID from Supabase"""
        # TODO: Implement Supabase query
        # SELECT * FROM simulations WHERE id = simulation_id
        raise NotImplementedError("Supabase integration not yet implemented")
    
    async def save_document(self, document_data: Dict[str, Any]) -> str:
        """Save document data to Supabase"""
        # TODO: Implement Supabase insert
        # INSERT INTO documents (data) VALUES (document_data)
        raise NotImplementedError("Supabase integration not yet implemented")
    
    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID from Supabase"""
        # TODO: Implement Supabase query
        # SELECT * FROM documents WHERE id = document_id
        raise NotImplementedError("Supabase integration not yet implemented")


# Database factory
def create_database(database_type: str = "filesystem", **kwargs) -> DatabaseInterface:
    """Factory function to create database instance"""
    if database_type == "filesystem":
        return FileSystemDatabase(kwargs.get("data_dir", "data"))
    elif database_type == "supabase":
        return SupabaseDatabase(
            kwargs.get("supabase_url"),
            kwargs.get("supabase_key")
        )
    else:
        raise ValueError(f"Unsupported database type: {database_type}")