import type {
  PersonaResponse,
  CreatePersonaFromAgentRequest,
  CreateDemographicSampleRequest,
  ProductEvaluationRequest,
  SimulationRequest,
  SimulationResponse,
  ApiError,
} from './types';

export class TinyTroupeApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: { baseUrl?: string; apiKey?: string } = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8000';
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.details = errorData;
        
        // Handle different error formats from FastAPI
        if (typeof errorData.detail === 'string') {
          error.message = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // FastAPI validation errors are arrays of objects
          error.message = errorData.detail
            .map((e: any) => e.msg || e.message || JSON.stringify(e))
            .join(', ');
        } else {
          error.message = errorData.detail || error.message;
        }
      } catch {
        // Use default error message if JSON parsing fails
      }

      throw error;
    }

    return response.json();
  }

  // Health check
  async health(): Promise<{ status: string; version: string }> {
    return this.request('/health');
  }

  // Persona Management
  async createPersonaFromAgent(
    data: CreatePersonaFromAgentRequest
  ): Promise<PersonaResponse> {
    return this.request('/api/v1/personas/create-from-agent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createDemographicSample(
    data: CreateDemographicSampleRequest
  ): Promise<PersonaResponse[]> {
    return this.request('/api/v1/personas/create-demographic-sample', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async applyFragments(data: {
    persona_id: string;
    fragments: string[];
  }): Promise<{ message: string }> {
    return this.request('/api/v1/personas/apply-fragments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async validatePersona(data: {
    persona_id: string;
    expectations: string;
    include_agent_spec?: boolean;
  }): Promise<{ score: number; justification: string; persona_id: string }> {
    return this.request('/api/v1/personas/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPersonaTemplates(): Promise<{
    predefined_agents: string[];
    agent_files: string[];
    fragment_files: string[];
  }> {
    return this.request('/api/v1/personas/templates');
  }

  // Research
  async productEvaluation(
    data: ProductEvaluationRequest
  ): Promise<{ research_id: string; status: string; results: any }> {
    return this.request('/api/v1/research/product-evaluation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Simulations
  async runSimulation(data: SimulationRequest): Promise<SimulationResponse> {
    const endpoint = `/api/v1/simulate/${data.simulation_type.replace('_', '-')}`;
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSimulationStatus(simulationId: string): Promise<SimulationResponse> {
    return this.request(`/api/v1/simulate/status/${simulationId}`);
  }
}