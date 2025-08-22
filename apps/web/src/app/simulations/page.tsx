'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TinyTroupeApiClient } from '@tinytroupe/api-client';
import clsx from 'clsx';
import InterventionDesigner from '../../components/InterventionDesigner';
import ResultsDashboard from '../../components/ResultsDashboard';

const simulationSchema = z.object({
  simulation_type: z.enum(['individual_interaction', 'focus_group', 'social_simulation']),
  scenario_description: z.string().min(10, 'Scenario description must be at least 10 characters'),
  participants: z.array(z.string()).min(1, 'At least one participant is required'),
  interaction_goal: z.string().min(5, 'Interaction goal is required'),
  duration_turns: z.number().min(1, 'At least 1 turn required').max(20, 'Maximum 20 turns'),
});

type SimulationForm = z.infer<typeof simulationSchema>;

export default function SimulationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const client = new TinyTroupeApiClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SimulationForm>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      simulation_type: 'focus_group',
      scenario_description: '',
      participants: ['lisa'],
      interaction_goal: '',
      duration_turns: 5
    }
  });

  const loadFocusGroupTemplate = () => {
    setValue('simulation_type', 'focus_group');
    setValue('scenario_description', 'A focus group discussion about a new bottled gazpacho product. Participants should share their opinions about the concept, pricing, and target market.');
    setValue('participants', ['lisa', 'oscar', 'marcos']);
    setValue('interaction_goal', 'Gather diverse opinions about the product concept and identify potential market opportunities and concerns.');
    setValue('duration_turns', 8);
  };

  const loadIndividualTemplate = () => {
    setValue('simulation_type', 'individual_interaction');
    setValue('scenario_description', 'A one-on-one customer interview about shopping preferences and product needs.');
    setValue('participants', ['lisa']);
    setValue('interaction_goal', 'Understand individual consumer behavior and preferences in detail.');
    setValue('duration_turns', 6);
  };

  const onSubmit = async (data: SimulationForm) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Convert frontend form data to API expected format
      const apiRequest = {
        simulation_type: data.simulation_type,
        participants: {
          mode: 'existing_agents' as const,
          specifications: data.participants
        },
        interaction_config: {
          allow_cross_communication: true,
          rounds: data.duration_turns,
          enable_memory: true,
          cache_simulation: false
        },
        stimulus: {
          type: 'scenario',
          content: data.scenario_description,
          context: {
            goal: data.interaction_goal
          }
        },
        extraction_config: {
          objective: data.interaction_goal || 'Extract participant responses and insights',
          fields: ['response', 'sentiment', 'key_points', 'decisions'],
          output_format: 'structured' as const,
          statistical_analysis: true
        }
      };
      
      const response = await client.runSimulation(apiRequest);

      setResults(response);
    } catch (err: any) {
      // Ensure error is always a string
      let errorMessage = 'Failed to run simulation';
      
      if (typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.message) {
        errorMessage = JSON.stringify(err.message);
      }
      
      setError(errorMessage);
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedParticipants = watch('participants') || [];
  const simulationType = watch('simulation_type');

  const toggleParticipant = (participant: string) => {
    const current = selectedParticipants;
    const updated = current.includes(participant)
      ? current.filter(p => p !== participant)
      : [...current, participant];
    setValue('participants', updated);
  };

  const maxParticipants = simulationType === 'individual_interaction' ? 1 : simulationType === 'focus_group' ? 6 : 8;

  const [mode, setMode] = useState<'workflow' | 'developer'>('workflow');
  const [interventionConfig, setInterventionConfig] = useState<any>(null);

  const handleInterventionCreate = (config: any) => {
    setInterventionConfig(config);
    console.log('Intervention created:', config);
    // TODO: Integrate with API
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Simulation Testing</h1>
              <p className="mt-2 text-gray-600">Test focus groups, individual interactions, and social simulations</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setMode('workflow')}
                  className={clsx(
                    'px-3 py-2 rounded-md text-sm font-medium',
                    mode === 'workflow' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  🎯 Workflow Builder
                </button>
                <button 
                  onClick={() => setMode('developer')}
                  className={clsx(
                    'px-3 py-2 rounded-md text-sm font-medium',
                    mode === 'developer' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  🔧 API Testing
                </button>
              </div>
              <Link href="/" className="text-blue-600 hover:text-blue-500">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {mode === 'workflow' ? (
          <WorkflowBuilderInterface 
            onInterventionCreate={handleInterventionCreate}
            interventionConfig={interventionConfig}
            results={results}
          />
        ) : (
          <DeveloperTestingInterface 
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            isLoading={isLoading}
            error={error}
            results={results}
            selectedParticipants={selectedParticipants}
            simulationType={simulationType}
            maxParticipants={maxParticipants}
            toggleParticipant={toggleParticipant}
            loadFocusGroupTemplate={loadFocusGroupTemplate}
            loadIndividualTemplate={loadIndividualTemplate}
          />
        )}
      </main>
    </div>
  );
}

// Workflow Builder Interface Component
function WorkflowBuilderInterface({ 
  onInterventionCreate, 
  interventionConfig, 
  results 
}: { 
  onInterventionCreate: (config: any) => void;
  interventionConfig: any;
  results: any;
}) {
  return (
    <div className="space-y-8">
      {/* Intervention Designer */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Intervention Testing Setup</h2>
          <p className="text-sm text-gray-600 mt-1">Design A/B tests to measure response differences</p>
        </div>
        <div className="p-6">
          <InterventionDesigner onCreateIntervention={onInterventionCreate} />
        </div>
      </div>

      {/* Intervention Preview */}
      {interventionConfig && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Active Intervention</h2>
          </div>
          <div className="p-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">{interventionConfig.name}</h3>
              <p className="text-sm text-purple-700 mt-1">
                {interventionConfig.variants.length} variants • {interventionConfig.targeting.segments.join(', ')} segments
              </p>
              <div className="mt-3 space-y-2">
                {interventionConfig.variants.map((variant: any, index: number) => (
                  <div key={variant.id} className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">{variant.name} ({variant.weight}%)</div>
                    <p className="text-sm text-gray-600">{variant.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Intervention Results</h2>
          </div>
          <div className="p-6">
            <ResultsDashboard results={results} />
          </div>
        </div>
      )}
    </div>
  );
}

// Developer Testing Interface Component (existing form)
function DeveloperTestingInterface({
  handleSubmit,
  onSubmit,
  register,
  errors,
  setValue,
  watch,
  isLoading,
  error,
  results,
  selectedParticipants,
  simulationType,
  maxParticipants,
  toggleParticipant,
  loadFocusGroupTemplate,
  loadIndividualTemplate
}: any) {
  return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Panel */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">API Testing - Simulation Setup</h2>
              <p className="text-sm text-gray-600 mt-1">Configure your simulation parameters (Developer Mode)</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Quick Templates */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-3">Quick Start Templates</h3>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={loadFocusGroupTemplate}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Focus Group
                  </button>
                  <button
                    type="button"
                    onClick={loadIndividualTemplate}
                    className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Individual Interview
                  </button>
                </div>
              </div>

              {/* Simulation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Simulation Type *
                </label>
                <select
                  {...register('simulation_type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="individual_interaction">Individual Interaction</option>
                  <option value="focus_group">Focus Group</option>
                  <option value="social_simulation">Social Simulation</option>
                </select>
              </div>

              {/* Scenario Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scenario Description *
                </label>
                <textarea
                  {...register('scenario_description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Describe the simulation scenario and context"
                />
                {errors.scenario_description && (
                  <p className="mt-1 text-sm text-red-600">
                    Scenario description is required
                  </p>
                )}
              </div>

              {/* Interaction Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interaction Goal *
                </label>
                <input
                  {...register('interaction_goal')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="What do you want to achieve with this simulation?"
                />
                {errors.interaction_goal && (
                  <p className="mt-1 text-sm text-red-600">
                    Interaction goal is required
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (conversation turns)
                </label>
                <input
                  type="number"
                  {...register('duration_turns', { valueAsNumber: true })}
                  min={1}
                  max={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {errors.duration_turns && (
                  <p className="mt-1 text-sm text-red-600">
                    Duration must be between 1 and 20 turns
                  </p>
                )}
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participants * (max {maxParticipants} for {simulationType.replace('_', ' ')})
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'lisa', name: 'Lisa Carter', description: 'Marketing professional, health-conscious' },
                    { id: 'oscar', name: 'Oscar Rodriguez', description: 'Architect, design-focused' },
                    { id: 'marcos', name: 'Marcos Silva', description: 'Physician, analytical thinker' }
                  ].map((participant) => (
                    <label 
                      key={participant.id} 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        selectedParticipants.includes(participant.id)
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      } ${
                        selectedParticipants.length >= maxParticipants && !selectedParticipants.includes(participant.id)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={() => toggleParticipant(participant.id)}
                        disabled={selectedParticipants.length >= maxParticipants && !selectedParticipants.includes(participant.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                        <div className="text-sm text-gray-500">{participant.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.participants && (
                  <p className="mt-1 text-sm text-red-600">
                    Please select at least one participant
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Running Simulation...' : 'Start Simulation'}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Simulation Results</h2>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Running simulation...</p>
                  <p className="text-sm text-gray-500">This may take 2-3 minutes</p>
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      Simulation Complete
                    </h3>
                    <p className="text-sm text-green-700">
                      Simulation ID: {results.simulation_id}
                    </p>
                    <p className="text-sm text-green-700">
                      Status: {results.status}
                    </p>
                    <p className="text-sm text-green-700">
                      Participants: {results.participants?.length || 'N/A'}
                    </p>
                  </div>

                  {results.interactions && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">Conversation Flow:</h4>
                      <div className="space-y-3 max-h-96 overflow-auto">
                        {results.interactions.map((interaction: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-900">
                                {interaction.speaker || `Turn ${index + 1}`}
                              </span>
                              <span className="text-xs text-gray-500">
                                {interaction.timestamp || `Step ${index + 1}`}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {interaction.message || interaction.content || JSON.stringify(interaction)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Full Response:</h4>
                    <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96 text-gray-900">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!results && !isLoading && !error && (
                <div className="text-center py-8 text-gray-500">
                  <p>Configure and run a simulation to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>
  );
}