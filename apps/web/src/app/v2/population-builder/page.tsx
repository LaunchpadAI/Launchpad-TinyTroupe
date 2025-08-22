'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TinyTroupeApiClient } from '@tinytroupe/api-client';

interface PopulationSegment {
  id: string;
  name: string;
  size: number;
  age_range: string;
  income_level: string;
  location: string;
  particularities: string;
  fragments: string[];
  color: string;
}

interface DemographicTemplate {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

const DEFAULT_PERSONALITY_FRAGMENTS = [
  { id: 'health_conscious', name: 'Health Conscious', description: 'Focuses on wellness and healthy lifestyle choices', color: 'green' },
  { id: 'price_sensitive', name: 'Price Sensitive', description: 'Values cost-effectiveness and deals', color: 'red' },
  { id: 'tech_savvy', name: 'Tech Savvy', description: 'Comfortable with technology and digital solutions', color: 'blue' },
  { id: 'environmentally_aware', name: 'Environmentally Aware', description: 'Cares about sustainability and eco-friendliness', color: 'emerald' },
  { id: 'brand_loyal', name: 'Brand Loyal', description: 'Prefers established brands and familiar products', color: 'purple' },
  { id: 'early_adopter', name: 'Early Adopter', description: 'Likes to try new products and trends first', color: 'orange' },
  { id: 'social_influence', name: 'Social Influence', description: 'Influenced by social media and peer opinions', color: 'pink' },
  { id: 'quality_focused', name: 'Quality Focused', description: 'Prioritizes high-quality products and experiences', color: 'indigo' },
  { id: 'time_constrained', name: 'Time Constrained', description: 'Values efficiency and time-saving solutions', color: 'yellow' },
  { id: 'budget_conscious', name: 'Budget Conscious', description: 'Careful with spending and financial decisions', color: 'amber' },
  { id: 'loving_parent', name: 'Loving Parent', description: 'Prioritizes family and children\'s needs', color: 'rose' },
  { id: 'career_focused', name: 'Career Focused', description: 'Ambitious and professionally driven', color: 'gray' },
  { id: 'adventurous', name: 'Adventurous', description: 'Enjoys new experiences and taking risks', color: 'teal' },
  { id: 'conservative', name: 'Conservative', description: 'Prefers traditional approaches and stability', color: 'slate' },
  { id: 'creative', name: 'Creative', description: 'Values artistic expression and innovation', color: 'violet' },
  { id: 'analytical', name: 'Analytical', description: 'Prefers data-driven decision making', color: 'cyan' }
];

const DEMOGRAPHIC_TEMPLATES: DemographicTemplate[] = [
  { id: 'usa_demographics', name: 'USA Demographics', description: 'United States population characteristics', available: true },
  { id: 'eu_demographics', name: 'EU Demographics', description: 'European Union population characteristics', available: true },
  { id: 'uk_demographics', name: 'UK Demographics', description: 'United Kingdom population characteristics', available: true },
  { id: 'custom', name: 'Custom', description: 'Define your own population characteristics', available: true }
];

const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
const INCOME_LEVELS = ['Low ($20-40k)', 'Middle ($40-80k)', 'High ($80k+)'];
const LOCATIONS = ['Urban', 'Suburban', 'Rural'];

const SEGMENT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

export default function PopulationBuilder() {
  const [totalSize, setTotalSize] = useState(100);
  const [selectedTemplate, setSelectedTemplate] = useState<DemographicTemplate>(DEMOGRAPHIC_TEMPLATES[0]);
  const [segments, setSegments] = useState<PopulationSegment[]>([
    {
      id: '1',
      name: 'Young Professionals',
      size: 40,
      age_range: '26-35',
      income_level: 'Middle ($40-80k)',
      location: 'Urban',
      particularities: 'Tech-savvy professionals focused on career growth',
      fragments: ['tech_savvy', 'career_focused', 'time_constrained'],
      color: SEGMENT_COLORS[0]
    },
    {
      id: '2', 
      name: 'Families',
      size: 35,
      age_range: '36-45',
      income_level: 'Middle ($40-80k)',
      location: 'Suburban',
      particularities: 'Married with children, family-oriented decisions',
      fragments: ['loving_parent', 'budget_conscious', 'quality_focused'],
      color: SEGMENT_COLORS[1]
    },
    {
      id: '3',
      name: 'Seniors',
      size: 25,
      age_range: '56-65',
      income_level: 'High ($80k+)',
      location: 'Suburban',
      particularities: 'Established, financially stable, traditional values',
      fragments: ['conservative', 'brand_loyal', 'quality_focused'],
      color: SEGMENT_COLORS[2]
    }
  ]);
  
  const [editingSegment, setEditingSegment] = useState<PopulationSegment | null>(null);
  const [showAddSegment, setShowAddSegment] = useState(false);
  const [availableFragments, setAvailableFragments] = useState(DEFAULT_PERSONALITY_FRAGMENTS);
  const [loadingFragments, setLoadingFragments] = useState(false);

  const totalSegmentSize = segments.reduce((sum, segment) => sum + segment.size, 0);
  const costPerAgent = 0.15; // $0.15 per agent
  const estimatedCost = totalSize * costPerAgent;

  useEffect(() => {
    loadAvailableFragments();
  }, []);

  const loadAvailableFragments = async () => {
    setLoadingFragments(true);
    try {
      const fragmentsResponse = await client.getAvailableFragments();
      const apiFragments = fragmentsResponse.available_fragments.map((frag, index) => ({
        id: frag.id,
        name: frag.name,
        description: frag.description,
        color: DEFAULT_PERSONALITY_FRAGMENTS[index % DEFAULT_PERSONALITY_FRAGMENTS.length]?.color || 'gray'
      }));
      setAvailableFragments(apiFragments);
    } catch (error) {
      console.error('Failed to load fragments from API, using defaults:', error);
      // Keep default fragments on error
    } finally {
      setLoadingFragments(false);
    }
  };

  const handleSizeChange = (segmentId: string, newSize: number) => {
    setSegments(prev => 
      prev.map(segment => 
        segment.id === segmentId ? { ...segment, size: newSize } : segment
      )
    );
  };

  const handleSegmentUpdate = (updatedSegment: PopulationSegment) => {
    setSegments(prev => 
      prev.map(segment => 
        segment.id === updatedSegment.id ? updatedSegment : segment
      )
    );
    setEditingSegment(null);
  };

  const handleAddSegment = () => {
    const newSegment: PopulationSegment = {
      id: Date.now().toString(),
      name: 'New Segment',
      size: 20,
      age_range: '26-35',
      income_level: 'Middle ($40-80k)',
      location: 'Urban',
      particularities: '',
      fragments: [],
      color: SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length]
    };
    setSegments(prev => [...prev, newSegment]);
    setShowAddSegment(false);
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(prev => prev.filter(segment => segment.id !== segmentId));
  };

