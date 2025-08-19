import { z } from 'zod';

// Zod schemas for form validation
export const CreatePersonaFromAgentSchema = z.object({
  agent_specification: z.string().min(1, 'Agent specification is required'),
  new_agent_name: z.string().optional(),
});

export const CreateDemographicSampleSchema = z.object({
  population_source: z.string().min(1, 'Population source is required'),
  population_size: z.number().min(1).max(200),
  segments: z.array(z.string()).optional(),
});

export const ProductEvaluationSchema = z.object({
  research_name: z.string().min(1, 'Research name is required'),
  product: z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(1, 'Product description is required'),
    category: z.string().optional(),
    price_range: z.string().optional(),
  }),
  target_personas: z.array(z.string()).min(1, 'At least one persona is required'),
  questions: z.array(z.string()).min(1, 'At least one question is required'),
  context: z.record(z.any()),
});

export const SimulationRequestSchema = z.object({
  simulation_type: z.enum(['individual_interaction', 'focus_group', 'social_simulation', 'market_research']),
  participants: z.object({
    mode: z.enum(['existing_agents', 'factory_generated', 'demographic_sample']),
    specifications: z.array(z.union([z.string(), z.record(z.any())])),
  }),
  interaction_config: z.object({
    allow_cross_communication: z.boolean().optional(),
    rounds: z.number().optional(),
    enable_memory: z.boolean().optional(),
  }),
  stimulus: z.object({
    type: z.string(),
    content: z.union([z.string(), z.array(z.string())]),
  }),
  extraction_config: z.object({
    objective: z.string(),
    fields: z.array(z.string()),
    output_format: z.enum(['structured', 'conversation', 'creative']).optional(),
  }),
});