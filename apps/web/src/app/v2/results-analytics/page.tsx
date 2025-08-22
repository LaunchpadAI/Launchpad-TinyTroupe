'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadialBarChart, RadialBar
} from 'recharts';
import { useInterventions, useInterventionResults } from '@/hooks/useApi';

interface SimulationResult {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  totalAgents: number;
  responseRate: number;
  engagementScore: number;
  variants?: string[];
}

interface IndividualResponse {
  agentId: string;
  agentName: string;
  demographicProfile: {
    age: number;
    income: string;
    location: string;
    fragments: string[];
  };
  responses: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  engagementScore: number;
  keyPoints: string[];
  metadata: Record<string, any>;
}

interface AggregateInsights {
  totalResponses: number;
  averageEngagement: number;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  topThemes: { theme: string; frequency: number; sentiment: number }[];
  demographicBreakdown: Record<string, any>;
  responsePatterns: { pattern: string; frequency: number }[];
}

// Mock data for demonstration
const MOCK_SIMULATIONS: SimulationResult[] = [
  {
    id: 'sim_001',
    name: 'Gazpacho Market Research',
    type: 'Market Research Survey',
    status: 'completed',
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T10:45:00Z',
    totalAgents: 150,
    responseRate: 87,
    engagementScore: 7.8
  },
  {
    id: 'sim_002',
    name: 'Email Campaign A/B Test',
    type: 'A/B Intervention Test',
    status: 'completed',
    startTime: '2024-01-14T14:30:00Z',
    endTime: '2024-01-14T15:15:00Z',
    totalAgents: 200,
    responseRate: 73,
    engagementScore: 6.9,
    variants: ['Emotional Appeal', 'Rational Appeal']
  },
  {
    id: 'sim_003',
    name: 'Product Feature Focus Group',
    type: 'Focus Group Discussion',
    status: 'running',
    startTime: '2024-01-16T09:00:00Z',
    totalAgents: 8,
    responseRate: 100,
    engagementScore: 8.5
  }
];

const MOCK_INDIVIDUAL_RESPONSES: IndividualResponse[] = [
  {
    agentId: 'agent_001',
    agentName: 'Sarah Chen',
    demographicProfile: {
      age: 32,
      income: 'Middle ($40-80k)',
      location: 'Urban',
      fragments: ['tech_savvy', 'health_conscious', 'time_constrained']
    },
    responses: [
      'I think this gazpacho sounds refreshing and perfect for busy weekdays.',
      'The organic ingredients are important to me, but the price point might be a concern.'
    ],
    sentiment: 'positive',
    engagementScore: 8.2,
    keyPoints: ['convenience', 'organic ingredients', 'price sensitivity'],
    metadata: { sessionDuration: 245, interactionCount: 3 }
  },
  {
    agentId: 'agent_002',
    agentName: 'Michael Rodriguez',
    demographicProfile: {
      age: 45,
      income: 'High ($80k+)',
      location: 'Suburban',
      fragments: ['quality_focused', 'brand_loyal', 'conservative']
    },
    responses: [
      'I prefer traditional brands when it comes to food products.',
      'The gazpacho concept is interesting but I would need to see proven quality standards.'
    ],
    sentiment: 'neutral',
    engagementScore: 6.7,
    keyPoints: ['brand trust', 'quality assurance', 'traditional preferences'],
    metadata: { sessionDuration: 180, interactionCount: 2 }
  }
];

const MOCK_INSIGHTS: AggregateInsights = {
  totalResponses: 150,
  averageEngagement: 7.8,
  sentimentDistribution: { positive: 62, neutral: 28, negative: 10 },
  topThemes: [
    { theme: 'Convenience', frequency: 45, sentiment: 0.8 },
    { theme: 'Price', frequency: 38, sentiment: 0.3 },
    { theme: 'Quality', frequency: 32, sentiment: 0.7 },
    { theme: 'Health Benefits', frequency: 28, sentiment: 0.9 },
    { theme: 'Brand Trust', frequency: 22, sentiment: 0.5 }
  ],
  demographicBreakdown: {
    age: { '18-25': 15, '26-35': 35, '36-45': 25, '46-55': 18, '56-65': 7 },
    income: { 'Low': 20, 'Middle': 55, 'High': 25 },
    location: { 'Urban': 45, 'Suburban': 40, 'Rural': 15 }
  },
  responsePatterns: [
    { pattern: 'Price-conscious with quality focus', frequency: 34 },
    { pattern: 'Health-oriented early adopters', frequency: 28 },
    { pattern: 'Convenience-seeking professionals', frequency: 42 },
    { pattern: 'Traditional brand loyalists', frequency: 23 }
  ]
};

