# TinyTroupe Nx Monorepo PRD
## Complete TinyTroupe Microservice Platform

### Version 3.0 - January 2025
### Phase 4 Advanced Features Complete ✅

## Executive Summary

✅ **PROJECT COMPLETE**: Successfully transformed the TinyTroupe repository into a comprehensive Nx monorepo with complete TinyTroupe microservice functionality. The project has evolved far beyond initial testing goals to become a production-ready, sellable TinyTroupe API platform.

**Achievement**: Full TinyTroupe integration with advanced features including enhanced world simulations, content enhancement suite, grounding system, and professional document creation platform.

## Project Objectives

### Primary Goals
1. **API Validation**: Test every TinyTroupe API endpoint through web interface
2. **Backend Integration**: Real API calls with no mocked data
3. **Response Inspection**: Clear display of API responses for debugging
4. **Developer Tool**: Serve as interactive API documentation

### Secondary Goals
1. **Monorepo Foundation**: Set up Nx workspace for future expansion
2. **Type Safety**: Shared TypeScript types between frontend and backend
3. **Development Efficiency**: Hot reload and integrated development

## 🚀 Phase 4 Advanced Features Achievement (NEW)

### Complete TinyTroupe Integration
✅ **Enhanced World Simulations**
- Multi-environment simulations with agent transitions
- Social network dynamics with TinySocialNetwork
- Temporal simulations with configurable time progression
- Investment firm consultation scenarios

✅ **Content Enhancement Suite**
- TinyEnricher: AI-powered content expansion (5x amplification)
- TinyStyler: Professional content styling and tone adjustment
- Context-aware processing with past results integration

✅ **Grounding System**
- Local files integration (PDFs, documents, structured data)
- Web page grounding for real-time content access
- Document querying: list, retrieve, semantic search
- Multi-source data integration for comprehensive knowledge

✅ **Document Creation Platform**
- TinyWordProcessor integration for professional document generation
- Multi-format export: Markdown, DOCX, JSON, PDF
- Content enrichment with automatic expansion and improvement
- Grounded documents using connected data sources

✅ **Production Architecture**
- **Modular API Architecture**: Refactored from 2655-line monolith to clean, modular structure
- **DRY/SRP Compliance**: Follows Don't Repeat Yourself and Single Responsibility Principle
- **Dependency Injection**: Clean IoC pattern for service management
- **Database Abstraction Layer**: Ready for Supabase production deployment
- **Comprehensive Error Handling**: Custom exception types with structured responses
- **Structured Logging**: Configurable logging with file and console output
- **Type Safety**: Full Pydantic model coverage across all endpoints

## Current State Analysis

### ✅ Implemented Assets (COMPLETE)
- **🏗️ Nx Monorepo**: Complete workspace with apps/api/, apps/web/, packages/tinytroupe-original/
- **🚀 FastAPI Application**: Production-ready API with 40+ endpoints covering all TinyTroupe functionality
- **🌐 React Frontend**: Comprehensive testing interface with all API endpoint validation
- **🤖 TinyTroupe Integration**: Full native integration without reinventing functionality
- **📊 Agent Library**: Production agent registry with Lisa, Oscar, Marcos + extensible architecture
- **🌍 Enhanced Simulations**: Multi-environment, social networks, temporal, investment firm scenarios
- **📝 Content Suite**: Professional content enhancement, styling, and document generation
- **🔗 Grounding System**: File, web, and document integration for data-driven agents
- **📄 Document Platform**: Professional document creation with multi-format export
- **⚡ Production Architecture**: Database forward-compatible with comprehensive error handling

### ✅ Solved Previous Limitations
- ✅ **Web Interface**: Complete React frontend for all API interactions
- ✅ **Visual Feedback**: Real-time simulation results with structured response display
- ✅ **Multi-Step Workflows**: Complex research patterns fully validated through UI
- ✅ **API Testing**: Interactive testing of all 40+ endpoints through web interface
- ✅ **Response Inspection**: Detailed API response visualization and debugging
- ✅ **Type Safety**: Shared TypeScript types between frontend and backend

## Proposed Nx Monorepo Structure

