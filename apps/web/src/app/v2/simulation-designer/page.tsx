'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SimulationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  populationSize: string;
  duration: string;
  analysisType: string;
  features: string[];
}

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  icon: string;
}

const SIMULATION_TEMPLATES: SimulationTemplate[] = [
  {
    id: 'market-research',
    name: 'Market Research Survey',
    description: 'Test product concepts, brand perception, and purchase intent with quantitative analysis',
    icon: '📊',
    color: 'blue',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
    populationSize: '50-200 agents',
    duration: '1-2 rounds',
    analysisType: 'Quantitative with demographic breakdown',
    features: ['Product preference ranking', 'Purchase likelihood scoring', 'Price sensitivity analysis', 'Feature importance rating']
  },
  {
    id: 'focus-group',
    name: 'Focus Group Discussion',
    description: 'Explore opinions and gather qualitative insights through moderated group discussions',
    icon: '💬',
    color: 'emerald',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    populationSize: '5-12 agents',
    duration: '3-5 rounds',
    analysisType: 'Qualitative sentiment and theme extraction',
    features: ['Open discussion format', 'Moderated prompts', 'Sentiment analysis', 'Theme identification']
  },
  {
    id: 'ab-test',
    name: 'A/B Intervention Test',
    description: 'Compare marketing messages, features, or user flows with statistical validation',
    icon: '🔬',
    color: 'violet',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-600',
    populationSize: 'Split populations (control/test)',
    duration: 'Multiple touchpoints over time',
    analysisType: 'Comparative statistical analysis',
    features: ['Split population testing', 'Multiple variant support', 'Statistical significance', 'Conversion tracking']
  },
  {
    id: 'customer-journey',
    name: 'Customer Journey Simulation',
    description: 'Test multi-step processes, onboarding flows, and customer experience optimization',
    icon: '🗺️',
    color: 'amber',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    populationSize: 'Representative segments',
    duration: 'Extended simulation (compressed time)',
    analysisType: 'Funnel analysis and drop-off identification',
    features: ['Sequential interventions', 'Behavioral tracking', 'Funnel analysis', 'Drop-off identification']
  }
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: 'Choose Template',
    description: 'Select simulation type and configuration',
    status: 'pending',
    icon: '🎯'
  },
  {
    id: 2,
    title: 'Build Population',
    description: 'Configure agent demographics and personalities',
    status: 'pending',
    icon: '👥'
  },
  {
    id: 3,
    title: 'Design Intervention',
    description: 'Create content and configure experiments',
    status: 'pending',
    icon: '✏️'
  },
  {
    id: 4,
    title: 'Configure Analysis',
    description: 'Set up monitoring and result extraction',
    status: 'pending',
    icon: '📈'
  }
];

