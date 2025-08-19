'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TinyTroupeApiClient } from '@tinytroupe/api-client';

// Form Schemas
const tvAdSchema = z.object({
  research_name: z.string().min(1, 'Research name is required'),
  product_name: z.string().min(1, 'Product name is required'),
  target_audience: z.string().min(1, 'Target audience is required'),
  key_messages: z.string().min(1, 'Key messages are required'),
  duration: z.string().default('30 seconds'),
  tone: z.string().default('engaging and memorable'),
  test_personas: z.array(z.string()).min(1, 'At least one persona is required'),
});

const interviewSchema = z.object({
  interview_topic: z.string().min(1, 'Interview topic is required'),
  customer_persona: z.string().min(1, 'Customer persona is required'),
  questions: z.string().min(1, 'Questions are required'),
  context: z.string().min(1, 'Context is required'),
  duration_minutes: z.number().min(5).max(60).default(15),
});

const brainstormingSchema = z.object({
  session_topic: z.string().min(1, 'Session topic is required'),
  participants: z.array(z.string()).min(1, 'At least one participant is required'),
  brainstorm_type: z.string().default('product_ideas'),
  constraints: z.string().optional(),
  target_ideas: z.number().min(1).max(50).default(10),
});

const storytellingSchema = z.object({
  story_prompt: z.string().min(1, 'Story prompt is required'),
  narrator_persona: z.string().min(1, 'Narrator persona is required'),
  story_type: z.string().default('narrative'),
  target_length: z.string().default('medium'),
  context: z.string().optional(),
});

type TVAdForm = z.infer<typeof tvAdSchema>;
type InterviewForm = z.infer<typeof interviewSchema>;
type BrainstormingForm = z.infer<typeof brainstormingSchema>;
type StorytellingForm = z.infer<typeof storytellingSchema>;

