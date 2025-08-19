# TinyTroupe Enhanced API - Deployment & Testing Guide
## Production Deployment and Quality Assurance

### Overview

This document provides comprehensive instructions for deploying and testing the TinyTroupe Enhanced API service, including local development, staging, and production environments.

## Quick Start (Local Development)

### Prerequisites
```bash
# System requirements
Python 3.11+
Node.js 18+ (for MCP server and ActivePieces nodes)
Git
Docker (optional, recommended for consistency)

# Environment setup
git clone https://github.com/your-org/tinytroupe-enhanced-api
cd tinytroupe-enhanced-api
```

### Local Setup
```bash
# 1. Create Python virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Install TinyTroupe core (development mode)
cd ../..  # Back to TinyTroupe root
pip install -e .
cd dev_docs/v1_mvp/

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration (`.env`)
```bash
# TinyTroupe Core
TINYTROUPE_CONFIG_PATH=../../config.ini
TINYTROUPE_AGENTS_PATH=../../agents
TINYTROUPE_FRAGMENTS_PATH=../../fragments
TINYTROUPE_POPULATIONS_PATH=../../populations

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TEMPERATURE=1.5

# API Configuration  
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=1
DEBUG=true

# Database
DATABASE_URL=sqlite:///./data/tinytroupe_api.db

# Security
SECRET_KEY=your-secret-key-for-jwt-signing
API_KEY_PREFIX=tt_
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8080"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### Required Files Structure
```
dev_docs/v1_mvp/
├── api_implementation.py     # Main FastAPI app
├── requirements.txt          # Python dependencies
├── .env                     # Environment variables
├── .env.example            # Environment template
├── Dockerfile              # Container definition
├── docker-compose.yml      # Local development setup
├── data/                   # Local database and cache
├── logs/                   # Application logs
└── tests/                  # Test suite
    ├── test_personas.py
    ├── test_research.py
    ├── test_simulation.py
    └── test_integration.py
```

### Dependencies (`requirements.txt`)
```
# Core API
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0

# TinyTroupe Integration
openai==1.3.8
numpy==1.24.3
pandas==2.0.3

# Database & Storage
sqlalchemy==2.0.23
sqlite3

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# Utilities
python-dotenv==1.0.0
httpx==0.25.2
aiofiles==23.2.1

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2

# Production
gunicorn==21.2.0
```

## Testing Strategy

### 1. Unit Tests

#### Test Persona Management (`tests/test_personas.py`)
```python
import pytest
import asyncio
from httpx import AsyncClient
from api_implementation import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_persona_from_agent(client):
    """Test loading existing agent as persona"""
    response = await client.post("/api/v1/personas/create-from-agent", json={
        "agent_specification": "lisa_carter",
        "new_agent_name": "Lisa Test"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "persona_id" in data
    assert data["name"] == "Lisa Test"
    assert "minibio" in data

@pytest.mark.asyncio
async def test_demographic_sample_generation(client):
    """Test demographic sample generation"""
    response = await client.post("/api/v1/personas/create-demographic-sample", json={
        "population_source": "./populations/usa.json", 
        "population_size": 10,
        "segments": ["health_conscious"]
    })
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 10
    assert all("persona_id" in persona for persona in data)

@pytest.mark.asyncio
async def test_fragment_application(client):
    """Test applying behavioral fragments"""
    # First create a persona
    persona_response = await client.post("/api/v1/personas/create-from-agent", json={
        "agent_specification": "oscar_architect"
    })
    persona_id = persona_response.json()["persona_id"]
    
    # Apply fragments
    response = await client.post("/api/v1/personas/apply-fragments", json={
        "persona_id": persona_id,
        "fragments": ["./fragments/leftwing.agent.fragment.json"]
    })
    
    assert response.status_code == 200

@pytest.mark.asyncio 
async def test_persona_validation(client):
    """Test persona validation against expectations"""
    # Create persona first
    persona_response = await client.post("/api/v1/personas/create-from-agent", json={
        "agent_specification": "lisa_carter"
    })
    persona_id = persona_response.json()["persona_id"]
    
    # Validate persona
    response = await client.post("/api/v1/personas/validate", json={
        "persona_id": persona_id,
        "expectations": "Should be analytical and data-driven",
        "include_agent_spec": True
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert 0.0 <= data["score"] <= 10.0
```

