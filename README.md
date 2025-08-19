# TinyTroupe Nx Monorepo

A modern monorepo setup for TinyTroupe with FastAPI backend and Next.js frontend for testing and development.

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

The frontend provides a minimal testing interface for all TinyTroupe API endpoints:

- **Persona Management**: Load agents, create demographic samples, apply fragments
- **Market Research**: Product evaluation, consumer insights
- **Simulations**: Focus groups, individual interactions
- **Real-time API monitoring**: Health checks and response inspection

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

- [Development Setup Guide](./DEV_SETUP.md) - Detailed setup instructions
- [API Documentation](http://localhost:8000/docs) - OpenAPI specification (when running)
- [Original TinyTroupe Docs](./packages/tinytroupe-original/docs/) - Original documentation

## 🏭 Architecture

This monorepo uses Nx to manage:
- **Multi-language support**: Python (FastAPI) + TypeScript (Next.js)
- **Shared libraries**: TypeScript API client with type safety
- **Development workflow**: Unified commands for all services
- **Code organization**: Clean separation between apps and libraries

The original TinyTroupe codebase is preserved in `packages/tinytroupe-original/` for reference and to maintain access to examples, tests, and documentation.

## 🔧 Next Steps

1. Test API endpoints through the web interface
2. Add more sophisticated frontend features
3. Extend API functionality
4. Add comprehensive test coverage
5. Deploy to production environment

---

**Purpose**: This setup allows you to test TinyTroupe functionality through a modern web interface while maintaining the full capabilities of the original library.