export default function ExamplesPage() {
  const [activeTab, setActiveTab] = useState<'tv-ad' | 'interview' | 'brainstorming' | 'storytelling'>('tv-ad');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const client = new TinyTroupeApiClient();

  const tvAdForm = useForm<TVAdForm>({
    resolver: zodResolver(tvAdSchema),
    defaultValues: {
      research_name: '',
      product_name: '',
      target_audience: '',
      key_messages: '',
      duration: '30 seconds',
      tone: 'engaging and memorable',
      test_personas: ['lisa'],
    }
  });

  const interviewForm = useForm<InterviewForm>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      interview_topic: '',
      customer_persona: 'lisa',
      questions: '',
      context: '',
      duration_minutes: 15,
    }
  });

  const brainstormingForm = useForm<BrainstormingForm>({
    resolver: zodResolver(brainstormingSchema),
    defaultValues: {
      session_topic: '',
      participants: ['lisa'],
      brainstorm_type: 'product_ideas',
      constraints: '',
      target_ideas: 10,
    }
  });

  const storytellingForm = useForm<StorytellingForm>({
    resolver: zodResolver(storytellingSchema),
    defaultValues: {
      story_prompt: '',
      narrator_persona: 'lisa',
      story_type: 'narrative',
      target_length: 'medium',
      context: '',
    }
  });

  // Load template functions
  const loadTVAdTemplate = () => {
    tvAdForm.reset({
      research_name: 'Sustainable Electric Vehicle Campaign',
      product_name: 'EcoFlow Electric Car',
      target_audience: 'Environmentally conscious urban professionals aged 25-45',
      key_messages: 'Zero emissions\nAdvanced technology\nAffordable pricing\nReliable performance',
      duration: '30 seconds',
      tone: 'inspiring and trustworthy',
      test_personas: ['lisa', 'oscar', 'marcos'],
    });
  };

  const loadInterviewTemplate = () => {
    interviewForm.reset({
      interview_topic: 'Remote Work Technology Needs',
      customer_persona: 'lisa',
      questions: 'What tools do you use for remote work?\nWhat are your biggest productivity challenges?\nHow do you stay connected with your team?\nWhat would make remote work easier for you?',
      context: 'We are developing a new remote work platform and want to understand user needs and pain points.',
      duration_minutes: 20,
    });
  };

  const loadBrainstormingTemplate = () => {
    brainstormingForm.reset({
      session_topic: 'Innovative Features for Smart Home Devices',
      participants: ['lisa', 'oscar', 'marcos'],
      brainstorm_type: 'product_ideas',
      constraints: 'Must be technically feasible\nBudget under $500\nEasy to use for all ages',
      target_ideas: 15,
    });
  };

  const loadStorytellingTemplate = () => {
    storytellingForm.reset({
      story_prompt: 'A day in the life of someone living in a fully sustainable smart city in 2030',
      narrator_persona: 'oscar',
      story_type: 'narrative',
      target_length: 'medium',
      context: 'This story will be used to inspire urban planners and technology developers.',
    });
  };

  // Submit functions
  const onTVAdSubmit = async (data: TVAdForm) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/examples/tv-advertisement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          key_messages: data.key_messages.split('\n').filter(msg => msg.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setResults(result);
    } catch (err: any) {
      setError(err.message || 'Failed to create TV advertisement');
      console.error('TV Ad error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onInterviewSubmit = async (data: InterviewForm) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/examples/customer-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          questions: data.questions.split('\n').filter(q => q.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setResults(result);
    } catch (err: any) {
      setError(err.message || 'Failed to conduct customer interview');
      console.error('Interview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onBrainstormingSubmit = async (data: BrainstormingForm) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/examples/brainstorming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          constraints: data.constraints ? data.constraints.split('\n').filter(c => c.trim()) : [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setResults(result);
    } catch (err: any) {
      setError(err.message || 'Failed to run brainstorming session');
      console.error('Brainstorming error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onStorytellingSubmit = async (data: StorytellingForm) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/examples/storytelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setResults(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate story');
      console.error('Storytelling error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePersona = (form: any, currentPersonas: string[], persona: string) => {
    const updated = currentPersonas.includes(persona)
      ? currentPersonas.filter(p => p !== persona)
      : [...currentPersonas, persona];
    form.setValue('test_personas' in form.getValues() ? 'test_personas' : 'participants', updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TinyTroupe Examples</h1>
              <p className="mt-2 text-gray-600">Test advanced TinyTroupe capabilities with real AI personas</p>
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
              <h2 className="text-lg font-medium text-gray-900">Example Testing</h2>
              <p className="text-sm text-gray-600 mt-1">Test different TinyTroupe capabilities</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'tv-ad', label: 'TV Advertisement' },
                  { id: 'interview', label: 'Customer Interview' },
                  { id: 'brainstorming', label: 'Brainstorming' },
                  { id: 'storytelling', label: 'Storytelling' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* TV Advertisement Form */}
              {activeTab === 'tv-ad' && (
                <form onSubmit={tvAdForm.handleSubmit(onTVAdSubmit)} className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Start</h3>
                    <button
                      type="button"
                      onClick={loadTVAdTemplate}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Load Electric Car Example
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Research Name *</label>
                    <input
                      {...tvAdForm.register('research_name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Name for this research project"
                    />
                    {tvAdForm.formState.errors.research_name && (
                      <p className="mt-1 text-sm text-red-600">{tvAdForm.formState.errors.research_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      {...tvAdForm.register('product_name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Product to advertise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience *</label>
                    <input
                      {...tvAdForm.register('target_audience')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Who is the target audience?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Messages *</label>
                    <textarea
                      {...tvAdForm.register('key_messages')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter key messages (one per line)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <input
                        {...tvAdForm.register('duration')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                      <input
                        {...tvAdForm.register('tone')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Test Personas *</label>
                    <div className="space-y-2">
                      {[
                        { id: 'lisa', name: 'Lisa Carter', description: 'Marketing professional, health-conscious' },
                        { id: 'oscar', name: 'Oscar Rodriguez', description: 'Architect, design-focused' },
                        { id: 'marcos', name: 'Marcos Silva', description: 'Physician, analytical thinker' },
                      ].map((persona) => {
                        const currentPersonas = tvAdForm.watch('test_personas') || [];
                        return (
                          <label key={persona.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentPersonas.includes(persona.id)}
                              onChange={() => togglePersona(tvAdForm, currentPersonas, persona.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{persona.name}</div>
                              <div className="text-sm text-gray-500">{persona.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating Advertisement...' : 'Create & Test TV Ad'}
                  </button>
                </form>
              )}

              {/* Customer Interview Form */}
              {activeTab === 'interview' && (
                <form onSubmit={interviewForm.handleSubmit(onInterviewSubmit)} className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-900 mb-2">Quick Start</h3>
                    <button
                      type="button"
                      onClick={loadInterviewTemplate}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Load Remote Work Example
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Topic *</label>
                    <input
                      {...interviewForm.register('interview_topic')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="What topic will you interview about?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Persona *</label>
                    <select
                      {...interviewForm.register('customer_persona')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="lisa">Lisa Carter (Marketing Professional)</option>
                      <option value="oscar">Oscar Rodriguez (Architect)</option>
                      <option value="marcos">Marcos Silva (Physician)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Questions *</label>
                    <textarea
                      {...interviewForm.register('questions')}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter interview questions (one per line)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Context *</label>
                    <textarea
                      {...interviewForm.register('context')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Provide context for the interview"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      {...interviewForm.register('duration_minutes', { valueAsNumber: true })}
                      min={5}
                      max={60}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Conducting Interview...' : 'Start Customer Interview'}
                  </button>
                </form>
              )}

              {/* Brainstorming Form */}
              {activeTab === 'brainstorming' && (
                <form onSubmit={brainstormingForm.handleSubmit(onBrainstormingSubmit)} className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-900 mb-2">Quick Start</h3>
                    <button
                      type="button"
                      onClick={loadBrainstormingTemplate}
                      className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                    >
                      Load Smart Home Example
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Topic *</label>
                    <input
                      {...brainstormingForm.register('session_topic')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="What will you brainstorm about?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brainstorming Type</label>
                    <select
                      {...brainstormingForm.register('brainstorm_type')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="product_ideas">Product Ideas</option>
                      <option value="marketing_campaigns">Marketing Campaigns</option>
                      <option value="solutions">Problem Solutions</option>
                      <option value="creative_concepts">Creative Concepts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Participants *</label>
                    <div className="space-y-2">
                      {[
                        { id: 'lisa', name: 'Lisa Carter', description: 'Marketing professional, analytical' },
                        { id: 'oscar', name: 'Oscar Rodriguez', description: 'Architect, design-focused' },
                        { id: 'marcos', name: 'Marcos Silva', description: 'Physician, scientific approach' },
                      ].map((persona) => {
                        const currentParticipants = brainstormingForm.watch('participants') || [];
                        return (
                          <label key={persona.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentParticipants.includes(persona.id)}
                              onChange={() => togglePersona(brainstormingForm, currentParticipants, persona.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{persona.name}</div>
                              <div className="text-sm text-gray-500">{persona.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Constraints (optional)</label>
                    <textarea
                      {...brainstormingForm.register('constraints')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter constraints (one per line)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Ideas</label>
                    <input
                      type="number"
                      {...brainstormingForm.register('target_ideas', { valueAsNumber: true })}
                      min={1}
                      max={50}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Running Brainstorming...' : 'Start Brainstorming Session'}
                  </button>
                </form>
              )}

              {/* Storytelling Form */}
              {activeTab === 'storytelling' && (
                <form onSubmit={storytellingForm.handleSubmit(onStorytellingSubmit)} className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-orange-900 mb-2">Quick Start</h3>
                    <button
                      type="button"
                      onClick={loadStorytellingTemplate}
                      className="text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                    >
                      Load Smart City Example
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Story Prompt *</label>
                    <textarea
                      {...storytellingForm.register('story_prompt')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="What should the story be about?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Narrator Persona *</label>
                    <select
                      {...storytellingForm.register('narrator_persona')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="lisa">Lisa Carter (Marketing Professional)</option>
                      <option value="oscar">Oscar Rodriguez (Architect)</option>
                      <option value="marcos">Marcos Silva (Physician)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Story Type</label>
                      <select
                        {...storytellingForm.register('story_type')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="narrative">Narrative</option>
                        <option value="dialogue">Dialogue</option>
                        <option value="descriptive">Descriptive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Length</label>
                      <select
                        {...storytellingForm.register('target_length')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Context (optional)</label>
                    <textarea
                      {...storytellingForm.register('context')}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Additional context for the story"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Generating Story...' : 'Generate Story'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Results</h2>
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
                  <p className="mt-4 text-gray-600">Processing...</p>
                  <p className="text-sm text-gray-500">This may take 1-3 minutes</p>
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      {activeTab === 'tv-ad' && 'TV Advertisement Created'}
                      {activeTab === 'interview' && 'Customer Interview Complete'}
                      {activeTab === 'brainstorming' && 'Brainstorming Session Complete'}
                      {activeTab === 'storytelling' && 'Story Generated'}
                    </h3>
                    <p className="text-sm text-green-700">
                      ID: {results.research_id || results.interview_id || results.session_id || results.story_id}
                    </p>
                    <p className="text-sm text-green-700">Status: {results.status}</p>
                  </div>

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
                  <p>Configure and run an example to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}