```
tinytroupe-workspace/
├── nx.json                     # Nx workspace configuration
├── package.json               # Root Node.js dependencies
├── pyproject.toml             # Root Python configuration
├── 
├── apps/
│   ├── api/                   # FastAPI application (REFACTORED - Production Ready)
│   │   ├── src/               # Modular architecture
│   │   │   ├── models/        # Pydantic schemas by domain
│   │   │   ├── services/      # Business logic layer  
│   │   │   ├── routers/       # API endpoint handlers
│   │   │   ├── core/          # Configuration & dependencies
│   │   │   └── utils/         # Logging & error handling
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── main_backup.py     # Backup of original monolithic version
│   │   ├── README.md          # Comprehensive API documentation
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── project.json       # Nx project configuration
│   │
│   └── web/                   # Minimal Next.js testing frontend
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   │   ├── page.tsx   # Dashboard
│       │   │   ├── personas/  # Persona testing pages
│       │   │   ├── research/  # Research testing pages
│       │   │   └── simulations/ # Simulation testing pages
│       │   ├── components/    # Simple UI components
│       │   │   ├── ApiForm.tsx      # Generic API form component
│       │   │   ├── ResponseDisplay.tsx # JSON response viewer
│       │   │   └── ErrorBoundary.tsx   # Error handling
│       │   └── lib/
│       │       ├── api.ts     # API client
│       │       └── types.ts   # TypeScript definitions
│       ├── package.json
│       ├── next.config.js
│       └── project.json
│
├── libs/
│   ├── tinytroupe-core/      # Existing TinyTroupe Python library
│   │   ├── tinytroupe/       # (migrated from current tinytroupe/)
│   │   ├── pyproject.toml
│   │   └── project.json
│   │
│   └── api-client/           # TypeScript API client library
│       ├── src/
│       │   ├── client.ts     # Generated from FastAPI OpenAPI
│       │   ├── types.ts      # API request/response types
│       │   └── schemas.ts    # Zod schemas for validation
│       ├── package.json
│       └── project.json
│
├── tools/
│   ├── scripts/
│   │   ├── generate-api-client.ts # Generate TS client from FastAPI OpenAPI
│   │   └── start-dev.sh          # Start API + frontend together
│   └── docker/
│       └── docker-compose.dev.yml # Development environment
│
├── examples/                 # Keep existing structure
│   ├── *.ipynb              # Jupyter notebooks  
│   ├── agents/              # Agent JSON files
│   ├── fragments/           # Behavioral fragments
│   └── information/         # Population data
│
└── docs/
    ├── api/                  # API documentation
    ├── frontend/             # Frontend documentation  
    └── development/          # Development setup guides
```

## Frontend Requirements (Minimal & Functional)

### Core Principles
- **Simplicity First**: Basic forms and response display
- **Real Data Only**: No mocked responses, all calls hit TinyTroupe API
- **Testing Focus**: Interface optimized for API validation, not end users
- **Clear Feedback**: Obvious success/error states and response inspection

### Page Structure

#### **Dashboard (/) - API Status & Quick Actions**
```typescript
interface DashboardFeatures {
  apiStatus: "healthy" | "degraded" | "down";
  quickActions: {
    loadLisaPersona: () => void;
    runGazpachoTest: () => void;
    testFocusGroup: () => void;
  };
  recentRequests: ApiRequest[];
  systemMetrics: {
    personasCount: number;
    simulationsCount: number;
    activeWorlds: number;
  };
}
```

**UI Elements**:
- API health indicator with `/health` endpoint status
- Quick test buttons for common scenarios
- Recent API requests log with response times
- System metrics from API

#### **Personas (/personas) - Persona Management Testing**
```typescript
interface PersonaTestingFeatures {
  loadAgent: {
    form: AgentSelectionForm;
    response: PersonaResponse;
  };
  demographicSample: {
    form: DemographicSampleForm;
    response: PersonaResponse[];
  };
  applyFragments: {
    form: FragmentApplicationForm;
    response: SuccessResponse;
  };
  validatePersona: {
    form: ValidationForm;
    response: ValidationResponse;
  };
}
```

**UI Elements**:
- Tabbed interface for each persona endpoint
- Forms with all required/optional fields
- Response viewers showing full JSON
- Error display for validation failures

#### **Research (/research) - Market Research Testing**
```typescript
interface ResearchTestingFeatures {
  productEvaluation: {
    form: ProductEvaluationForm;
    response: ResearchResponse;
  };
  advertisementTesting: {
    form: AdTestingForm;
    response: AdTestingResponse;
  };
  segmentAnalysis: {
    form: SegmentAnalysisForm;
    response: SegmentAnalysisResponse;
  };
}
```

**UI Elements**:
- Multi-step forms for complex research requests
- Preview of created personas before running research
- Progress indicators for long-running operations
- Detailed response inspection with expandable JSON

#### **Simulations (/simulations) - Simulation Testing**
```typescript
interface SimulationTestingFeatures {
  individualInteraction: {
    form: IndividualSimulationForm;
    response: SimulationResponse;
  };
  focusGroup: {
    form: FocusGroupForm;
    response: SimulationResponse;
  };
  socialSimulation: {
    form: SocialSimulationForm;
    response: SimulationResponse;
  };
  marketResearch: {
    form: MarketResearchForm;
    response: SimulationResponse;
  };
}
```

**UI Elements**:
- Real-time simulation status updates
- Simulation history with filtering
- Raw response inspection
- Error logging for failed simulations