#### Test Market Research (`tests/test_research.py`)
```python
@pytest.mark.asyncio
async def test_product_evaluation_research(client):
    """Test product evaluation research workflow"""
    # Create test personas
    personas_response = await client.post("/api/v1/personas/create-demographic-sample", json={
        "population_source": "./populations/usa.json",
        "population_size": 5
    })
    persona_ids = [p["persona_id"] for p in personas_response.json()]
    
    # Run product evaluation
    response = await client.post("/api/v1/research/product-evaluation", json={
        "research_name": "Test Gazpacho Research",
        "product": {
            "name": "Bottled Gazpacho",
            "description": "Cold Spanish soup in a bottle",
            "category": "food_beverage", 
            "price_range": "$3-5"
        },
        "target_personas": persona_ids,
        "questions": ["Would you buy this product?"],
        "context": {"market": "US", "distribution_channel": "supermarket"}
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "research_id" in data
    assert "results" in data
    assert "market_verdict" in data["results"]["summary"]

@pytest.mark.asyncio
async def test_advertisement_testing(client):
    """Test advertisement comparison"""
    # Create test personas
    personas_response = await client.post("/api/v1/personas/create-from-agent", json={
        "agent_specification": "lisa_carter"
    })
    persona_id = personas_response.json()["persona_id"]
    
    # Test advertisements
    response = await client.post("/api/v1/research/advertisement-testing", json={
        "research_name": "TV Ad Test",
        "advertisements": [
            {
                "ad_id": "gaming_tv",
                "title": "Ultimate Gaming TV",
                "copy": "Experience next-level gaming...",
                "target_audience": "tech_enthusiasts",
                "key_messages": ["gaming", "performance"]
            },
            {
                "ad_id": "family_tv", 
                "title": "Perfect Family TV",
                "copy": "Bring your family together...",
                "target_audience": "families",
                "key_messages": ["family", "reliability"]
            }
        ],
        "test_personas": [persona_id],
        "evaluation_criteria": ["Which ad appeals more?"]
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "winning_ad" in data["results"]

@pytest.mark.asyncio
async def test_segment_analysis(client):
    """Test market segment analysis"""
    response = await client.post("/api/v1/research/segment-analysis", json={
        "research_name": "Travel Service Analysis", 
        "product": {
            "name": "WanderLux",
            "description": "Luxury adult-focused travel service",
            "positioning": "premium_adult_only"
        },
        "segments": [
            {
                "segment_name": "couples",
                "persona_criteria": "married couples without children", 
                "sample_size": 10
            },
            {
                "segment_name": "families",
                "persona_criteria": "families with young children",
                "sample_size": 10,
                "fragments": ["loving_parent"]
            }
        ],
        "evaluation_question": "Would you use this travel service?"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "segment_comparison" in data["results"]
    assert "best_segment" in data["results"]["insights"]
```

