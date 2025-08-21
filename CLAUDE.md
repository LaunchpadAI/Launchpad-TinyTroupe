# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a production-ready Nx monorepo for TinyTroupe - an AI agent simulation platform for market research and consumer insights. The system includes a FastAPI backend (100% functional) and Next.js frontend with comprehensive testing capabilities.

## Development Commands

### Starting Development Environment
```bash
# Start both API and frontend in parallel
nx run-many --target=serve --projects=api,web --parallel

# Or use the convenience script
./tools/scripts/start-dev.sh

# Start services individually
nx serve api        # FastAPI on http://localhost:8000
nx serve web        # Next.js on http://localhost:3000
```

### Build Commands
```bash
# Build all projects
nx run-many --target=build --projects=api,web

# Build individually
nx build api        # Python build (placeholder)
nx build web        # Next.js production build
```

### Testing Commands
```bash
# Run API tests (pytest)
nx test api

# Frontend tests (placeholder - no tests configured yet)
nx test web

# Manual API testing via frontend
# Navigate to http://localhost:3000 for comprehensive UI testing
```

### Python Dependencies
```bash
# Install API dependencies (from repository root)
cd apps/api && pip install -r requirements.txt && cd ../..

# The requirements.txt includes editable install of TinyTroupe:
# -e ../../packages/tinytroupe-original
```

## Architecture Overview

