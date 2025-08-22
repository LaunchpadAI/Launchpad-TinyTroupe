# TinyTroupe Nx Monorepo

A production-ready monorepo for TinyTroupe with FastAPI backend and Next.js frontend for AI agent simulations and market research.

## 🏗️ Project Structure

```
TinyTroupe-Monorepo/
├── apps/                           # Applications
│   ├── api/                       # FastAPI TinyTroupe service
│   └── web/                       # Next.js testing frontend
├── libs/                          # Shared libraries
│   ├── tinytroupe-core/          # Core TinyTroupe library (symlinked)
│   └── api-client/               # TypeScript API client
├── packages/                      # Legacy packages and original source
│   └── tinytroupe-original/      # Original TinyTroupe codebase
│       ├── examples/             # Agent configs, fragments, populations
│       ├── docs/                 # Original documentation
│       ├── tests/                # Original test suite
│       └── tinytroupe/           # Original Python package
├── tools/                         # Development utilities
│   └── scripts/                  # Development scripts
└── dev_docs/                      # Development documentation
```

## ✅ Production Status

**TinyTroupe API v1.0 - PRODUCTION READY**

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

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- OpenAI API key

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure API environment**:
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your OpenAI API key
```

3. **Install Python dependencies**:
```bash
cd apps/api && pip install -r requirements.txt && cd ../..
```

4. **Start development environment**:
```bash
# Option 1: Use convenience script
./tools/scripts/start-dev.sh

# Option 2: Start services manually
nx run-many --target=serve --projects=api,web --parallel
```

5. **Access applications**:
   - **API**: http://localhost:8000 (with /docs for OpenAPI)
   - **Frontend**: http://localhost:3000

## 🎯 What You Can Test

The system provides comprehensive testing capabilities for TinyTroupe functionality:

### **API Testing Interface (Frontend)**
- **Persona Management**: Load agents, create demographic samples, apply fragments
- **Market Research**: Product evaluation, consumer insights, brainstorming
- **Simulations**: Focus groups, individual interactions, social simulations
- **Content Enhancement**: AI-powered content enrichment and styling
- **Document Creation**: TinyWordProcessor integration
- **Real-time API monitoring**: Health checks and response inspection

### **Production Features**
- **Session Isolation**: Each simulation gets its own cache and agent instances
- **Concurrent Simulations**: Multiple users can run simulations simultaneously
- **Results Analytics**: Statistical analysis, sentiment distribution, insights extraction
- **Agent Specifications**: Load from 3 pre-configured personas (Lisa, Oscar, Marcos)
- **Population Generation**: Bulk generate up to 1000 agents with demographic controls

## 🧪 Development

### Key Commands

```bash
# Start both API and web app
nx run-many --target=serve --projects=api,web --parallel

# Build everything
nx run-many --target=build --projects=api,web

# Run tests
nx run-many --target=test --projects=api,web

# Start individual services
nx serve api        # Just the API
nx serve web        # Just the frontend
```

### API Development
- Modify `/apps/api/main.py` for API changes
- Configuration in `/apps/api/.env`
- Auto-reload enabled for development

### Frontend Development  
- Pages in `/apps/web/src/app/`
- Uses TypeScript API client from `/libs/api-client/`
- Hot reload enabled

## 📖 Documentation

- **[TinyTroupe API v1.0 Documentation](./apps/api/docs/TinyTroupe_API_Core_v1_Documentation.md)** - Complete API reference with examples
- **[API Testing Log](./apps/api/dev_docs/API_Testing_Log.md)** - Testing results and validation
- **[Frontend Implementation Analysis](./apps/web/Frontend_Implementation_Analysis.md)** - UI/UX architecture details
- [Development Setup Guide](./DEV_SETUP.md) - Detailed setup instructions
- [API Interactive Docs](http://localhost:8000/docs) - OpenAPI specification (when running)
- [Original TinyTroupe Docs](./packages/tinytroupe-original/docs/) - Original documentation

## 🏭 Architecture

### **TinyTroupe API v1.0 (Production Ready)**
- **FastAPI Backend**: Clean modular architecture following DRY/SRP principles
- **Session Management**: Isolated caches per simulation (`cache/sessions/sim_<uuid>.json`)
- **Agent Management**: Unique agent instances per session to prevent conflicts
- **Results Processing**: Full TinyTroupe pattern compatibility with statistical analysis
- **Concurrent Support**: Multiple users can run simulations simultaneously

### **Monorepo Structure**
This monorepo uses Nx to manage:
- **Multi-language support**: Python (FastAPI) + TypeScript (Next.js)
- **Shared libraries**: TypeScript API client with type safety
- **Development workflow**: Unified commands for all services
- **Code organization**: Clean separation between apps and libraries

The original TinyTroupe codebase is preserved in `packages/tinytroupe-original/` for reference and to maintain access to examples, tests, and documentation.

### **API Architecture**
```
apps/api/src/
├── models/          # Pydantic schemas organized by domain
├── services/        # Business logic layer
├── routers/         # API endpoint handlers  
├── core/            # Core infrastructure (config, dependencies)
└── utils/           # Utilities (logging, error handling)
```

## 🚀 Production Features

### **Available APIs**
- **Persona Management**: Load agents, create demographic samples, apply personality fragments
- **Market Research**: Product evaluation, advertisement testing, brainstorming sessions
- **Simulations**: Focus groups, individual interactions, social simulations
- **Content Enhancement**: AI-powered content enrichment and styling
- **Document Creation**: TinyWordProcessor integration for document generation
- **Population Generation**: Bulk generate up to 1000 agents with demographic controls
- **Research Tools**: Customer interviews, competitive analysis, consumer insights

### **Session Management & Caching**
```
cache/sessions/sim_<uuid>.json  # Isolated per simulation
agents: Lisa Carter_a1b2c3d4    # Unique names per session
```

**Concurrency Support**: Multiple users can run simulations simultaneously without conflicts.
**Cache Cleanup**: Session caches are automatically managed and can be cleaned up via the cache service.

## 🔧 Next Steps

1. ✅ **API is Production Ready** - All core functionality working
2. Extend frontend workflow builder features
3. Add advanced analytics and reporting
4. Implement real-time monitoring dashboard
5. Deploy to production environment

---

**Built with ❤️ using FastAPI, Next.js, and TinyTroupe**  
**Purpose**: Production-ready AI agent simulation platform for market research and consumer insights.