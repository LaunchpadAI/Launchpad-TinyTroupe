'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInterventions } from '@/hooks/useApi';
import { CreateInterventionRequest, InterventionVariant as APIInterventionVariant, SuccessMetric as APISuccessMetric } from '@/lib/api-client';

interface InterventionVariant extends Omit<APIInterventionVariant, 'media_type'> {
  mediaType: 'text' | 'rich' | 'image' | 'video';
  color: string;
}

interface SuccessMetric extends APISuccessMetric {}

interface InterventionType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  defaultVariants: number;
}

const INTERVENTION_TYPES: InterventionType[] = [
  {
    id: 'single-message',
    name: 'Single Message',
    description: 'One-time communication test with multiple content variations',
    icon: '📝',
    color: 'blue',
    features: ['Simple A/B testing', 'Quick deployment', 'Single touchpoint', 'Immediate results'],
    defaultVariants: 2
  },
  {
    id: 'campaign-sequence',
    name: 'Campaign Sequence',
    description: 'Multi-step marketing flow with timed interventions',
    icon: '🎯',
    color: 'emerald',
    features: ['Sequential messaging', 'Timing optimization', 'Funnel tracking', 'Behavioral triggers'],
    defaultVariants: 3
  },
  {
    id: 'product-feature',
    name: 'Product Feature',
    description: 'New feature introduction and adoption measurement',
    icon: '⚡',
    color: 'violet',
    features: ['Feature rollout', 'Usage tracking', 'Adoption metrics', 'User feedback'],
    defaultVariants: 2
  },
  {
    id: 'policy-simulation',
    name: 'Policy Simulation',
    description: 'Regulatory or policy change impact assessment',
    icon: '📋',
    color: 'amber',
    features: ['Policy impact', 'Compliance testing', 'Behavioral change', 'Risk assessment'],
    defaultVariants: 2
  }
];

const CHANNELS = [
  { id: 'email', name: 'Email', icon: '✉️' },
  { id: 'social', name: 'Social Media', icon: '📱' },
  { id: 'in-app', name: 'In-App', icon: '📲' },
  { id: 'sms', name: 'SMS', icon: '💬' },
  { id: 'push', name: 'Push Notification', icon: '🔔' },
  { id: 'web', name: 'Website', icon: '🌐' }
];

const TIMING_OPTIONS = [
  { id: 'immediate', name: 'Immediate', description: 'Send right away' },
  { id: 'morning', name: 'Morning (9 AM)', description: 'Optimal morning timing' },
  { id: 'afternoon', name: 'Afternoon (2 PM)', description: 'Post-lunch engagement' },
  { id: 'evening', name: 'Evening (6 PM)', description: 'After-work timing' },
  { id: 'delayed', name: 'Custom Delay', description: 'Specify custom timing' }
];

const DEFAULT_METRICS: SuccessMetric[] = [
  { id: 'response_rate', name: 'Response Rate', description: 'Percentage of agents that respond', type: 'rate', target: 70, enabled: true },
  { id: 'engagement_score', name: 'Engagement Score', description: 'Overall engagement level (1-10)', type: 'score', target: 7, enabled: true },
  { id: 'sentiment_positive', name: 'Positive Sentiment', description: 'Percentage with positive sentiment', type: 'rate', target: 60, enabled: true },
  { id: 'conversion', name: 'Conversion', description: 'Desired action completion', type: 'binary', enabled: true },
  { id: 'satisfaction', name: 'Satisfaction', description: 'User satisfaction rating (1-5)', type: 'scale', target: 4, enabled: false },
  { id: 'retention', name: 'Retention Intent', description: 'Likelihood to continue using', type: 'rate', target: 80, enabled: false }
];