export default function SimulationDesigner() {
  const searchParams = useSearchParams();
  const preselectedTemplate = searchParams?.get('template');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<SimulationTemplate | null>(
    preselectedTemplate ? SIMULATION_TEMPLATES.find(t => t.id === preselectedTemplate) || null : null
  );
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(WORKFLOW_STEPS);

  useEffect(() => {
    // Update workflow steps based on current step
    setWorkflowSteps(steps => 
      steps.map(step => ({
        ...step,
        status: step.id < currentStep ? 'completed' : 
                step.id === currentStep ? 'active' : 'pending'
      }))
    );
  }, [currentStep]);

  useEffect(() => {
    if (selectedTemplate && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: SimulationTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep(2);
  };

  const handleStepNavigation = (stepId: number) => {
    if (stepId <= currentStep || workflowSteps[stepId - 1].status === 'completed') {
      setCurrentStep(stepId);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Simulation Designer
                </h1>
                <p className="text-gray-600 mt-1">Visual workflow builder for creating complex simulations</p>
              </div>
            </div>
            {selectedTemplate && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{selectedTemplate.name}</div>
                  <div className="text-xs text-gray-500">{selectedTemplate.populationSize}</div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${selectedTemplate.gradientFrom} ${selectedTemplate.gradientTo} rounded-xl flex items-center justify-center text-2xl`}>
                  {selectedTemplate.icon}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Workflow Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepNavigation(step.id)}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-medium text-sm transition-all duration-200 ${
                    step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                    step.status === 'active' ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {step.status === 'completed' ? '✓' : step.id}
                </button>
                <div className="ml-4 text-left">
                  <div className={`font-medium ${step.status === 'active' ? 'text-blue-600' : 'text-gray-900'}`}>
                    {step.title}
                  </div>
                  <div className="text-sm text-gray-500">{step.description}</div>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-8 ${
                    workflowSteps[index + 1].status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[600px]">
          
          {/* Step 1: Choose Template */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Simulation Template</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Select a pre-configured template that matches your research goals. Each template includes optimized settings for population size, interaction patterns, and analysis methods.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {SIMULATION_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`text-left p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                      selectedTemplate?.id === template.id
                        ? `border-${template.color}-500 bg-${template.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${template.gradientFrom} ${template.gradientTo} rounded-lg flex items-center justify-center text-2xl`}>
                        {template.icon}
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className={`w-6 h-6 bg-${template.color}-500 rounded-full flex items-center justify-center`}>
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-gray-600 mb-4">{template.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Population:</span>
                        <div className="text-gray-900">{template.populationSize}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Duration:</span>
                        <div className="text-gray-900">{template.duration}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="font-medium text-gray-500 text-sm">Analysis Type:</span>
                      <div className="text-gray-900 text-sm">{template.analysisType}</div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-500 text-sm mb-2 block">Key Features:</span>
                      <div className="space-y-1">
                        {template.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-700">
                            <div className={`w-1.5 h-1.5 bg-${template.color}-500 rounded-full mr-2`} />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Build Population */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Configure Your Population</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Define the demographic characteristics and personality traits of your simulation agents. The population builder will generate agents based on your specifications.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">Population Builder Integration</h3>
                    <p className="text-blue-700 text-sm">This step will integrate with the enhanced PopulationService backend for demographic generation</p>
                  </div>
                </div>
                
                <Link
                  href="/v2/population-builder"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Open Advanced Population Builder
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Demographics */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Quick Demographics</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Population Size</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                        <option>50 agents</option>
                        <option>100 agents</option>
                        <option>200 agents</option>
                        <option>500 agents</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Demographic Template</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                        <option>USA Demographics</option>
                        <option>EU Demographics</option>
                        <option>UK Demographics</option>
                        <option>Custom</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Personality Fragments */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Personality Traits</h4>
                  <div className="space-y-3">
                    {['Health Conscious', 'Price Sensitive', 'Tech Savvy', 'Brand Loyal'].map((trait) => (
                      <label key={trait} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">{trait}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Population Preview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Population Preview</h4>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-2">
                      <span>Total Agents:</span>
                      <span className="font-medium">100</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Age Range:</span>
                      <span className="font-medium">18-65</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Segments:</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Cost:</span>
                      <span className="font-medium text-blue-600">$15.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Design Intervention */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Design Your Intervention</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Create the content and configure the experimental conditions for your simulation. Define what your agents will experience and how you'll measure their responses.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900">Intervention Designer Integration</h3>
                    <p className="text-amber-700 text-sm">This step requires the InterventionTestingEngine backend module to be fully implemented</p>
                  </div>
                </div>
                
                <Link
                  href="/v2/intervention-designer"
                  className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Open Advanced Intervention Designer
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Intervention Content</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Message</label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-500"
                        placeholder="Enter the primary content your agents will experience..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900">
                          <option>Email</option>
                          <option>Social Media</option>
                          <option>In-App</option>
                          <option>Direct Message</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timing</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-gray-900">
                          <option>Immediate</option>
                          <option>Morning</option>
                          <option>Afternoon</option>
                          <option>Evening</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTemplate?.id === 'ab-test' && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-4">A/B Test Variants</h4>
                    <div className="space-y-4">
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Variant A (Control)</span>
                          <span className="text-sm bg-gray-200 px-2 py-1 rounded">50%</span>
                        </div>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                          placeholder="Control message content..."
                        />
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">Variant B (Test)</span>
                          <span className="text-sm bg-gray-200 px-2 py-1 rounded">50%</span>
                        </div>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                          placeholder="Test message content..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Configure Analysis */}
          {currentStep === 4 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Configure Analysis & Launch</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Set up monitoring, define success metrics, and launch your simulation. Results will be available in real-time through the analytics dashboard.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Success Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {['Response Rate', 'Engagement Score', 'Sentiment Analysis', 'Purchase Intent'].map((metric) => (
                        <label key={metric} className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">{metric}</span>
                        </label>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {['Theme Extraction', 'Individual Responses', 'Demographic Breakdown', 'Statistical Significance'].map((metric) => (
                        <label key={metric} className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">{metric}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Simulation Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Interaction Rounds</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900">
                          <option>1 round</option>
                          <option>3 rounds</option>
                          <option>5 rounds</option>
                          <option>10 rounds</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Real-time Monitoring</label>
                        <div className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">Enable live progress tracking</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Launch Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Simulation Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                          placeholder="Enter simulation name..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Launch Schedule</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900">
                          <option>Launch immediately</option>
                          <option>Schedule for later</option>
                          <option>Save as draft</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-green-900 mb-2">Ready to Launch</h4>
                      <p className="text-green-700 text-sm">Your simulation is configured and ready to run. Click launch to begin execution.</p>
                    </div>
                    <button className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center">
                      Launch Simulation
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M4 6h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="border-t border-gray-200 px-8 py-4 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !selectedTemplate}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  currentStep === 1 && !selectedTemplate
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next Step
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : (
              <Link
                href="/v2/results-analytics"
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium flex items-center"
              >
                View Results
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}