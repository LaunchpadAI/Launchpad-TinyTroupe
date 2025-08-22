'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface InterventionVariant {
  id: string;
  name: string;
  content: string;
  weight?: number; // For distribution control
}

interface InterventionConfig {
  name: string;
  variants: InterventionVariant[];
  timing: {
    delay_minutes: number;
    trigger_condition: string;
  };
  targeting: {
    segments: string[];
    percentage: number;
  };
  success_metrics: string[];
}

interface InterventionDesignerProps {
  onCreateIntervention: (config: InterventionConfig) => void;
  templates?: InterventionConfig[];
  className?: string;
}

const INTERVENTION_TEMPLATES: InterventionConfig[] = [
  {
    name: "Product Announcement",
    variants: [
      {
        id: 'announcement-formal',
        name: 'Formal Announcement',
        content: 'We are pleased to announce the launch of our new product line. This innovative solution addresses key market needs and delivers superior value.',
        weight: 50
      },
      {
        id: 'announcement-casual',
        name: 'Casual Announcement',
        content: 'Hey everyone! We just launched something amazing that we think you\'ll love. Check out our latest product - it\'s a game changer!',
        weight: 50
      }
    ],
    timing: {
      delay_minutes: 5,
      trigger_condition: 'after_persona_introduction'
    },
    targeting: {
      segments: ['all'],
      percentage: 100
    },
    success_metrics: ['engagement_score', 'sentiment_score', 'purchase_intent']
  },
  {
    name: "Pricing Strategy Test",
    variants: [
      {
        id: 'price-premium',
        name: 'Premium Pricing ($299)',
        content: 'Our premium product is priced at $299, reflecting its superior quality, advanced features, and exceptional value proposition.',
        weight: 33
      },
      {
        id: 'price-mid',
        name: 'Mid-tier Pricing ($199)',
        content: 'At $199, this product offers the perfect balance of quality and affordability for discerning customers.',
        weight: 33
      },
      {
        id: 'price-budget',
        name: 'Budget Pricing ($99)',
        content: 'For just $99, you can access all the core features that matter most, making this an incredible value.',
        weight: 34
      }
    ],
    timing: {
      delay_minutes: 10,
      trigger_condition: 'after_product_introduction'
    },
    targeting: {
      segments: ['price_sensitive', 'quality_focused'],
      percentage: 75
    },
    success_metrics: ['price_acceptance', 'purchase_likelihood', 'value_perception']
  }
];

const SUCCESS_METRICS_OPTIONS = [
  'engagement_score',
  'sentiment_score',
  'purchase_intent',
  'price_acceptance',
  'brand_perception',
  'viral_potential',
  'trust_score',
  'confusion_level',
  'emotional_response',
  'recall_accuracy'
];

const TARGETING_SEGMENTS = [
  'all',
  'health_conscious',
  'price_sensitive', 
  'tech_savvy',
  'environmentally_aware',
  'brand_loyal',
  'early_adopter',
  'social_influence',
  'quality_focused'
];