const VARIANT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function InterventionDesigner() {
  const [selectedType, setSelectedType] = useState<InterventionType | null>(null);
  const [variants, setVariants] = useState<InterventionVariant[]>([]);
  const [metrics, setMetrics] = useState<SuccessMetric[]>(DEFAULT_METRICS);
  const [interventionName, setInterventionName] = useState('');
  const [description, setDescription] = useState('');
  const [editingVariant, setEditingVariant] = useState<InterventionVariant | null>(null);

  const createDefaultVariants = (type: InterventionType) => {
    const defaultVariants: InterventionVariant[] = [];
    
    for (let i = 0; i < type.defaultVariants; i++) {
      defaultVariants.push({
        id: `variant_${i + 1}`,
        name: i === 0 ? 'Control' : `Variant ${String.fromCharCode(65 + i)}`,
        content: '',
        channel: 'email',
        timing: 'immediate',
        weight: Math.floor(100 / type.defaultVariants),
        mediaType: 'text',
        color: VARIANT_COLORS[i % VARIANT_COLORS.length]
      });
    }
    
    return defaultVariants;
  };

  const handleTypeSelect = (type: InterventionType) => {
    setSelectedType(type);
    setVariants(createDefaultVariants(type));
    setInterventionName('');
    setDescription('');
  };

  const handleVariantUpdate = (variantId: string, updates: Partial<InterventionVariant>) => {
    setVariants(prev => 
      prev.map(variant => 
        variant.id === variantId ? { ...variant, ...updates } : variant
      )
    );
  };

  const handleAddVariant = () => {
    const newVariant: InterventionVariant = {
      id: `variant_${variants.length + 1}`,
      name: `Variant ${String.fromCharCode(65 + variants.length)}`,
      content: '',
      channel: 'email',
      timing: 'immediate',
      weight: Math.floor(100 / (variants.length + 1)),
      mediaType: 'text',
      color: VARIANT_COLORS[variants.length % VARIANT_COLORS.length]
    };
    
    // Rebalance weights
    const rebalancedVariants = variants.map(v => ({
      ...v,
      weight: Math.floor(100 / (variants.length + 1))
    }));
    
    setVariants([...rebalancedVariants, newVariant]);
  };

  const handleDeleteVariant = (variantId: string) => {
    if (variants.length <= 2) return; // Minimum 2 variants
    
    const newVariants = variants.filter(v => v.id !== variantId);
    // Rebalance weights
    const rebalancedVariants = newVariants.map(v => ({
      ...v,
      weight: Math.floor(100 / newVariants.length)
    }));
    
    setVariants(rebalancedVariants);
  };

  const handleMetricToggle = (metricId: string) => {
    setMetrics(prev => 
      prev.map(metric => 
        metric.id === metricId ? { ...metric, enabled: !metric.enabled } : metric
      )
    );
  };

  const { createIntervention, loading: creatingIntervention, error: creationError } = useInterventions();

  const handleLaunchIntervention = async () => {
    if (!selectedType || !interventionName || variants.some(v => !v.content)) {
      alert('Please complete all required fields');
      return;
    }

    if (variants.reduce((sum, v) => sum + v.weight, 0) !== 100) {
      alert('Variant weights must sum to 100%');
      return;
    }

    try {
      const request: CreateInterventionRequest = {
        name: interventionName,
        description: description || undefined,
        type: selectedType.id as any,
        variants: variants.map(v => ({
          id: v.id,
          name: v.name,
          content: v.content,
          channel: v.channel,
          timing: v.timing,
          weight: v.weight,
          media_type: v.mediaType
        })),
        success_metrics: metrics.filter(m => m.enabled),
        auto_end_when_significant: false,
        enable_real_time_monitoring: true
      };

      const intervention = await createIntervention(request);
      alert(`Intervention "${interventionName}" created successfully!\n\nIntervention ID: ${intervention.intervention_id}\nType: ${selectedType.name}\nVariants: ${variants.length}\nStatus: ${intervention.status}`);
      
      // Reset form
      setSelectedType(null);
      setVariants([]);
      setInterventionName('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create intervention:', error);
      alert(`Failed to create intervention: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100">
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Intervention Designer
                </h1>
                <p className="text-gray-600 mt-1">Create and configure intervention experiments with A/B testing capabilities</p>
              </div>
            </div>
            {selectedType && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{selectedType.name}</div>
                  <div className="text-xs text-gray-500">{variants.length} variants configured</div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br from-${selectedType.color}-500 to-${selectedType.color}-600 rounded-xl flex items-center justify-center text-2xl`}>
                  {selectedType.icon}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Intervention Type Selection */}
        {!selectedType && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Intervention Type</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Select the type of intervention that matches your experimental goals. Each type is optimized for specific use cases and measurement approaches.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {INTERVENTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  className={`text-left p-6 border-2 border-gray-200 rounded-xl hover:border-${type.color}-300 hover:bg-${type.color}-50 transition-all duration-200 group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${type.color}-500 to-${type.color}-600 rounded-lg flex items-center justify-center text-2xl`}>
                      {type.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>

                  <div className="space-y-2">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <div className={`w-1.5 h-1.5 bg-${type.color}-500 rounded-full mr-2`} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Default variants: {type.defaultVariants}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Intervention Configuration */}
        {selectedType && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Configuration */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Intervention Name *</label>
                    <input
                      type="text"
                      value={interventionName}
                      onChange={(e) => setInterventionName(e.target.value)}
                      placeholder="Enter intervention name..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the purpose and goals of this intervention..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Variant Configuration */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Intervention Variants</h2>
                  <button
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Variant
                  </button>
                </div>

                <div className="space-y-6">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: variant.color }}
                          />
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => handleVariantUpdate(variant.id, { name: e.target.value })}
                            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                          />
                          <span className="ml-4 bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                            {variant.weight}%
                          </span>
                        </div>
                        
                        {variants.length > 2 && (
                          <button
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                          <select
                            value={variant.channel}
                            onChange={(e) => handleVariantUpdate(variant.id, { channel: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                          >
                            {CHANNELS.map(channel => (
                              <option key={channel.id} value={channel.id}>
                                {channel.icon} {channel.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Timing</label>
                          <select
                            value={variant.timing}
                            onChange={(e) => handleVariantUpdate(variant.id, { timing: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                          >
                            {TIMING_OPTIONS.map(timing => (
                              <option key={timing.id} value={timing.id}>
                                {timing.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={variant.weight}
                            onChange={(e) => handleVariantUpdate(variant.id, { weight: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                        <textarea
                          rows={4}
                          value={variant.content}
                          onChange={(e) => handleVariantUpdate(variant.id, { content: e.target.value })}
                          placeholder={`Enter content for ${variant.name}...`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Metrics */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Success Metrics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={metric.enabled}
                        onChange={() => handleMetricToggle(metric.id)}
                        className="mt-1 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{metric.name}</div>
                        <div className="text-sm text-gray-500">{metric.description}</div>
                        {metric.target && metric.enabled && (
                          <div className="text-sm text-amber-600 mt-1">
                            Target: {metric.target}{metric.type === 'rate' ? '%' : metric.type === 'scale' ? '/5' : metric.type === 'score' ? '/10' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="space-y-6">
              
              {/* Configuration Summary */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Configuration Summary</h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variants:</span>
                    <span className="font-medium">{variants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Metrics:</span>
                    <span className="font-medium">{metrics.filter(m => m.enabled).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight Total:</span>
                    <span className={`font-medium ${variants.reduce((sum, v) => sum + v.weight, 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {variants.reduce((sum, v) => sum + v.weight, 0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Variant Distribution */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Variant Distribution</h3>
                
                <div className="space-y-3">
                  {variants.map((variant) => (
                    <div key={variant.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{variant.name}</span>
                        <span className="font-medium">{variant.weight}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${variant.weight}%`,
                            backgroundColor: variant.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Launch Configuration */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Launch Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Launch Schedule</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900">
                      <option>Launch immediately</option>
                      <option>Schedule for later</option>
                      <option>Save as draft</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" defaultChecked />
                      <span className="text-sm text-gray-700">Enable real-time monitoring</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                      <span className="text-sm text-gray-700">Auto-end when significant</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Launch Button */}
              <button
                onClick={handleLaunchIntervention}
                disabled={creatingIntervention || !interventionName || variants.some(v => !v.content) || variants.reduce((sum, v) => sum + v.weight, 0) !== 100}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                  creatingIntervention || !interventionName || variants.some(v => !v.content) || variants.reduce((sum, v) => sum + v.weight, 0) !== 100
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                }`}
              >
                {creatingIntervention ? 'Creating Intervention...' : 'Create Intervention'}
              </button>
              
              {creationError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  Error: {creationError}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}