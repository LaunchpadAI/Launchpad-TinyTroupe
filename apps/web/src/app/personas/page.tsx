'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TinyTroupeApiClient, CreatePersonaFromAgentSchema } from '@tinytroupe/api-client';
import Link from 'next/link';
import clsx from 'clsx';
import PopulationBuilder from '../../components/PopulationBuilder';

type CreatePersonaFormData = {
  agent_specification: string;
  new_agent_name?: string;
};

export default function PersonasPage() {
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'workflow' | 'developer'>('workflow');
  const [populationData, setPopulationData] = useState<any[]>([]);

  const client = new TinyTroupeApiClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePersonaFormData>({
    resolver: zodResolver(CreatePersonaFromAgentSchema),
  });

  const onSubmit = async (data: CreatePersonaFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await client.createPersonaFromAgent(data);
      setLastResponse(response);
      console.log('Persona created:', response);
    } catch (err: any) {
      setError(err.message || 'Failed to create persona');
      console.error('Error creating persona:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLisaExample = () => {
    reset({
      agent_specification: 'lisa',
      new_agent_name: 'Lisa Test',
    });
  };

  const handlePopulationChange = (population: any[]) => {
    setPopulationData(population);
    console.log('Population updated:', population);
    // TODO: Integrate with API to create bulk personas
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Persona Management</h1>
              <p className="mt-2 text-gray-600">Create individual personas or build large populations</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setMode('workflow')}
                  className={clsx(
                    'px-3 py-2 rounded-md text-sm font-medium',
                    mode === 'workflow' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  👥 Population Builder
                </button>
                <button 
                  onClick={() => setMode('developer')}
                  className={clsx(
                    'px-3 py-2 rounded-md text-sm font-medium',
                    mode === 'developer' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  🔧 API Testing
                </button>
              </div>
              <Link 
                href="/"
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {mode === 'workflow' ? (
          <PopulationBuilderInterface 
            onPopulationChange={handlePopulationChange}
            populationData={populationData}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Load Agent as Persona
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Specification
                  </label>
                  <select
                    {...register('agent_specification')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Select an agent...</option>
                    <option value="lisa">Lisa Carter (Data Scientist)</option>
                    <option value="oscar">Oscar (Architect)</option>
                    <option value="marcos">Marcos (Physician)</option>
                  </select>
                  {errors.agent_specification && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.agent_specification.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Name (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('new_agent_name')}
                    placeholder="e.g., Lisa Test"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  {errors.new_agent_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.new_agent_name.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium"
                  >
                    {isLoading ? 'Creating...' : 'Create Persona'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={loadLisaExample}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                  >
                    Load Lisa Example
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                  <div className="text-sm text-red-800">
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Response Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                API Response
              </h3>
              
              {lastResponse ? (
                <div className="space-y-4">
                  {/* Persona Summary */}
                  <div className="p-4 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-900">Persona Created</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>ID:</strong> {lastResponse.persona_id}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Name:</strong> {lastResponse.name}
                    </p>
                  </div>

                  {/* Mini Bio */}
                  {lastResponse.minibio && (
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Mini Biography</h4>
                      <p className="text-sm text-gray-700">{lastResponse.minibio}</p>
                    </div>
                  )}

                  {/* Raw JSON Response */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Raw JSON Response</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-xs overflow-auto max-h-96">
                      {JSON.stringify(lastResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Submit the form to see the API response here</p>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

// Population Builder Interface Component
function PopulationBuilderInterface({ 
  onPopulationChange, 
  populationData 
}: { 
  onPopulationChange: (population: any[]) => void;
  populationData: any[];
}) {
  return (
    <div className="space-y-8">
      {/* Population Builder */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Population Builder</h2>
          <p className="text-sm text-gray-600 mt-1">Create large-scale agent populations with demographic control</p>
        </div>
        <div className="p-6">
          <PopulationBuilder onChange={onPopulationChange} maxSize={1000} />
        </div>
      </div>

      {/* Generated Population Preview */}
      {populationData.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Generated Population ({populationData.length} agents)</h2>
            <p className="text-sm text-gray-600 mt-1">Preview of your generated agent population</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-auto">
              {populationData.slice(0, 12).map((agent, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm font-medium text-gray-900">Agent {index + 1}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    <div>Age: {agent.age_range}</div>
                    <div>Income: {agent.income_level}</div>
                    <div>Location: {agent.location}</div>
                    <div className="mt-1">
                      <span className="text-gray-500">Traits:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.personality_fragments.map((fragment: string) => (
                          <span key={fragment} className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                            {fragment.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {populationData.length > 12 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Showing first 12 of {populationData.length} generated agents
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                onClick={() => console.log('TODO: Generate personas from population')}
              >
                Generate {populationData.length} Personas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}