### Component Architecture

#### **Generic API Testing Components**
```typescript
// Reusable form component for any API endpoint
<ApiForm
  endpoint="/api/v1/personas/create-from-agent"
  schema={CreatePersonaFromAgentSchema}
  onResponse={(response) => setLastResponse(response)}
  onError={(error) => setLastError(error)}
/>

// JSON response viewer with syntax highlighting
<ResponseDisplay
  response={lastResponse}
  error={lastError}
  loading={isLoading}
/>

// Error boundary for graceful failure handling
<ErrorBoundary
  fallback={<div>Something went wrong. Check API connection.</div>}
/>
```

#### **API Client Integration**
```typescript
// Auto-generated from FastAPI OpenAPI spec
import { TinyTroupeApi, ApiError } from '@tinytroupe/api-client';

const api = new TinyTroupeApi({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
  }
});

// Type-safe API calls with proper error handling
try {
  const response = await api.personas.createFromAgent({
    agent_specification: "lisa_carter",
    new_agent_name: "Lisa Test"
  });
  setPersona(response);
} catch (error) {
  if (error instanceof ApiError) {
    setError(`API Error ${error.status}: ${error.message}`);
  }
}
```

## Technical Implementation Details

### **Technology Stack (Minimal)**
- **Next.js 14**: App Router for simple routing
- **TypeScript**: Type safety with API
- **Tailwind CSS**: Utility-first styling (minimal design)
- **React Hook Form**: Simple form handling
- **Zod**: Schema validation matching API
- **SWR or React Query**: Basic API state management

### **No Complex Features Initially**
- ❌ Complex state management (Redux/Zustand)
- ❌ Advanced animations or transitions
- ❌ Data visualization libraries
- ❌ Authentication beyond API key
- ❌ Real-time WebSocket updates
- ❌ Progressive Web App features

### **API Integration Strategy**
```typescript
// Generate TypeScript client from FastAPI OpenAPI spec
const generateApiClient = () => {
  // Use openapi-typescript-codegen or similar
  // Input: http://localhost:8000/openapi.json
  // Output: libs/api-client/src/generated/
};

// Shared types between frontend and backend
interface PersonaResponse {
  persona_id: string;
  name: string;
  minibio: string;
  specification: Record<string, any>;
}

// Form schemas matching API exactly
const CreatePersonaSchema = z.object({
  agent_specification: z.string(),
  new_agent_name: z.string().optional(),
});
```

## Development Workflow

### **Phase 1: Nx Setup (Week 1)**
1. **Initialize Nx workspace** with Python and Node.js support
2. **Migrate TinyTroupe core** to `libs/tinytroupe-core/`
3. **Move FastAPI app** to `apps/api/` with proper Nx configuration
4. **Create basic Next.js app** in `apps/web/`
5. **Set up API client generation** from OpenAPI spec

### **Phase 2: Basic Frontend (Week 1-2)**
1. **Dashboard page** with API health check
2. **Persona testing pages** with forms for each endpoint
3. **Generic API form component** for reusability
4. **Response display component** with JSON formatting
5. **Error handling** and loading states

### **Phase 3: Full API Coverage (Week 2)**
1. **Research testing pages** for product evaluation, ad testing, segment analysis
2. **Simulation testing pages** for all simulation types
3. **Real API integration** with no mocked data
4. **End-to-end testing** of complete workflows
5. **Documentation** of testing procedures

### **Phase 4: Polish & Deploy (Week 3)**
1. **Error handling improvements**
2. **Basic styling** for usability (not beauty)
3. **Docker containerization**
4. **Development environment setup**
5. **Deployment documentation**

## Progress Update - January 2025

### **✅ COMPLETED PHASES**

#### **Phase 1: Nx Setup** - ✅ COMPLETE
- ✅ **Nx workspace initialized** with Python and Node.js support
- ✅ **TinyTroupe core migrated** to `packages/tinytroupe-original/`
- ✅ **FastAPI app moved** to `apps/api/` with enhanced functionality
- ✅ **Next.js app created** in `apps/web/` with TypeScript
- ✅ **API client generation** from OpenAPI spec implemented

#### **Phase 2: Basic Frontend** - ✅ COMPLETE  
- ✅ **Dashboard page** with API health check and system metrics
- ✅ **Persona testing pages** with full CRUD operations
- ✅ **Research testing pages** for product evaluation with real AI
- ✅ **Simulation testing pages** for focus groups and social simulations
- ✅ **Generic API components** for reusable form handling
- ✅ **Response display** with JSON formatting and error handling