#### Test Simulations (`tests/test_simulation.py`)
```python
@pytest.mark.asyncio
async def test_individual_interaction(client):
    """Test individual persona interaction"""
    # Create persona
    persona_response = await client.post("/api/v1/personas/create-from-agent", json={
        "agent_specification": "lisa_carter"
    })
    persona_id = persona_response.json()["persona_id"]
    
    # Run individual simulation
    response = await client.post("/api/v1/simulate/individual-interaction", json={
        "simulation_type": "individual_interaction",
        "participants": {
            "mode": "existing_agents",
            "specifications": [persona_id]
        },
        "interaction_config": {"max_exchanges": 3},
        "stimulus": {
            "type": "interview_questions",
            "content": ["What are your main challenges at work?"]
        },
        "extraction_config": {
            "objective": "Extract key challenges and pain points",
            "fields": ["challenges", "pain_points"]
        }
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "results" in data

@pytest.mark.asyncio
async def test_focus_group_simulation(client):
    """Test focus group simulation"""
    response = await client.post("/api/v1/simulate/focus-group", json={
        "simulation_type": "focus_group", 
        "participants": {
            "mode": "existing_agents",
            "specifications": ["lisa_carter", "oscar_architect"]
        },
        "interaction_config": {
            "allow_cross_communication": false,
            "rounds": 2
        },
        "stimulus": {
            "type": "product_discussion",
            "content": "Discuss this new AI productivity tool for professionals"
        },
        "extraction_config": {
            "objective": "Extract opinions and concerns",
            "fields": ["opinions", "concerns", "suggestions"]
        }
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"

@pytest.mark.asyncio 
async def test_social_simulation(client):
    """Test social network simulation"""
    response = await client.post("/api/v1/simulate/social-simulation", json={
        "simulation_type": "social_simulation",
        "participants": {
            "mode": "existing_agents", 
            "specifications": ["lisa_carter", "oscar_architect"]
        },
        "interaction_config": {
            "allow_cross_communication": true,
            "rounds": 3
        },
        "stimulus": {
            "type": "discussion_topic",
            "content": "Discuss the future of remote work"
        },
        "extraction_config": {
            "objective": "Extract conversation insights",
            "fields": ["key_points", "disagreements", "consensus"]
        }
    })
    
    assert response.status_code == 200
```

### 2. Integration Tests

#### Test Full Research Workflows (`tests/test_integration.py`)
```python
@pytest.mark.asyncio
async def test_complete_product_research_workflow(client):
    """Test end-to-end product research workflow"""
    # 1. Generate demographic sample
    sample_response = await client.post("/api/v1/personas/create-demographic-sample", json={
        "population_source": "./populations/usa.json",
        "population_size": 20
    })
    personas = sample_response.json()
    persona_ids = [p["persona_id"] for p in personas]
    
    # 2. Run product evaluation
    evaluation_response = await client.post("/api/v1/research/product-evaluation", json={
        "research_name": "Smart Thermostat Research",
        "product": {
            "name": "EcoSmart Thermostat",
            "description": "AI-powered thermostat that learns your schedule and saves energy",
            "category": "home_automation",
            "price_range": "$150-200"
        },
        "target_personas": persona_ids[:10],
        "questions": ["Would you buy this smart thermostat?", "What concerns do you have?"],
        "context": {"market": "US", "distribution_channel": "online"}
    })
    
    # 3. Run segment analysis
    segment_response = await client.post("/api/v1/research/segment-analysis", json={
        "research_name": "Smart Home Segments",
        "product": {
            "name": "EcoSmart Thermostat", 
            "description": "AI-powered energy-saving thermostat"
        },
        "segments": [
            {"segment_name": "tech_early_adopters", "persona_criteria": "tech enthusiasts", "sample_size": 5},
            {"segment_name": "energy_conscious", "persona_criteria": "environmentally conscious homeowners", "sample_size": 5}
        ],
        "evaluation_question": "Would you install this in your home?"
    })
    
    # 4. Extract insights
    evaluation_data = evaluation_response.json()
    segment_data = segment_response.json()
    
    # Validate complete workflow
    assert evaluation_response.status_code == 200
    assert segment_response.status_code == 200
    assert evaluation_data["results"]["summary"]["market_verdict"] in ["good_market", "not_good_market"]
    assert "best_segment" in segment_data["results"]["insights"]

@pytest.mark.asyncio
async def test_campaign_optimization_workflow(client):
    """Test marketing campaign optimization workflow"""
    # 1. Load expert personas
    lisa_response = await client.post("/api/v1/personas/create-from-agent", json={
        "agent_specification": "lisa_carter"
    })
    oscar_response = await client.post("/api/v1/personas/create-from-agent", json={
        "agent_specification": "oscar_architect"
    })
    
    personas = [lisa_response.json()["persona_id"], oscar_response.json()["persona_id"]]
    
    # 2. Test email campaigns
    campaign_response = await client.post("/api/v1/research/advertisement-testing", json={
        "research_name": "Email Campaign A/B Test",
        "advertisements": [
            {
                "ad_id": "technical_email",
                "title": "Advanced Analytics Platform - Technical Overview", 
                "copy": "Leverage machine learning algorithms to optimize your data pipeline...",
                "target_audience": "technical_professionals",
                "key_messages": ["advanced_technology", "performance", "scalability"]
            },
            {
                "ad_id": "business_email",
                "title": "Grow Your Business with Smart Analytics",
                "copy": "Make better decisions faster with our easy-to-use analytics platform...", 
                "target_audience": "business_leaders",
                "key_messages": ["business_growth", "ease_of_use", "roi"]
            }
        ],
        "test_personas": personas,
        "evaluation_criteria": ["Which email would you be more likely to click?", "Which message resonates more?"]
    })
    
    # 3. Individual deep dive on winning campaign
    campaign_data = campaign_response.json()
    winning_ad_id = campaign_data["results"]["winning_ad"]["ad_id"]
    
    individual_response = await client.post("/api/v1/simulate/individual-interaction", json={
        "simulation_type": "individual_interaction",
        "participants": {"mode": "existing_agents", "specifications": [personas[0]]},
        "stimulus": {
            "type": "email_campaign",
            "content": f"Follow-up analysis of {winning_ad_id} campaign"
        },
        "extraction_config": {
            "objective": "Understand why this campaign resonated",
            "fields": ["appeal_factors", "improvement_suggestions"]
        }
    })
    
    assert campaign_response.status_code == 200
    assert individual_response.status_code == 200
```

