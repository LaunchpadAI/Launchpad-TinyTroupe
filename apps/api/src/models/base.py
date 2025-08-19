"""
Base enums and shared models for the TinyTroupe API
"""

from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime


class SimulationType(str, Enum):
    FOCUS_GROUP = "focus_group"
    ADVERTISEMENT_TEST = "advertisement_test"
    PRODUCT_EVALUATION = "product_evaluation"
    INTERVIEW = "interview"

class PersonaCreationMode(str, Enum):
    FROM_AGENT = "from_agent"
    FROM_FACTORY = "from_factory"

class OutputFormat(str, Enum):
    TEXT = "text"
    JSON = "json"
    HTML = "html"

class WorldType(str, Enum):
    BASIC = "basic_world"
    SOCIAL_NETWORK = "social_network" 
    TEMPORAL = "temporal_world"
    MULTI_ENVIRONMENT = "multi_environment"

class RelationshipType(str, Enum):
    COLLEAGUE = "colleague"
    FRIEND = "friend"
    FAMILY = "family"
    PROFESSIONAL = "professional"
    CUSTOM = "custom"

class GroundingSourceType(str, Enum):
    LOCAL_FILES = "local_files"
    WEB_PAGES = "web_pages"
    DATABASES = "databases"
    APIS = "apis"