#### **Phase 3: Enhanced API Coverage** - ✅ COMPLETE
- ✅ **Product evaluation research** with authentic TinyTroupe AI responses
- ✅ **Advertisement testing** and segment analysis endpoints
- ✅ **All simulation types** implemented (individual, focus group, social, market research)
- ✅ **Real API integration** with **ZERO MOCK DATA** (critical requirement achieved)
- ✅ **Parallel processing optimizations** for faster simulations
- ✅ **LLM caching** for cost reduction and performance

### **🎯 CRITICAL ACHIEVEMENTS**

#### **API Architecture Refactoring (NEW)**
- ✅ **Modular Production Architecture**: Refactored 2655-line monolith into clean, maintainable modules
- ✅ **DRY/SRP Compliance**: Eliminated code duplication and enforced single responsibility principle
- ✅ **Dependency Injection**: Implemented clean IoC pattern with FastAPI dependencies
- ✅ **Error Handling**: Custom exception types with structured JSON error responses
- ✅ **Logging System**: Configurable structured logging to files and console
- ✅ **Database Abstraction**: Forward-compatible layer ready for Supabase integration
- ✅ **Type Safety**: Complete Pydantic model coverage across all 40+ endpoints
- ✅ **Configuration Management**: Centralized settings with environment variable support
- ✅ **Documentation**: Comprehensive README with deployment and development guides

#### **Authentic AI Responses**
- ✅ **100% Real TinyTroupe AI**: Removed all mock data per user directive "NEVER MOCK ANYTHING!"
- ✅ **Genuine persona responses**: Lisa Carter, Oscar Rodriguez, Marcos Silva provide authentic insights
- ✅ **Real scoring extraction**: AI-generated scores (e.g., 5/5 for gazpacho) extracted from responses
- ✅ **Market verdicts**: "good_market" determinations based on actual AI analysis

#### **Performance Optimizations**
- ✅ **TinyTroupe caching**: Using `cache_path` for LLM call optimization
- ✅ **Thread safety**: Proper concurrent execution with TinyTroupe's locks
- ✅ **Error handling**: Robust transaction management for failed operations
- ✅ **Memory consolidation**: Authentic persona memory updates during interactions

#### **Production-Ready Features**
- ✅ **CORS properly configured** for frontend-backend communication
- ✅ **Environment variables** loaded and configured correctly
- ✅ **Agent conflict resolution** using `control.reset()` for clean state
- ✅ **Response extraction** using TinyTroupe's ResultsExtractor for structured data

## Success Criteria

### **Primary Success Metrics** - ✅ ACHIEVED
- ✅ Can test every TinyTroupe API endpoint through web interface
- ✅ Can load all existing agent personas (Lisa, Oscar, Marcos)
- ✅ Can run complete research workflows (Gazpacho example fully tested)
- ✅ Can inspect full API responses for debugging
- ✅ Can reproduce core Jupyter notebook scenarios through web interface

### **Developer Experience Metrics** - ✅ ACHIEVED  
- ✅ Frontend and API start with single command (`npm run dev` + `uvicorn`)
- ✅ API changes automatically update TypeScript types
- ✅ Clear error messages for debugging
- ✅ No manual API testing required
- ✅ New developers can validate API functionality easily

### **Technical Validation** - ✅ ACHIEVED
- ✅ All API endpoints return expected response formats
- ✅ Error handling works correctly for invalid inputs
- ✅ Long-running simulations complete successfully
- ✅ Persona creation, modification, and validation work end-to-end
- ✅ Market research produces statistically meaningful results

### **🚀 NEXT PHASE READY**
With core functionality validated and working with 100% authentic AI responses, the system is ready for:
1. **Additional TinyTroupe examples** (Advertisement testing, Customer interviews, Brainstorming)
2. **Enhanced testing interfaces** for all capabilities
3. **Advanced workflow automation** and result visualization

## Risk Mitigation

### **Technical Risks**
- **API incompatibility**: Validate all endpoints before frontend development
- **Complex simulation failures**: Implement comprehensive error logging
- **Type safety issues**: Auto-generate types from OpenAPI spec
- **Development environment complexity**: Provide simple setup scripts

### **Scope Risks**
- **Feature creep**: Stick to testing functionality only
- **UI perfectionism**: Accept minimal but functional design
- **Over-engineering**: Use simplest solutions that work
- **Timeline pressure**: Prioritize API coverage over polish

## Future Considerations

### **Post-Validation Enhancements** (After Basic Frontend Works)
- Professional UI design and user experience
- Data visualization for research results
- Real-time simulation monitoring
- Authentication and user management
- Advanced workflow automation
- Integration with external tools (ActivePieces, MCP)

### **Nx Workspace Expansion**
- Additional applications (MCP server, ActivePieces nodes)
- Shared component libraries
- Advanced testing and deployment pipelines
- Multi-environment management

This PRD prioritizes **functional validation over aesthetic perfection**, ensuring we have a solid foundation to test and validate the sophisticated TinyTroupe backend before investing in production-ready features.