### 3. Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=api_implementation --cov-report=html

# Run specific test categories
pytest tests/test_personas.py -v        # Persona tests only
pytest tests/test_research.py -v        # Research tests only  
pytest tests/test_integration.py -v     # Integration tests only

# Run tests in parallel (faster)
pytest tests/ -v -n auto

# Run tests with detailed logging
pytest tests/ -v -s --log-cli-level=DEBUG
```

## Local Development

### Development Server
```bash
# Start development server with auto-reload
uvicorn api_implementation:app --reload --host 0.0.0.0 --port 8000

# Or using the script
python api_implementation.py

# View API docs
open http://localhost:8000/docs        # Swagger UI
open http://localhost:8000/redoc       # ReDoc
```

### Development Tools
```bash
# Code formatting
black api_implementation.py tests/

# Linting
flake8 api_implementation.py tests/

# Type checking
mypy api_implementation.py

# Security scanning
bandit -r .
```

### Docker Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  tinytroupe-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DEBUG=true
    volumes:
      - ./:/app
      - ./data:/app/data
      - ../../agents:/app/agents
      - ../../fragments:/app/fragments
      - ../../populations:/app/populations
    command: uvicorn api_implementation:app --reload --host 0.0.0.0 --port 8000

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=tinytroupe
      - POSTGRES_USER=tinytroupe  
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f tinytroupe-api

# Stop environment
docker-compose down
```

## Production Deployment

### 1. Railway Deployment

#### Railway Configuration (`railway.toml`)
```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

#### Production Dockerfile
```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN adduser --disabled-password --gecos '' appuser

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy TinyTroupe core (in production, this would be installed as package)
COPY --chown=appuser:appuser . .

# Create data directory
RUN mkdir -p data && chown appuser:appuser data

