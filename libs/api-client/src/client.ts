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

  // Intervention Testing (Integration with v1 API pipeline)
  async createInterventionTest(data: {
    name: string;
    variants: Array<{
      id: string;
      name: string;
      content: string;
      weight: number;
    }>;
    participants: {
      mode: 'from_agent' | 'from_population';
      specifications: string[];
      population_size?: number;
    };
    targeting: {
      segments: string[];
      percentage: number;
    };
    timing: {
      delay_minutes: number;
      trigger_condition: string;
    };
    success_metrics: string[];
  }): Promise<{ intervention_id: string; status: string }> {
    // Create simulation for each variant
    const interventionId = `intervention_${Date.now()}`;
    const results = [];

    for (const variant of data.variants) {
      const simulationRequest: SimulationRequest = {
        simulation_type: 'focus_group',
        participants: data.participants,
        stimulus: {
          type: 'intervention',
          content: variant.content,
          context: {
            intervention_id: interventionId,
            variant_id: variant.id,
            variant_name: variant.name
          }
        },
        interaction_config: {
          allow_cross_communication: true,
          rounds: 3,
          enable_memory: true
        },
        extraction_config: {
          extract_results: true,
          extraction_objective: `Measure response to intervention: ${variant.name}. Extract metrics: ${data.success_metrics.join(', ')}`,
          fields: data.success_metrics,
          output_format: 'structured',
          statistical_analysis: true
        }
      };

      const result = await this.runSimulation(simulationRequest);
      results.push({
        variant_id: variant.id,
        variant_name: variant.name,
        simulation_id: result.simulation_id,
        ...result
      });
    }

    return {
      intervention_id: interventionId,
      status: 'completed',
      results: results
    };
  }

  // Population Generation (Integration with v1 API)
  async createPopulation(data: {
    name: string;
    size: number;
    demographic_template: string;
    segments: Array<{
      name: string;
      percentage: number;
      age_range: string;
      income_level: string;
      location: string;
      fragments: string[];
    }>;
  }): Promise<{ population_id: string; agents: any[] }> {
    return this.request('/api/v1/populations/bulk-generate', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        demographic_template: data.demographic_template,
        total_size: data.size,
        segments: data.segments.map(segment => ({
          name: segment.name,
          size: Math.floor((segment.percentage / 100) * data.size),
          age_range: segment.age_range,
          income_level: segment.income_level,
          location: segment.location,
          fragments: segment.fragments
        }))
      }),
    });
  }

  // Available Agents
  async getAvailableAgents(): Promise<{
    available_agents: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  }> {
    return this.request('/api/v1/agents/available');
  }

  // Available Fragments  
  async getAvailableFragments(): Promise<{
    available_fragments: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  }> {
    return this.request('/api/v1/populations/fragments/available');
  }
}