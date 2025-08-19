# TinyTroupe Nx Monorepo - Development Setup

## Quick Start

1. **Install dependencies**:
```bash
npm install
```

2. **Set up API environment**:
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your OpenAI API key
```

3. **Install Python dependencies**:
```bash
cd apps/api && pip install -r requirements.txt
```

4. **Start development environment**:
```bash
# Option 1: Use the convenience script
./tools/scripts/start-dev.sh

# Option 2: Start manually
nx run-many --target=serve --projects=api,web --parallel
```

5. **Access the applications**:
   - **API**: http://localhost:8000 (FastAPI with auto-docs at /docs)
   - **Web**: http://localhost:3000 (Next.js testing frontend)

## Project Structure

```
tinytroupe-workspace/
├── apps/
│   ├── api/                   # FastAPI TinyTroupe service
│   │   ├── main.py           # API implementation
│   │   ├── requirements.txt   # Python dependencies
│   │   └── .env              # Environment variables
│   └── web/                  # Next.js testing frontend
│       ├── src/app/          # App router pages
│       ├── package.json      # Frontend dependencies
│       └── tsconfig.json     # TypeScript config
├── libs/
│   ├── tinytroupe-core/      # Core TinyTroupe library (symlink)
│   └── api-client/           # TypeScript API client
├── tools/scripts/            # Development utilities
└── examples/                 # Original TinyTroupe examples
```

## Key Development Commands

### Full Environment
```bash
# Start both API and web app
nx run-many --target=serve --projects=api,web --parallel

# Build everything
nx run-many --target=build --projects=api,web

# Run tests
nx run-many --target=test --projects=api,web
```

### Individual Services
```bash
# Start just the API
nx serve api
# or: cd apps/api && uvicorn main:app --reload

# Start just the web app  
nx serve web
# or: cd apps/web && npm run dev

# Build API client library
nx build api-client
```

### Development Workflow
```bash
# Check API health
curl http://localhost:8000/health

# View API documentation
open http://localhost:8000/docs

# Test frontend
open http://localhost:3000
```

## Environment Configuration

### API Environment (apps/api/.env)
```bash
# Required
OPENAI_API_KEY=sk-your-openai-key-here

# TinyTroupe paths (already configured)
TINYTROUPE_AGENTS_PATH=../../examples/agents
TINYTROUPE_FRAGMENTS_PATH=../../examples/fragments
TINYTROUPE_POPULATIONS_PATH=../../examples/information/populations

# Optional
DEBUG=true
LOG_LEVEL=INFO
```

### Web Environment
The frontend automatically connects to `http://localhost:8000` for API calls.

## Testing the Setup

### 1. Test API Health
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","version":"2.0.0",...}
```

### 2. Test Persona Creation
```bash
curl -X POST http://localhost:8000/api/v1/personas/create-from-agent \
  -H "Content-Type: application/json" \
  -d '{"agent_specification": "lisa_carter", "new_agent_name": "Lisa Test"}'
```

### 3. Test Frontend Integration
1. Go to http://localhost:3000
2. Check that API status shows "healthy"
3. Click on "Persona Management"
4. Try loading Lisa Carter agent

## Common Issues

### API Issues
- **Import errors**: Make sure you're in the correct directory and TinyTroupe dependencies are installed
- **OpenAI errors**: Check your API key in `apps/api/.env`
- **Port conflicts**: API runs on 8000, web on 3000

### Frontend Issues
- **Build errors**: Run `npm install` in both root and `apps/web/`
- **TypeScript errors**: Check that `@tinytroupe/api-client` path is correct

### Development Tips
- Use the browser dev tools to inspect API calls from the frontend
- Check `apps/api/.env` if TinyTroupe can't find agent files
- The API auto-reloads on changes, frontend has hot reload

## What You Can Test

This minimal frontend allows you to test:

### ✅ Currently Implemented
- **API Health**: Dashboard shows connection status
- **Persona Loading**: Load existing agents (Lisa, Oscar, Marcos)
- **Response Inspection**: View full JSON responses

### 🚧 Coming Next  
- **Demographic Sampling**: Generate personas from population data
- **Fragment Application**: Apply behavioral modifications
- **Product Evaluation**: Test market research workflows
- **Focus Groups**: Test simulation capabilities

## Next Steps

Once the basic setup works:
1. Add more persona management features
2. Build research testing interfaces
3. Add simulation monitoring
4. Create result visualization

The goal is to validate that all TinyTroupe API endpoints work correctly through this simple web interface before building production-ready features.