# Switch to app user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production command
CMD ["gunicorn", "api_implementation:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

#### Environment Variables (Railway/Production)
```bash
# Core Configuration
OPENAI_API_KEY=sk-production-key-here
OPENAI_MODEL=gpt-4.1-mini
ENVIRONMENT=production
DEBUG=false

# Database
DATABASE_URL=postgresql://user:pass@host:5432/tinytroupe_prod

# Security
SECRET_KEY=super-secret-production-key-here
API_KEY_PREFIX=ttp_
CORS_ORIGINS=["https://yourdomain.com"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=500

# Monitoring
LOG_LEVEL=INFO
SENTRY_DSN=https://your-sentry-dsn-here

# Performance
WORKERS=4
MAX_CONNECTIONS=100
```

### 2. Alternative Deployment Options

#### Render Deployment
```yaml
# render.yaml
services:
  - type: web
    name: tinytroupe-api
    env: python
    plan: starter
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn api_implementation:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: tinytroupe-db
          property: connectionString
    
  - type: postgres
    name: tinytroupe-db
    plan: starter
    databaseName: tinytroupe
    databaseUser: tinytroupe
```

#### Fly.io Deployment
```toml
# fly.toml
app = "tinytroupe-api"
primary_region = "iad"

[env]
  PORT = "8000"
  ENVIRONMENT = "production"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[services]]
  http_checks = ["/health"]
  internal_port = 8000
  processes = ["app"]
  protocol = "tcp"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]  
    handlers = ["tls", "http"]
    port = 443

[deploy]
  release_command = "python -c 'print(\"Database migration placeholder\")'"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

### 3. Production Monitoring

#### Health Monitoring
```python
# Add to api_implementation.py
from datetime import datetime
import psutil
import os

@app.get("/health")
async def health_check():
    """Enhanced health check for production"""
    try:
        # Check TinyTroupe core functionality
        test_persona = TinyPerson.load_specification("./agents/Lisa.agent.json")
        tinytroupe_status = "healthy"
    except Exception as e:
        tinytroupe_status = f"error: {str(e)}"
    
    # System metrics
    memory_usage = psutil.virtual_memory().percent
    disk_usage = psutil.disk_usage('/').percent
    
    return {
        "status": "healthy" if tinytroupe_status == "healthy" else "degraded",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": datetime.utcnow().timestamp() - start_time,
        "system": {
            "memory_usage_percent": memory_usage,
            "disk_usage_percent": disk_usage
        },
        "services": {
            "tinytroupe_core": tinytroupe_status,
            "database": "healthy",  # Add actual DB health check
            "openai_api": "healthy"  # Add actual OpenAI connectivity check
        },
        "metrics": {
            "personas_count": len(manager.personas),
            "simulations_count": len(manager.simulations),
            "active_worlds": len(manager.worlds)
        }
    }

@app.get("/metrics")
async def prometheus_metrics():
    """Prometheus-compatible metrics endpoint"""
    return Response(
        content=f"""# HELP personas_total Total number of personas created
# TYPE personas_total counter
personas_total {len(manager.personas)}

# HELP simulations_total Total number of simulations run
# TYPE simulations_total counter  
simulations_total {len(manager.simulations)}

# HELP active_worlds_total Number of active simulation worlds
# TYPE active_worlds_total gauge
active_worlds_total {len(manager.worlds)}
""",
        media_type="text/plain"
    )
```

#### Logging Configuration
```python
# logging_config.py
import logging
import sys
from pythonjsonlogger import jsonlogger

def setup_logging():
    """Configure structured logging for production"""
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    
    # JSON formatter for production
    if os.getenv('ENVIRONMENT') == 'production':
        formatter = jsonlogger.JsonFormatter(
            '%(asctime)s %(name)s %(levelname)s %(message)s'
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)
    
    # Set third-party loggers to WARNING
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('httpx').setLevel(logging.WARNING)
```

## Performance Testing

### Load Testing with Locust
```python
# locustfile.py
from locust import HttpUser, task, between
import json
import random

class TinyTroupeUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Setup test data"""
        self.api_key = "test-api-key"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Create test personas
        self.persona_ids = []
        self.create_test_personas()
    
    def create_test_personas(self):
        """Create personas for testing"""
        response = self.client.post(
            "/api/v1/personas/create-from-agent",
            headers=self.headers,
            json={"agent_specification": "lisa_carter"}
        )
        if response.status_code == 200:
            self.persona_ids.append(response.json()["persona_id"])
    
    @task(3)
    def test_health_endpoint(self):
        """Test health endpoint (most frequent)"""
        self.client.get("/health")
    
    @task(2) 
    def test_persona_creation(self):
        """Test persona creation"""
        agents = ["lisa_carter", "oscar_architect", "marcos_physician"]
        self.client.post(
            "/api/v1/personas/create-from-agent",
            headers=self.headers,
            json={"agent_specification": random.choice(agents)}
        )
    
    @task(1)
    def test_product_evaluation(self):
        """Test product evaluation (most resource intensive)"""
        if not self.persona_ids:
            return
            
        self.client.post(
            "/api/v1/research/product-evaluation", 
            headers=self.headers,
            json={
                "research_name": "Load Test Product",
                "product": {
                    "name": "Test Product",
                    "description": "A test product for load testing",
                    "category": "test",
                    "price_range": "$10-20"
                },
                "target_personas": self.persona_ids[:1],
                "questions": ["Would you buy this?"],
                "context": {"market": "test"}
            }
        )
```

```bash
# Run load tests
locust -f locustfile.py --host=http://localhost:8000 --users=10 --spawn-rate=2 --run-time=60s

# Production load test  
locust -f locustfile.py --host=https://your-api.railway.app --users=50 --spawn-rate=5 --run-time=300s
```

## Troubleshooting

### Common Issues

#### 1. TinyTroupe Import Errors
```bash
# Problem: ModuleNotFoundError: No module named 'tinytroupe'
# Solution: Install TinyTroupe in development mode
cd ../../  # Go to TinyTroupe root
pip install -e .
```

#### 2. Agent Loading Failures
```bash
# Problem: FileNotFoundError: ./agents/Lisa.agent.json
# Solution: Check paths in environment variables
export TINYTROUPE_AGENTS_PATH=../../agents
export TINYTROUPE_FRAGMENTS_PATH=../../fragments  
export TINYTROUPE_POPULATIONS_PATH=../../populations
```

#### 3. OpenAI API Issues
```bash
# Problem: OpenAI rate limits or API key issues
# Solution: Check API key and implement retry logic
export OPENAI_API_KEY=your-valid-key
# Implement exponential backoff in production
```

#### 4. Memory Issues with Large Simulations
```python
# Problem: Memory usage grows with simulation size
# Solution: Implement simulation cleanup
@app.middleware("http")
async def cleanup_middleware(request: Request, call_next):
    response = await call_next(request)
    
    # Clean up old simulations periodically
    if random.random() < 0.1:  # 10% chance
        cleanup_old_simulations()
    
    return response

def cleanup_old_simulations():
    """Remove simulations older than 1 hour"""
    cutoff_time = datetime.now() - timedelta(hours=1)
    old_sims = [
        sim_id for sim_id, sim in manager.simulations.items()
        if datetime.fromisoformat(sim.get("created_at", "")) < cutoff_time
    ]
    for sim_id in old_sims:
        manager.simulations.pop(sim_id, None)
        manager.worlds.pop(sim_id, None)
```

### Debug Mode

```python
# Enable detailed debugging
import logging
logging.basicConfig(level=logging.DEBUG)

# Add debug endpoints (development only)
if os.getenv('DEBUG') == 'true':
    @app.get("/debug/personas")
    async def debug_personas():
        return {
            "count": len(manager.personas),
            "personas": list(manager.personas.keys())
        }
    
    @app.get("/debug/simulations") 
    async def debug_simulations():
        return {
            "count": len(manager.simulations),
            "simulations": list(manager.simulations.keys())
        }
```

This comprehensive deployment and testing guide ensures the TinyTroupe Enhanced API can be reliably deployed and maintained in production environments.