"""
Logging configuration
"""

import logging
import sys
from pathlib import Path

def setup_logging(log_level: str = "INFO"):
    """Configure logging for the application"""
    
    # Create logs directory
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_dir / "api.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Configure specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("tinytroupe").setLevel(logging.INFO)
    
    return logging.getLogger(__name__)