export default function InterventionDesigner({ onCreateIntervention, templates, className }: InterventionDesignerProps) {
  const [interventionName, setInterventionName] = useState('');
  const [variants, setVariants] = useState<InterventionVariant[]>([
    { id: 'variant-1', name: 'Variant A', content: '', weight: 50 },
    { id: 'variant-2', name: 'Variant B', content: '', weight: 50 }
  ]);
  const [timing, setTiming] = useState({
    delay_minutes: 5,
    trigger_condition: 'immediate'
  });
  const [targeting, setTargeting] = useState({
    segments: ['all'] as string[],
    percentage: 100
  });
  const [successMetrics, setSuccessMetrics] = useState<string[]>(['engagement_score', 'sentiment_score']);

  const addVariant = () => {
    const newVariant: InterventionVariant = {
      id: `variant-${Date.now()}`,
      name: `Variant ${String.fromCharCode(65 + variants.length)}`,
      content: '',
      weight: Math.floor(100 / (variants.length + 1))
    };
    
    // Redistribute weights evenly
    const updatedVariants = [...variants, newVariant].map(v => ({
      ...v,
      weight: Math.floor(100 / (variants.length + 1))
    }));
    
    setVariants(updatedVariants);
  };

  const removeVariant = (variantId: string) => {
    if (variants.length <= 1) return; // Keep at least one variant
    
    const updatedVariants = variants
      .filter(v => v.id !== variantId)
      .map(v => ({ ...v, weight: Math.floor(100 / (variants.length - 1)) }));
    
    setVariants(updatedVariants);
  };

  const updateVariant = (variantId: string, field: keyof InterventionVariant, value: any) => {
    setVariants(prev => prev.map(v => 
      v.id === variantId ? { ...v, [field]: value } : v
    ));
  };

  const loadTemplate = (template: InterventionConfig) => {
    setInterventionName(template.name);
    setVariants(template.variants);
    setTiming(template.timing);
    setTargeting(template.targeting);
    setSuccessMetrics(template.success_metrics);
  };

  const toggleSegment = (segment: string) => {
    setTargeting(prev => ({
      ...prev,
      segments: prev.segments.includes(segment)
        ? prev.segments.filter(s => s !== segment)
        : [...prev.segments, segment]
    }));
  };

  const toggleMetric = (metric: string) => {
    setSuccessMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const handleSubmit = () => {
    const config: InterventionConfig = {
      name: interventionName,
      variants,
      timing,
      targeting,
      success_metrics: successMetrics
    };
    
    onCreateIntervention(config);
  };

  const isValid = interventionName.trim() && variants.every(v => v.content.trim()) && successMetrics.length > 0;

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-purple-900 mb-2">Intervention Designer</h3>
        <p className="text-sm text-purple-700">
          Create A/B/n tests to understand how different messaging strategies impact participant responses.
        </p>
      </div>

      {/* Templates */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Quick Start Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INTERVENTION_TEMPLATES.map(template => (
            <button
              key={template.name}
              onClick={() => loadTemplate(template)}
              className="text-left p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{template.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {template.variants.length} variants • {template.success_metrics.length} metrics
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Intervention Name */}
      <div className="bg-white border rounded-lg p-4">
        <label className="block text-md font-medium text-gray-900 mb-2">
          Intervention Name *
        </label>
        <input
          type="text"
          value={interventionName}
          onChange={(e) => setInterventionName(e.target.value)}
          placeholder="e.g., Product Launch Messaging Test"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
        />
      </div>

      {/* Variants Editor */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">
            Message Variants ({variants.length})
          </h4>
          <button
            onClick={addVariant}
            className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
          >
            + Add Variant
          </button>
        </div>
        
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                    className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {variant.weight}% traffic
                  </span>
                </div>
                {variants.length > 1 && (
                  <button
                    onClick={() => removeVariant(variant.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <textarea
                value={variant.content}
                onChange={(e) => updateVariant(variant.id, 'content', e.target.value)}
                placeholder="Enter the message content for this variant..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
              
              <div className="flex items-center mt-2">
                <label className="text-xs text-gray-600 mr-2">Traffic %:</label>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={variant.weight || 50}
                  onChange={(e) => updateVariant(variant.id, 'weight', parseInt(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timing Controls */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Timing & Scheduling</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delay (minutes)
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={timing.delay_minutes || 0}
              onChange={(e) => setTiming(prev => ({ ...prev, delay_minutes: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Condition
            </label>
            <select
              value={timing.trigger_condition || 'immediate'}
              onChange={(e) => setTiming(prev => ({ ...prev, trigger_condition: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            >
              <option value="immediate">Immediate</option>
              <option value="after_persona_introduction">After Persona Introduction</option>
              <option value="after_product_introduction">After Product Introduction</option>
              <option value="mid_conversation">Mid Conversation</option>
              <option value="before_conclusion">Before Conclusion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Targeting */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Target Segments</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {TARGETING_SEGMENTS.map(segment => (
            <label
              key={segment}
              className={clsx(
                'flex items-center p-2 border rounded cursor-pointer text-sm',
                targeting.segments.includes(segment)
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              <input
                type="checkbox"
                checked={targeting.segments.includes(segment)}
                onChange={() => toggleSegment(segment)}
                className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-2"
              />
              {segment.replace('_', ' ')}
            </label>
          ))}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Population Percentage: {targeting.percentage}%
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={targeting.percentage}
            onChange={(e) => setTargeting(prev => ({ ...prev, percentage: parseInt(e.target.value) }))}
            className="w-full"
          />
        </div>
      </div>

      {/* Success Metrics */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Success Metrics ({successMetrics.length} selected)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SUCCESS_METRICS_OPTIONS.map(metric => (
            <label
              key={metric}
              className={clsx(
                'flex items-center p-2 border rounded cursor-pointer text-sm',
                successMetrics.includes(metric)
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              <input
                type="checkbox"
                checked={successMetrics.includes(metric)}
                onChange={() => toggleMetric(metric)}
                className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-2"
              />
              {metric.replace('_', ' ')}
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={clsx(
            'px-6 py-2 rounded-md font-medium',
            isValid
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
        >
          Create Intervention Test
        </button>
      </div>

      {/* Preview */}
      {isValid && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-2">Intervention Preview</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Name:</strong> {interventionName}</p>
            <p><strong>Variants:</strong> {variants.length} ({variants.map(v => `${v.name}: ${v.weight}%`).join(', ')})</p>
            <p><strong>Targeting:</strong> {targeting.segments.join(', ')} ({targeting.percentage}% of population)</p>
            <p><strong>Timing:</strong> {timing.delay_minutes}min delay, trigger: {timing.trigger_condition}</p>
            <p><strong>Metrics:</strong> {successMetrics.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}