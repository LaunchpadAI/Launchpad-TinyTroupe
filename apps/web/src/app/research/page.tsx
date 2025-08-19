'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TinyTroupeApiClient } from '@tinytroupe/api-client';

const productEvaluationSchema = z.object({
  research_name: z.string().min(1, 'Research name is required'),
  product_name: z.string().min(1, 'Product name is required'),
  product_description: z.string().min(10, 'Product description must be at least 10 characters'),
  evaluation_questions: z.string().min(10, 'Evaluation questions are required'),
  target_personas: z.array(z.string()).min(1, 'At least one persona is required'),
  context: z.string().min(5, 'Context is required'),
});

type ProductEvaluationForm = z.infer<typeof productEvaluationSchema>;

export default function ResearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const client = new TinyTroupeApiClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductEvaluationForm>({
    resolver: zodResolver(productEvaluationSchema),
    defaultValues: {
      research_name: '',
      product_name: '',
      product_description: '',
      evaluation_questions: '',
      target_personas: ['lisa'],
      context: ''
    }
  });

  const loadGazpachoTemplate = () => {
    setValue('research_name', 'Bottled Gazpacho Market Research');
    setValue('product_name', 'Bottled Gazpacho');
    setValue('product_description', 'A premium cold Spanish soup made with fresh vegetables, served in convenient bottles for on-the-go consumption. Perfect for hot weather and health-conscious consumers.');
    setValue('evaluation_questions', 'What do you think about this product?\nWould you buy it?\nWhat price would you expect to pay?\nWho do you think would be most interested in this product?');
    setValue('target_personas', ['lisa', 'oscar']);
    setValue('context', 'This is a market research study to evaluate consumer interest in a new bottled gazpacho product. We want to understand consumer preferences, pricing expectations, and target demographics.');
  };

  const onSubmit = async (data: ProductEvaluationForm) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await client.productEvaluation({
        research_name: data.research_name,
        product: {
          name: data.product_name,
          description: data.product_description
        },
        target_personas: data.target_personas,
        questions: data.evaluation_questions.split('\n').filter(q => q.trim()),
        context: {
          description: data.context,
          evaluation_scale: {
            min: 1,
            max: 10,
            description: "1 = Very Poor, 10 = Excellent"
          }
        }
      });

      setResults(response);
    } catch (err: any) {
      console.error('Product evaluation error:', err);
      if (err.details && Array.isArray(err.details)) {
        setError(err.details.map((detail: any) => `${detail.loc?.join('.')}: ${detail.msg}`).join(', '));
      } else {
        setError(err.message || 'Failed to run product evaluation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPersonas = watch('target_personas') || [];

  const togglePersona = (persona: string) => {
    const current = selectedPersonas;
    const updated = current.includes(persona)
      ? current.filter(p => p !== persona)
      : [...current, persona];
    setValue('target_personas', updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Market Research Testing</h1>
              <p className="mt-2 text-gray-600">Test product evaluation and consumer insights</p>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Panel */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Product Evaluation Setup</h2>
              <p className="text-sm text-gray-600 mt-1">Configure your market research study</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Quick Template */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Start</h3>
                <button
                  type="button"
                  onClick={loadGazpachoTemplate}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Load Gazpacho Example
                </button>
              </div>

              {/* Research Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Name *
                </label>
                <input
                  {...register('research_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter research study name"
                />
                {errors.research_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.research_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  {...register('product_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter product name"
                />
                {errors.product_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description *
                </label>
                <textarea
                  {...register('product_description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Describe your product in detail"
                />
                {errors.product_description && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Questions *
                </label>
                <textarea
                  {...register('evaluation_questions')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter questions to ask consumers (one per line)"
                />
                {errors.evaluation_questions && (
                  <p className="mt-1 text-sm text-red-600">{errors.evaluation_questions.message}</p>
                )}
              </div>

              {/* Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Context *
                </label>
                <textarea
                  {...register('context')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Provide context for this research study"
                />
                {errors.context && (
                  <p className="mt-1 text-sm text-red-600">{errors.context.message}</p>
                )}
              </div>

              {/* Persona Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumer Personas *
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'lisa', name: 'Lisa Carter', description: 'Marketing professional, health-conscious' },
                    { id: 'oscar', name: 'Oscar Rodriguez', description: 'Architect, design-focused' },
                    { id: 'marcos', name: 'Marcos Silva', description: 'Physician, analytical thinker' }
                  ].map((persona) => (
                    <label key={persona.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPersonas.includes(persona.id)}
                        onChange={() => togglePersona(persona.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{persona.name}</div>
                        <div className="text-sm text-gray-500">{persona.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.target_personas && (
                  <p className="mt-1 text-sm text-red-600">{errors.target_personas.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Running Evaluation...' : 'Start Product Evaluation'}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Research Results</h2>
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
                  <p className="mt-4 text-gray-600">Running product evaluation...</p>
                  <p className="text-sm text-gray-500">This may take 1-2 minutes</p>
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      Research Complete
                    </h3>
                    <p className="text-sm text-green-700">
                      Research ID: {results.research_id}
                    </p>
                    <p className="text-sm text-green-700">
                      Status: {results.status}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Full Response:</h4>
                    <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96 text-gray-900">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </div>

                  {results.results && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Research Insights:</h4>
                      <pre className="text-sm whitespace-pre-wrap text-blue-900">
                        {typeof results.results === 'string' 
                          ? results.results 
                          : JSON.stringify(results.results, null, 2)
                        }
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {!results && !isLoading && !error && (
                <div className="text-center py-8 text-gray-500">
                  <p>Configure and run a product evaluation to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}