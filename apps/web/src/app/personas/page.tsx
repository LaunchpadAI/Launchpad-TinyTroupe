'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TinyTroupeApiClient, CreatePersonaFromAgentSchema } from '@tinytroupe/api-client';
import Link from 'next/link';

type CreatePersonaFormData = {
  agent_specification: string;
  new_agent_name?: string;
};

export default function PersonasPage() {
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Persona Management</h1>
              <p className="mt-2 text-gray-600">Test persona creation and management endpoints</p>
            </div>
            <Link 
              href="/"
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
      </main>
    </div>
  );
}