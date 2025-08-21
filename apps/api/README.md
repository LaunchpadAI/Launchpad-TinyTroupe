# TinyTroupe API

A production-ready FastAPI service that exposes the full TinyTroupe functionality through clean, modular APIs for persona-based market research and AI agent simulations.

## ✅ Production Status

**v1.0 - PRODUCTION READY**

- ✅ **100% Functional** - All core TinyTroupe capabilities implemented
- ✅ **Session Isolation** - Concurrent simulations with isolated caches  
- ✅ **Results Extraction** - Statistical analysis and insights extraction
- ✅ **Agent Management** - Conflict-free agent loading with unique instances
- ✅ **Full Compatibility** - Mirrors TinyTroupe notebook patterns exactly

**Successfully Tested**:
- Focus group simulations with results extraction
- Individual agent interactions  
- Population generation and demographic sampling
- Concurrent multi-session execution
- Agent specification loading and management

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use the development script
./tools/scripts/start-dev.sh
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Architecture

This API follows a clean, modular architecture with strict separation of concerns:

```
src/
├── models/          # Pydantic schemas organized by domain
├── services/        # Business logic layer
├── routers/         # API endpoint handlers
├── core/            # Core infrastructure (config, dependencies, database)
└── utils/           # Utilities (logging, error handling)
```

### Design Principles

- **DRY (Don't Repeat Yourself)**: No code duplication
- **SRP (Single Responsibility Principle)**: Each module has one clear purpose
- **Dependency Injection**: Clean IoC pattern for service management
- **Type Safety**: Full Pydantic model coverage
- **Error Handling**: Comprehensive exception management
- **Logging**: Structured logging with configurable levels

### Session Management & Caching

**Session Isolation**: Each simulation gets its own cache and agent instances:
```
cache/sessions/sim_<uuid>.json  # Isolated per simulation
agents: Lisa Carter_a1b2c3d4    # Unique names per session
```

**Concurrency Support**: Multiple users can run simulations simultaneously without conflicts.

**Cache Cleanup**: Session caches are automatically managed and can be cleaned up via the cache service.

## 📚 API Endpoints

### Core Resources

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/v1/agents/available` | List available agents |

### Personas
| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/personas/create-from-agent` | Create persona from existing agent |
| `POST /api/v1/personas/create-from-factory` | Generate persona using AI factory |
| `POST /api/v1/personas/validate` | Validate persona against expectations |
| `GET /api/v1/personas/templates` | Get available persona templates |

### Simulations
| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/simulate/focus-group` | Run focus group simulation |
| `POST /api/v1/simulate/individual-interaction` | Single agent interaction |
| `POST /api/v1/simulate/social-simulation` | Multi-agent social simulation |
| `GET /api/v1/simulate/status/{id}` | Get simulation status |

### Worlds & Environments
| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/worlds/create-enhanced` | Create enhanced simulation world |
| `POST /api/v1/worlds/multi-environment` | Multi-environment simulation |
| `POST /api/v1/worlds/investment-firm` | Investment research simulation |

### Content Enhancement
| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/content/enrich` | Enhance content with AI |
| `POST /api/v1/content/style` | Apply styling to content |
| `POST /api/v1/content/grounding/add` | Add grounding source |

### Documents
| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/documents/create` | Create document with AI |
| `POST /api/v1/documents/create-with-agent` | Agent-authored document |

### Research & Testing
| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/research/product-evaluation` | Comprehensive product evaluation |
| `POST /api/v1/research/advertisement-testing` | Ad testing with focus groups |
| `POST /api/v1/research/brainstorming` | Collaborative brainstorming |
| `POST /api/v1/research/customer-interview` | Customer interview simulation |

## 🔧 Configuration

Configuration is managed through environment variables and the `src/core/config.py` file:

```python
# Key settings
API_TITLE = "TinyTroupe API"
API_VERSION = "2.0.0"
TINYTROUPE_PATH = "../../packages/tinytroupe-original"
LOG_LEVEL = "INFO"

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",  # Next.js frontend
    "http://localhost:4200"   # Angular frontend
]
```

## 🗄️ Database

The API includes a database abstraction layer ready for production:

- **Development**: File system storage (`FileSystemDatabase`)
- **Production**: Supabase integration ready (`SupabaseDatabase`)

## 📊 Available Agents

The API comes with three pre-configured personas:

| Agent | Name | Role | Specialization |
|-------|------|------|---------------|
| `lisa` | Lisa Carter | Data Scientist | Marketing, data analysis, health |
| `oscar` | Oscar Rodriguez | Architect | Design, sustainability |
| `marcos` | Marcos Almeida | Physician | Neurology, medical analysis |

## 🔍 Error Handling

Comprehensive error handling with custom exception types:

- `AgentNotFoundException`: Agent not found
- `SimulationFailedException`: Simulation errors
- `ValidationException`: Input validation errors
- `TinyTroupeAPIException`: Base API exception

All errors return structured JSON responses:

```json
{
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent 'invalid_agent' not found",
    "status_code": 404
  }
}
```

## 📝 Logging

Structured logging with configurable levels:

```python
# Log levels: DEBUG, INFO, WARNING, ERROR
LOG_LEVEL = "INFO"

# Logs are written to:
# - Console (stdout)
# - File: logs/api.log
```

## 🧪 Testing

```bash
# Test basic functionality
curl http://localhost:8000/health

# Test agent availability
curl http://localhost:8000/api/v1/agents/available

# Test persona templates
curl http://localhost:8000/api/v1/personas/templates
```

## 🚀 Production Deployment

### Environment Setup

1. **Configure TinyTroupe**: Ensure `packages/tinytroupe-original` is properly configured
2. **Set Environment Variables**: Configure API keys and settings
3. **Database**: Set up Supabase for production data storage
4. **Logging**: Configure log aggregation (e.g., DataDog, CloudWatch)

### Deployment Options

```bash
# Docker deployment
docker build -t tinytroupe-api .
docker run -p 8000:8000 tinytroupe-api

# Direct deployment
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# With Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🔒 Security

- **CORS**: Configured for frontend origins
- **Input Validation**: All endpoints use Pydantic models
- **Error Sanitization**: No sensitive data in error responses
- **Rate Limiting**: Ready for production rate limiting middleware

## 📈 Monitoring

The API is ready for production monitoring:

- **Health Checks**: `/health` endpoint for load balancers
- **Metrics**: Ready for Prometheus/Grafana integration
- **Tracing**: Structured logging for distributed tracing
- **Error Tracking**: Exception handling for error aggregation

## 🤝 Contributing

When adding new features:

1. **Models**: Add Pydantic schemas to appropriate `src/models/` files
2. **Services**: Implement business logic in `src/services/`
3. **Routers**: Add endpoints to appropriate `src/routers/` files
4. **Tests**: Add comprehensive tests for new functionality
5. **Documentation**: Update this README and OpenAPI docs

## 📄 License

This project follows the same license as the TinyTroupe core library.

---

**Built with ❤️ using FastAPI, Pydantic, and TinyTroupe**