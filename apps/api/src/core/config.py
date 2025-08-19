"""
Configuration management for the TinyTroupe API
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings and configuration"""
    
    # API Configuration
    API_TITLE: str = "TinyTroupe API"
    API_DESCRIPTION: str = "A FastAPI service that exposes full TinyTroupe functionality"
    API_VERSION: str = "1.0.0"
    
    # CORS Configuration
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:4200", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4200"
    ]
    
    # TinyTroupe Configuration
    TINYTROUPE_PATH: str = "../../packages/tinytroupe-original"
    AGENT_SPECS_PATH: str = "../../packages/tinytroupe-original/examples/agents"
    
    # Background Task Configuration
    MAX_CONCURRENT_SIMULATIONS: int = 5
    SIMULATION_TIMEOUT_SECONDS: int = 300
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def setup_tinytroupe_path(cls):
        """Add TinyTroupe to Python path"""
        tinytroupe_path = Path(cls.TINYTROUPE_PATH).resolve()
        if str(tinytroupe_path) not in sys.path:
            sys.path.insert(0, str(tinytroupe_path))

settings = Settings()

# Initialize TinyTroupe path
settings.setup_tinytroupe_path()