  const [creatingPopulation, setCreatingPopulation] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  
  const client = new TinyTroupeApiClient();

  const generatePopulation = async () => {
    if (!selectedTemplate) {
      alert('Please select a demographic template');
      return;
    }

    setCreatingPopulation(true);
    setCreationError(null);

    try {
      const populationData = {
        name: `Population-${selectedTemplate.name}-${Date.now()}`,
        size: totalSize,
        demographic_template: selectedTemplate.id,
        segments: segments.map(segment => ({
          name: segment.name,
          percentage: (segment.size / totalSize) * 100,
          age_range: segment.age_range,
          income_level: segment.income_level,
          location: segment.location,
          fragments: segment.fragments
        }))
      };

      const population = await client.createPopulation(populationData);
      
      alert(`Population created successfully!\n\nPopulation ID: ${population.population_id}\nAgents Created: ${population.agents.length}\nTemplate: ${selectedTemplate.name}`);
      
      // Reset form
      setSegments([]);
      setTotalSize(100);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      setCreationError(errorMessage);
      console.error('Failed to create population:', error);
    } finally {
      setCreatingPopulation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/v2" className="text-gray-400 hover:text-gray-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Population Builder
                </h1>
                <p className="text-gray-600 mt-1">Configure agent demographics and personalities with advanced segmentation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{totalSize}</div>
              <div className="text-sm text-gray-500">Total Agents</div>
              <div className="text-lg font-semibold text-green-600 mt-1">${estimatedCost.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Global Settings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Population Size</label>
                  <div className="relative">
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      value={totalSize}
                      onChange={(e) => setTotalSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10</span>
                      <span>1000</span>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={totalSize}
                      onChange={(e) => setTotalSize(Math.min(1000, Math.max(10, parseInt(e.target.value) || 10)))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Demographic Template</label>
                  <div className="space-y-2">
                    {DEMOGRAPHIC_TEMPLATES.map((template) => (
                      <label key={template.id} className="flex items-center">
                        <input
                          type="radio"
                          name="template"
                          checked={selectedTemplate.id === template.id}
                          onChange={() => setSelectedTemplate(template)}
                          className="text-purple-500 focus:ring-purple-500"
                          disabled={!template.available}
                        />
                        <div className="ml-3">
                          <div className={`font-medium ${template.available ? 'text-gray-900' : 'text-gray-400'}`}>
                            {template.name}
                          </div>
                          <div className={`text-sm ${template.available ? 'text-gray-500' : 'text-gray-400'}`}>
                            {template.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Population Segments */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Population Segments</h2>
                <button
                  onClick={() => setShowAddSegment(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Segment
                </button>
              </div>

              <div className="space-y-4">
                {segments.map((segment, index) => (
                  <div key={segment.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: segment.color }}
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                        <span className="ml-3 bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                          {segment.size} agents
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingSegment(segment)}
                          className="p-2 text-gray-400 hover:text-purple-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSegment(segment.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Age:</span>
                        <div>{segment.age_range}</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Income:</span>
                        <div>{segment.income_level}</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Location:</span>
                        <div>{segment.location}</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Size:</span>
                        <input
                          type="range"
                          min="1"
                          max={Math.floor(totalSize * 0.8)}
                          value={segment.size}
                          onChange={(e) => handleSizeChange(segment.id, parseInt(e.target.value))}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {segment.particularities && (
                      <div className="mb-4">
                        <span className="font-medium text-gray-500 text-sm">Characteristics:</span>
                        <p className="text-sm text-gray-700 mt-1">{segment.particularities}</p>
                      </div>
                    )}

                    {segment.fragments.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-500 text-sm mb-2 block">Personality Traits:</span>
                        <div className="flex flex-wrap gap-2">
                          {segment.fragments.map((fragmentId) => {
                            const fragment = availableFragments.find(f => f.id === fragmentId);
                            return fragment ? (
                              <span
                                key={fragmentId}
                                className={`px-2 py-1 bg-${fragment.color}-100 text-${fragment.color}-800 rounded-full text-xs`}
                              >
                                {fragment.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="space-y-6">
            
            {/* Population Distribution */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Population Distribution</h3>
              
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segments}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="size"
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {segments.map((segment, index) => (
                        <Cell key={`cell-${index}`} fill={segment.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {segments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-gray-700">{segment.name}</span>
                    </div>
                    <span className="font-medium">{((segment.size / totalSegmentSize) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personality Fragments Distribution */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Personality Traits</h3>
              
              <div className="space-y-3">
                {loadingFragments ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading fragments...</p>
                  </div>
                ) : (
                  availableFragments.slice(0, 8).map((fragment) => {
                    const usageCount = segments.reduce((count, segment) => 
                      count + (segment.fragments.includes(fragment.id) ? segment.size : 0), 0
                    );
                    const percentage = totalSegmentSize > 0 ? (usageCount / totalSegmentSize) * 100 : 0;
                    
                    return (
                      <div key={fragment.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{fragment.name}</span>
                          <span className="font-medium">{usageCount} agents</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-${fragment.color}-500 h-2 rounded-full`}
                            style={{ width: `${Math.max(2, percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cost Estimation</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Agents:</span>
                  <span className="font-medium">{totalSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost per Agent:</span>
                  <span className="font-medium">${costPerAgent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Segments:</span>
                  <span className="font-medium">{segments.length}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Estimated Total:</span>
                    <span className="text-green-600">${estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePopulation}
              disabled={creatingPopulation || totalSegmentSize === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                creatingPopulation || totalSegmentSize === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {creatingPopulation ? 'Creating Population...' : 'Create Population'}
            </button>
            
            {creationError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                Error: {creationError}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Segment Modal */}
      {editingSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Edit Segment</h2>
            </div>
            <div className="p-6">
              <SegmentEditor
                segment={editingSegment}
                availableFragments={availableFragments}
                onSave={handleSegmentUpdate}
                onCancel={() => setEditingSegment(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Segment Editor Component
function SegmentEditor({ 
  segment, 
  availableFragments,
  onSave, 
  onCancel 
}: { 
  segment: PopulationSegment;
  availableFragments: typeof DEFAULT_PERSONALITY_FRAGMENTS;
  onSave: (segment: PopulationSegment) => void; 
  onCancel: () => void; 
}) {
  const [editedSegment, setEditedSegment] = useState<PopulationSegment>({ ...segment });

  const handleFragmentToggle = (fragmentId: string) => {
    setEditedSegment(prev => ({
      ...prev,
      fragments: prev.fragments.includes(fragmentId)
        ? prev.fragments.filter(id => id !== fragmentId)
        : [...prev.fragments, fragmentId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Segment Name</label>
          <input
            type="text"
            value={editedSegment.name}
            onChange={(e) => setEditedSegment(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <input
            type="number"
            min="1"
            value={editedSegment.size}
            onChange={(e) => setEditedSegment(prev => ({ ...prev, size: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
          <select
            value={editedSegment.age_range}
            onChange={(e) => setEditedSegment(prev => ({ ...prev, age_range: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            {AGE_RANGES.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Income Level</label>
          <select
            value={editedSegment.income_level}
            onChange={(e) => setEditedSegment(prev => ({ ...prev, income_level: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            {INCOME_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <select
            value={editedSegment.location}
            onChange={(e) => setEditedSegment(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          >
            {LOCATIONS.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Particularities</label>
        <textarea
          rows={3}
          value={editedSegment.particularities}
          onChange={(e) => setEditedSegment(prev => ({ ...prev, particularities: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          placeholder="Describe specific characteristics of this segment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Personality Fragments</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableFragments.map((fragment) => (
            <label key={fragment.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editedSegment.fragments.includes(fragment.id)}
                onChange={() => handleFragmentToggle(fragment.id)}
                className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{fragment.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(editedSegment)}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}