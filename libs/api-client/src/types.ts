// Core TinyTroupe API Types
export interface PersonaResponse {
  persona_id: string;
  name: string;
  minibio: string;
  specification: Record<string, any>;
}

export interface CreatePersonaFromAgentRequest {
  agent_specification: string;
  new_agent_name?: string;
}

export interface CreateDemographicSampleRequest {
  population_source: string;
  population_size: number;
  segments?: string[];
}

export interface ProductEvaluationRequest {
  research_name: string;
  product: {
    name: string;
    description: string;
    category?: string;
    price_range?: string;
  };
  target_personas: string[];
  questions: string[];
  context: Record<string, any>;
}

export interface SimulationRequest {
  simulation_type: 'individual_interaction' | 'focus_group' | 'social_simulation' | 'market_research';
  participants: {
    mode: 'existing_agents' | 'factory_generated' | 'demographic_sample';
    specifications: (string | Record<string, any>)[];
  };
  interaction_config: {
    allow_cross_communication?: boolean;
    rounds?: number;
    enable_memory?: boolean;
  };
  stimulus: {
    type: string;
    content: string | string[];
  };
  extraction_config: {
    objective: string;
    fields: string[];
    output_format?: 'structured' | 'conversation' | 'creative';
  };
}

export interface SimulationResponse {
  simulation_id: string;
  status: 'completed' | 'failed' | 'running';
  results?: Record<string, any>;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}