const SENTIMENT_COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B', 
  negative: '#EF4444'
};

const DEMOGRAPHIC_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ResultsAnalytics() {
  const { data: interventions, loading: loadingInterventions } = useInterventions('completed');
  const [selectedIntervention, setSelectedIntervention] = useState<string | null>(null);
  const { data: results, loading: loadingResults } = useInterventionResults(selectedIntervention);
  const [activeTab, setActiveTab] = useState<'overview' | 'individual' | 'segments' | 'export'>('overview');
  const [selectedAgent, setSelectedAgent] = useState<IndividualResponse | null>(null);

  // Use first intervention if available
  useEffect(() => {
    if (interventions && interventions.length > 0 && !selectedIntervention) {
      setSelectedIntervention(interventions[0].intervention_id);
    }
  }, [interventions, selectedIntervention]);

  const selectedInterventionData = interventions?.find(i => i.intervention_id === selectedIntervention);

  // Convert intervention to simulation format for compatibility
  const selectedSimulation: SimulationResult | null = selectedInterventionData ? {
    id: selectedInterventionData.intervention_id,
    name: selectedInterventionData.name,
    type: selectedInterventionData.type,
    status: selectedInterventionData.status === 'completed' ? 'completed' : 
            selectedInterventionData.status === 'running' ? 'running' : 'failed',
    startTime: selectedInterventionData.started_at || selectedInterventionData.created_at,
    endTime: selectedInterventionData.completed_at,
    totalAgents: selectedInterventionData.total_participants,
    responseRate: results?.completion_rate ? Math.round(results.completion_rate * 100) : 0,
    engagementScore: results?.overall_metrics?.average_engagement || 0,
    variants: selectedInterventionData.variants.map(v => v.name)
  } : null;

  const engagementTrendData = [
    { time: '10:00', engagement: 7.2, responses: 12 },
    { time: '10:15', engagement: 7.8, responses: 45 },
    { time: '10:30', engagement: 8.1, responses: 78 },
    { time: '10:45', engagement: 7.9, responses: 98 }
  ];

  const sentimentData = [
    { name: 'Positive', value: MOCK_INSIGHTS.sentimentDistribution.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: MOCK_INSIGHTS.sentimentDistribution.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: MOCK_INSIGHTS.sentimentDistribution.negative, color: SENTIMENT_COLORS.negative }
  ];

  const demographicAgeData = Object.entries(MOCK_INSIGHTS.demographicBreakdown.age).map(([age, value]) => ({
    age,
    value: value as number
  }));

  const themeAnalysisData = MOCK_INSIGHTS.topThemes.map(theme => ({
    theme: theme.theme,
    frequency: theme.frequency,
    sentiment: theme.sentiment * 10
  }));

  const handleExportData = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exporting data in ${format} format for simulation:`, selectedSimulation?.id);
    alert(`Export initiated for ${selectedSimulation?.name}\n\nFormat: ${format.toUpperCase()}\n\nThis would integrate with the enhanced SimulationService export functionality.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-100">
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Results Analytics
                </h1>
                <p className="text-gray-600 mt-1">Comprehensive analysis and reporting for simulation results</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedIntervention || ''}
                onChange={(e) => {
                  setSelectedIntervention(e.target.value);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                disabled={loadingInterventions}
              >
                {loadingInterventions ? (
                  <option>Loading interventions...</option>
                ) : interventions && interventions.length > 0 ? (
                  interventions.map(intervention => (
                    <option key={intervention.intervention_id} value={intervention.intervention_id}>
                      {intervention.name}
                    </option>
                  ))
                ) : (
                  <option>No completed interventions</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {selectedSimulation && (
          <>
            {/* Simulation Summary */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSimulation.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedSimulation.type}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedSimulation.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedSimulation.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedSimulation.status.charAt(0).toUpperCase() + selectedSimulation.status.slice(1)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">{selectedSimulation.totalAgents}</div>
                  <div className="text-blue-100 text-sm">Total Agents</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">{selectedSimulation.responseRate}%</div>
                  <div className="text-green-100 text-sm">Response Rate</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">{selectedSimulation.engagementScore}/10</div>
                  <div className="text-purple-100 text-sm">Avg Engagement</div>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">
                    {selectedSimulation.endTime ? 
                      `${Math.round((new Date(selectedSimulation.endTime).getTime() - new Date(selectedSimulation.startTime).getTime()) / (1000 * 60))}m` :
                      'Running'
                    }
                  </div>
                  <div className="text-teal-100 text-sm">Duration</div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: '📊' },
                  { id: 'individual', name: 'Individual Agents', icon: '👤' },
                  { id: 'segments', name: 'Segment Analysis', icon: '📈' },
                  { id: 'export', name: 'Export Data', icon: '📁' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-white shadow-lg text-teal-600 border border-gray-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Engagement Trend */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Engagement Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="engagement" stroke="#0D9488" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Sentiment Distribution */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}%`}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Theme Analysis */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Theme Analysis</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={themeAnalysisData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="theme" width={100} />
                      <Tooltip />
                      <Bar dataKey="frequency" fill="#0D9488" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Demographic Breakdown */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Age Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={demographicAgeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0891B2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'individual' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Agent List */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Individual Agent Responses</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {MOCK_INDIVIDUAL_RESPONSES.map((agent) => (
                      <button
                        key={agent.agentId}
                        onClick={() => setSelectedAgent(agent)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedAgent?.agentId === agent.agentId 
                            ? 'border-teal-500 bg-teal-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{agent.agentName}</div>
                          <div className={`w-3 h-3 rounded-full ${
                            agent.sentiment === 'positive' ? 'bg-green-500' :
                            agent.sentiment === 'neutral' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Age {agent.demographicProfile.age} • {agent.demographicProfile.income} • {agent.demographicProfile.location}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {agent.responses[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent Detail */}
                {selectedAgent && (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Agent Details: {selectedAgent.agentName}</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Demographic Profile</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Age: {selectedAgent.demographicProfile.age}</div>
                          <div>Income: {selectedAgent.demographicProfile.income}</div>
                          <div>Location: {selectedAgent.demographicProfile.location}</div>
                          <div>Engagement: {selectedAgent.engagementScore}/10</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Personality Fragments</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.demographicProfile.fragments.map(fragment => (
                            <span key={fragment} className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">
                              {fragment.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Responses</h4>
                        <div className="space-y-2">
                          {selectedAgent.responses.map((response, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                              {response}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Key Points</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.keyPoints.map(point => (
                            <span key={point} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {point}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'segments' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Response Patterns */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Response Patterns</h3>
                  <div className="space-y-4">
                    {MOCK_INSIGHTS.responsePatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{pattern.pattern}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${(pattern.frequency / 50) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-sm font-medium text-gray-600">{pattern.frequency}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistical Significance */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Statistical Analysis</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-green-900">Results are statistically significant</span>
                      </div>
                      <div className="text-sm text-green-700">
                        p-value: 0.001 (highly significant)
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Confidence Interval</div>
                        <div className="text-lg font-bold text-gray-900">95%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Effect Size</div>
                        <div className="text-lg font-bold text-gray-900">0.73</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Sample Size</div>
                        <div className="text-lg font-bold text-gray-900">{selectedSimulation.totalAgents}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Power Analysis</div>
                        <div className="text-lg font-bold text-gray-900">0.95</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Export Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* CSV Export */}
                  <div className="border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 ml-3">CSV Export</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Export all data in CSV format for spreadsheet analysis
                    </p>
                    <button
                      onClick={() => handleExportData('csv')}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Download CSV
                    </button>
                  </div>

                  {/* JSON Export */}
                  <div className="border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 ml-3">JSON Export</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Export structured data in JSON format for API integration
                    </p>
                    <button
                      onClick={() => handleExportData('json')}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Download JSON
                    </button>
                  </div>

                  {/* PDF Report */}
                  <div className="border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 ml-3">PDF Report</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Generate professional report with charts and insights
                    </p>
                    <button
                      onClick={() => handleExportData('pdf')}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Generate PDF
                    </button>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Export Options</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" defaultChecked />
                        <span className="text-sm text-gray-700">Include individual agent responses</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" defaultChecked />
                        <span className="text-sm text-gray-700">Include demographic breakdowns</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                        <span className="text-sm text-gray-700">Include raw interaction logs</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" defaultChecked />
                        <span className="text-sm text-gray-700">Include statistical analysis</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}