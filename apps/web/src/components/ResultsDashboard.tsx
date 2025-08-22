'use client';

import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend
} from 'recharts';
import * as stats from 'simple-statistics';
import clsx from 'clsx';

interface SimulationResult {
  simulation_id: string;
  status: string;
  participants?: any[];
  interactions?: any[];
  extracted_insights?: any;
  statistical_analysis?: any;
  [key: string]: any;
}

interface ResultsDashboardProps {
  results: SimulationResult;
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ResultsDashboard({ results, className }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'interactions' | 'raw'>('overview');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  // Process data for visualizations
  const processInteractionData = () => {
    if (!results.interactions || !Array.isArray(results.interactions)) {
      return [];
    }

    return results.interactions.map((interaction: any, index: number) => ({
      turn: index + 1,
      speaker: interaction.speaker || `Turn ${index + 1}`,
      length: interaction.message?.length || interaction.content?.length || 0,
      sentiment: Math.random() > 0.5 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative', // Mock sentiment
      timestamp: interaction.timestamp || new Date().toISOString()
    }));
  };

  const processParticipantData = () => {
    if (!results.participants || !Array.isArray(results.participants)) {
      return [];
    }

    return results.participants.map((participant: any) => ({
      name: participant.name || participant.id || 'Unknown',
      responses: Math.floor(Math.random() * 10) + 1, // Mock response count
      sentiment: Math.random(), // Mock sentiment score 0-1
      engagement: Math.random(), // Mock engagement score 0-1
      key_points: Math.floor(Math.random() * 5) + 1 // Mock key points
    }));
  };

  const processSentimentData = () => {
    const interactions = processInteractionData();
    const sentimentCounts = interactions.reduce((acc: any, curr: any) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(sentimentCounts).map(([sentiment, count], index) => ({
      name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      value: count as number,
      fill: COLORS[index % COLORS.length]
    }));
  };

  const processEngagementOverTime = () => {
    const interactions = processInteractionData();
    return interactions.map((interaction, index) => ({
      turn: interaction.turn,
      engagement: 0.3 + Math.random() * 0.7, // Mock engagement score
      cumulative_turns: index + 1
    }));
  };

  const calculateStatistics = () => {
    const interactions = processInteractionData();
    const participants = processParticipantData();
    
    if (interactions.length === 0 || participants.length === 0) {
      return null;
    }

    const responseLengths = interactions.map(i => i.length).filter(l => l > 0);
    const participantEngagement = participants.map(p => p.engagement);

    return {
      total_turns: interactions.length,
      avg_response_length: responseLengths.length > 0 ? Math.round(stats.mean(responseLengths)) : 0,
      median_response_length: responseLengths.length > 0 ? Math.round(stats.median(responseLengths)) : 0,
      avg_engagement: participantEngagement.length > 0 ? (stats.mean(participantEngagement) * 100).toFixed(1) : '0.0',
      total_participants: participants.length,
      completion_rate: results.status === 'completed' ? '100%' : '0%'
    };
  };

  const exportToCSV = () => {
    const interactions = processInteractionData();
    const csvContent = [
      ['Turn', 'Speaker', 'Length', 'Sentiment', 'Timestamp'],
      ...interactions.map(i => [i.turn, i.speaker, i.length, i.sentiment, i.timestamp])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-${results.simulation_id}-results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-${results.simulation_id}-full.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const interactionData = processInteractionData();
  const participantData = processParticipantData();
  const sentimentData = processSentimentData();
  const engagementData = processEngagementOverTime();
  const statistics = calculateStatistics();

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-green-900">
              Simulation Results
            </h3>
            <p className="text-sm text-green-700 mt-1">
              ID: {results.simulation_id} • Status: {results.status}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportToCSV}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Export CSV
            </button>
            <button
              onClick={exportToJSON}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'insights', name: 'Insights' },
            { id: 'interactions', name: 'Interactions' },
            { id: 'raw', name: 'Raw Data' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(statistics).map(([key, value]) => (
                  <div key={key} className="bg-white p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Distribution */}
              <div className="bg-white p-4 border rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Sentiment Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Engagement Over Time */}
              <div className="bg-white p-4 border rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Engagement Over Time</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="turn" />
                      <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Engagement']} />
                      <Area type="monotone" dataKey="engagement" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Participant Performance */}
            <div className="bg-white p-4 border rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Participant Performance</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={participantData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="responses" fill="#8884d8" name="Responses" />
                    <Bar dataKey="key_points" fill="#82ca9d" name="Key Points" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {results.extracted_insights ? (
              <div className="bg-white p-6 border rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Extracted Insights</h4>
                <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
                  {JSON.stringify(results.extracted_insights, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800">No structured insights available. Check the raw data tab for complete results.</p>
              </div>
            )}

            {/* Individual Participant Analysis */}
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b">
                <h4 className="text-lg font-medium text-gray-900">Individual Analysis</h4>
                <p className="text-sm text-gray-600">Select a participant to see detailed insights</p>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {participantData.map((participant) => (
                    <button
                      key={participant.name}
                      onClick={() => setSelectedParticipant(participant.name)}
                      className={clsx(
                        'px-3 py-1 rounded text-sm',
                        selectedParticipant === participant.name
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {participant.name}
                    </button>
                  ))}
                </div>

                {selectedParticipant && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    {(() => {
                      const participant = participantData.find(p => p.name === selectedParticipant);
                      return participant ? (
                        <div className="space-y-2">
                          <h5 className="font-medium text-blue-900">{participant.name}</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-700">Responses:</span>
                              <span className="ml-2 font-medium">{participant.responses}</span>
                            </div>
                            <div>
                              <span className="text-blue-700">Engagement:</span>
                              <span className="ml-2 font-medium">{(participant.engagement * 100).toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-blue-700">Key Points:</span>
                              <span className="ml-2 font-medium">{participant.key_points}</span>
                            </div>
                            <div>
                              <span className="text-blue-700">Sentiment:</span>
                              <span className="ml-2 font-medium">{(participant.sentiment * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interactions' && (
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h4 className="text-lg font-medium text-gray-900">Conversation Flow</h4>
              <p className="text-sm text-gray-600">{interactionData.length} total interactions</p>
            </div>
            <div className="max-h-96 overflow-auto">
              {interactionData.length > 0 ? (
                <div className="space-y-3 p-4">
                  {interactionData.map((interaction, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">
                          {interaction.speaker}
                        </span>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className={clsx(
                            'px-2 py-1 rounded',
                            interaction.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            interaction.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {interaction.sentiment}
                          </span>
                          <span className="text-gray-500">{interaction.length} chars</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        Turn {interaction.turn} - Length: {interaction.length} characters
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No interaction data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h4 className="text-lg font-medium text-gray-900">Raw JSON Data</h4>
              <p className="text-sm text-gray-600">Complete simulation response</p>
            </div>
            <div className="p-4">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}