### Monorepo Structure
- **Nx Workspace**: v21.4.0 manages the monorepo with caching and dependency graphs
- **apps/api/**: FastAPI backend with clean architecture (models, services, routers, core, utils)
- **apps/web/**: Next.js 14 frontend with TypeScript and Tailwind CSS
- **libs/**: Shared libraries including TypeScript API client
- **packages/tinytroupe-original/**: Original TinyTroupe research library (preserved)

### FastAPI Backend Architecture

**Core Principles**: DRY (Don't Repeat Yourself) and SRP (Single Responsibility Principle)

**Service Layer Pattern**:
```
src/services/
├── simulation_service.py    # Core simulation orchestration
├── agent_service.py         # Agent loading and management  
├── population_service.py    # Bulk agent generation
├── cache_service.py         # Session-scoped caching
├── intervention_service.py  # A/B testing and interventions
└── [7 more specialized services]
```

**Session Isolation**: Each simulation gets a unique UUID and isolated cache:
```
cache/sessions/sim_<uuid>.json  # Session-specific cache
agents: Lisa Carter_a1b2c3d4    # Unique agent names per session
```

**API Router Organization**: 11 domain-specific routers (personas, simulations, research, etc.)

### TinyTroupe Integration Patterns

**Agent Management**:
- Pre-configured agents: Lisa Carter (Data Scientist), Oscar Rodriguez (Architect), Marcos Almeida (Physician)
- Dynamic loading from JSON specifications in `packages/tinytroupe-original/examples/`
- Session isolation prevents agent naming conflicts in concurrent simulations

**Results Extraction Pattern**:
```python
# CORRECT: Extract from agents directly (not checkpoints)
rapporteur.listen_and_act(consolidation_prompt)  # Consolidation step
results = self.extractor.extract_results_from_agent(rapporteur, extraction_objective)
```

**Session Management**:
```python
# Session lifecycle for concurrent support
control.begin(cache_file=session_cache_file, cache=True)
# ... run simulation ...
control.end()
```

### Frontend Architecture

**Next.js App Router**: Modern app directory structure with TypeScript
**UI Patterns**: Dual-mode interface (Developer/API Testing + Business User/Workflow Builder)
**Key Pages**: 
- `/personas` - Agent and population management
- `/simulations` - Focus groups and individual interactions
- `/research` - Market research and brainstorming
- `/v2/*` - Advanced drag-and-drop workflow builder

## Configuration Files

### Environment Setup
```bash
# API configuration
cp apps/api/.env.example apps/api/.env
# Edit with OpenAI API key and other settings
```

### TinyTroupe Configuration
- **Location**: `packages/tinytroupe-original/tinytroupe/config.ini`
- **Model**: gpt-4o-mini (primary), o3-mini (reasoning), text-embedding-3-small
- **Cache Settings**: Session-isolated caching enabled

### CORS Configuration
```python
# apps/api/src/core/config.py
CORS_ORIGINS = [
    "http://localhost:3000",  # Next.js frontend
    "http://localhost:4200"   # Angular frontend (if used)
]
```

## Development Workflow

### Adding New API Endpoints
1. **Models**: Add Pydantic schemas to `src/models/[domain].py`
2. **Services**: Implement business logic in `src/services/[domain]_service.py`
3. **Routers**: Add endpoints to `src/routers/[domain].py`
4. **Dependencies**: Use dependency injection pattern from `src/core/dependencies.py`

### Session Management for Concurrent Users
Always use session-scoped operations to prevent conflicts:
```python
# Generate unique session ID
session_id = str(uuid.uuid4())
session_cache_file = f"cache/sessions/session_{session_id}.json"

# Load agents with unique suffixes
agent = agent_service.load_agent(agent_spec, unique_suffix=session_id)
```

### Error Handling Pattern
Use custom exception hierarchy from `src/utils/exceptions.py`:
- `TinyTroupeAPIException` (base)
- `AgentNotFoundException`
- `SimulationFailedException`
- `ValidationException`

## Key Documentation

- **[TinyTroupe API v1.0 Documentation](./apps/api/docs/TinyTroupe_API_Core_v1_Documentation.md)**: Complete API reference with working examples
- **[API Testing Log](./apps/api/dev_docs/API_Testing_Log.md)**: Testing results and validation (7/7 success criteria met)
- **[Frontend Implementation Analysis](./apps/web/Frontend_Implementation_Analysis.md)**: UI/UX architecture and roadmap

## Production Status

**TinyTroupe API v1.0 - PRODUCTION READY**
- ✅ 100% Functional - All core TinyTroupe capabilities implemented
- ✅ Session Isolation - Concurrent simulations with isolated caches
- ✅ Results Extraction - Statistical analysis and insights extraction working
- ✅ Agent Management - Conflict-free agent loading with unique instances
- ✅ Full Compatibility - Mirrors TinyTroupe notebook patterns exactly

## Common Development Patterns

### Running API Health Checks
```bash
curl -s http://localhost:8000/health
curl -s http://localhost:8000/api/v1/agents/available
```

### Frontend Development
- Uses SWR for data fetching and caching
- Tailwind CSS with custom gradient designs
- react-hook-form + Zod for form validation
- Recharts for data visualization

### Debugging
- **API Logs**: Monitor uvicorn output for ERROR/WARNING messages
- **Session Conflicts**: Check for agent naming conflicts in logs
- **Cache Issues**: Session caches in `cache/sessions/` for isolation debugging

The system successfully bridges the original TinyTroupe research library with modern web development practices, providing both developer-friendly APIs and business-user interfaces for AI agent simulations.

## Development Best Practices

### Code Quality Principles

**DRY (Don't Repeat Yourself)**:
- Never duplicate code - extract common functionality into services or utilities
- Use dependency injection pattern consistently across all services
- Create reusable Pydantic models rather than duplicating schemas
- Share TypeScript types between frontend components

**SRP (Single Responsibility Principle)**:
- Each service handles one domain (AgentService, SimulationService, etc.)
- Router functions only handle HTTP concerns - delegate business logic to services
- Models only define data structures - no business logic
- Keep components focused on single UI concerns

**Type Safety**:
- Use Pydantic models for all API request/response schemas
- Maintain TypeScript strict mode - never use `any` type
- Validate all inputs at API boundaries
- Use proper exception types from `src/utils/exceptions.py`

### Analysis and Problem-Solving Guidelines

**Thorough Investigation Required**:
- Never use uncertain language like "likely", "probably", "might be" in code analysis
- Always read actual source code before making conclusions
- Check logs and error messages for exact error details
- Trace execution flow through services to understand root causes

**Root Cause Analysis Process**:
1. **Read the exact error message** - don't assume based on symptoms
2. **Trace the code path** - follow the execution from API endpoint to service to TinyTroupe
3. **Check configuration files** - verify settings in config.ini, .env files
4. **Review session state** - check cache files and agent states
5. **Validate assumptions** - test hypotheses with actual code execution

**Documentation Standards**:
- Update API documentation immediately when endpoints change
- Keep testing logs current with actual test results
- Document configuration changes in appropriate README files
- Never assume documentation is correct - verify against actual code

### TinyTroupe Integration Best Practices

**Session Management**:
- Always use session isolation for concurrent operations
- Generate unique UUIDs for each simulation session
- Clean up sessions properly with `control.end()`
- Never reuse agent instances across sessions

**Agent Handling**:
- Load agents with unique suffixes: `agent_service.load_agent(agent_name, unique_suffix=session_id)`
- Verify agent specifications exist before loading
- Handle agent loading failures gracefully
- Clear agent states between simulations

**Results Extraction**:
- Follow TinyTroupe notebook patterns exactly - extract from agents, not checkpoints
- Always include consolidation step before extraction
- Validate extraction objectives are properly formatted
- Handle extraction failures with specific error messages

### Error Handling Standards

**Exception Management**:
- Use specific exception types from the custom hierarchy
- Provide detailed error messages with context
- Log errors with sufficient detail for debugging
- Never catch and ignore exceptions without proper handling

**Debugging Approach**:
- Check uvicorn logs for exact error messages
- Monitor session cache files for conflicts
- Verify TinyTroupe configuration settings
- Test with minimal reproduction cases

### API Development Standards

**Endpoint Design**:
- Use consistent HTTP status codes (200, 400, 404, 500)
- Return structured error responses with error codes
- Implement proper input validation with Pydantic
- Include comprehensive OpenAPI documentation

**Service Layer**:
- Inject dependencies through `src/core/dependencies.py`
- Handle business logic only in service classes
- Maintain separation between HTTP and business concerns
- Use async/await patterns consistently

### Frontend Development Standards

**Component Architecture**:
- Keep components focused on single responsibilities
- Use TypeScript interfaces for all props and state
- Implement proper error boundaries for fault tolerance
- Follow consistent naming conventions

**State Management**:
- Use SWR for server state management
- Keep local state minimal and focused
- Handle loading and error states explicitly
- Validate form inputs with Zod schemas

### Testing and Validation

**API Testing**:
- Test all endpoints through the frontend interface
- Verify session isolation with concurrent requests
- Validate error handling with invalid inputs
- Check results extraction with real simulations

**Code Validation**:
- Run type checking before committing changes
- Test with actual TinyTroupe simulations
- Verify configuration changes don't break existing functionality
- Check that session cleanup works properly

### Commit and Documentation Standards

**Git Practices**:
- Write clear commit messages describing actual changes made
- Include issue resolution details in commit descriptions
- Test functionality before committing
- Update relevant documentation with each change

**Code Review**:
- Verify changes follow established patterns
- Check that error handling is comprehensive
- Ensure type safety is maintained
- Validate that session isolation is preserved

### Performance and Scalability

**Concurrent Operations**:
- Design for multiple simultaneous users
- Use session-scoped caching to prevent conflicts
- Monitor resource usage during bulk operations
- Handle timeouts and resource limits gracefully

**Cache Management**:
- Implement proper cache cleanup strategies
- Monitor cache file sizes and growth
- Use appropriate cache TTL settings
- Handle cache corruption gracefully

### Security Considerations

**Input Validation**:
- Validate all user inputs with Pydantic schemas
- Sanitize file paths and session identifiers
- Handle authentication and authorization properly
- Never expose internal error details to users

**Configuration Management**:
- Keep sensitive data in environment variables
- Never commit API keys or secrets
- Use appropriate CORS settings for production
- Validate configuration at startup