'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

interface LiveSimulation {
  id: string;
  name: string;
  type: string;
  status: 'initializing' | 'running' | 'paused' | 'completed' | 'error';
  startTime: string;
  progress: number;
  currentRound: number;
  totalRounds: number;
  activeAgents: number;
  totalAgents: number;
  responseRate: number;
  errorCount: number;
  averageResponseTime: number;
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'agent_response' | 'round_complete' | 'error' | 'milestone';
  agentId?: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  activeConnections: number;
  memoryUsage: number;
  errorRate: number;
}

// Mock live data
const MOCK_LIVE_SIMULATIONS: LiveSimulation[] = [
  {
    id: 'live_001',
    name: 'Product Feature A/B Test',
    type: 'A/B Intervention Test',
    status: 'running',
    startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    progress: 67,
    currentRound: 2,
    totalRounds: 3,
    activeAgents: 143,
    totalAgents: 200,
    responseRate: 89,
    errorCount: 2,
    averageResponseTime: 1.8
  },
  {
    id: 'live_002',
    name: 'Customer Journey Mapping',
    type: 'Customer Journey Simulation',
    status: 'paused',
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    progress: 34,
    currentRound: 3,
    totalRounds: 8,
    activeAgents: 0,
    totalAgents: 75,
    responseRate: 92,
    errorCount: 0,
    averageResponseTime: 2.1
  }
];

const MOCK_RECENT_EVENTS: ActivityEvent[] = [
  {
    id: 'event_001',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    type: 'agent_response',
    agentId: 'agent_142',
    message: 'Agent Sarah Chen completed response to variant A',
    severity: 'success'
  },
  {
    id: 'event_002',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    type: 'milestone',
    message: 'Reached 75% completion milestone',
    severity: 'success'
  },
  {
    id: 'event_003',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    type: 'error',
    agentId: 'agent_089',
    message: 'Agent timeout - retrying connection',
    severity: 'warning'
  },
  {
    id: 'event_004',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    type: 'round_complete',
    message: 'Round 2 completed successfully',
    severity: 'info'
  }
];

// Generate mock performance data
const generatePerformanceData = () => {
  const data: PerformanceMetric[] = [];
  const now = Date.now();
  
  for (let i = 29; i >= 0; i--) {
    data.push({
      timestamp: new Date(now - i * 2000).toISOString().slice(11, 19),
      responseTime: 1.2 + Math.random() * 1.5,
      activeConnections: 140 + Math.floor(Math.random() * 20),
      memoryUsage: 65 + Math.random() * 15,
      errorRate: Math.random() * 2
    });
  }
  
  return data;
};

const STATUS_COLORS = {
  initializing: 'bg-yellow-100 text-yellow-800',
  running: 'bg-green-100 text-green-800',
  paused: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800'
};

const EVENT_ICONS = {
  agent_response: '👤',
  round_complete: '🎯',
  error: '⚠️',
  milestone: '🏆'
};

export default function RealTimeMonitoring() {
  const [liveSimulations, setLiveSimulations] = useState<LiveSimulation[]>(MOCK_LIVE_SIMULATIONS);
  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>(MOCK_RECENT_EVENTS);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>(generatePerformanceData());
  const [selectedSimulation, setSelectedSimulation] = useState<LiveSimulation | null>(MOCK_LIVE_SIMULATIONS[0]);
  const [isConnected, setIsConnected] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update performance data
      setPerformanceData(prev => {
        const newData = [...prev.slice(1)];
        const lastTime = new Date(Date.now()).toISOString().slice(11, 19);
        newData.push({
          timestamp: lastTime,
          responseTime: 1.2 + Math.random() * 1.5,
          activeConnections: 140 + Math.floor(Math.random() * 20),
          memoryUsage: 65 + Math.random() * 15,
          errorRate: Math.random() * 2
        });
        return newData;
      });

      // Occasionally update simulation progress
      if (Math.random() < 0.3) {
        setLiveSimulations(prev => 
          prev.map(sim => 
            sim.status === 'running' ? {
              ...sim,
              progress: Math.min(100, sim.progress + Math.random() * 5),
              activeAgents: Math.max(0, sim.activeAgents + Math.floor((Math.random() - 0.5) * 10))
            } : sim
          )
        );
      }

      // Add new events occasionally
      if (Math.random() < 0.2) {
        const newEvent: ActivityEvent = {
          id: `event_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: ['agent_response', 'milestone', 'error'][Math.floor(Math.random() * 3)] as any,
          message: [
            'Agent completed response',
            'Reached new milestone',
            'Minor processing delay'
          ][Math.floor(Math.random() * 3)],
          severity: ['success', 'info', 'warning'][Math.floor(Math.random() * 3)] as any
        };
        
        setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleSimulationAction = (simulationId: string, action: 'pause' | 'resume' | 'stop') => {
    setLiveSimulations(prev => 
      prev.map(sim => 
        sim.id === simulationId ? {
          ...sim,
          status: action === 'pause' ? 'paused' : action === 'resume' ? 'running' : 'completed'
        } : sim
      )
    );

    const newEvent: ActivityEvent = {
      id: `event_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'milestone',
      message: `Simulation ${action}d by user`,
      severity: 'info'
    };
    
    setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)]);
  };

  const formatDuration = (startTime: string) => {
    const duration = Date.now() - new Date(startTime).getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100">
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Real-time Monitor
                </h1>
                <p className="text-gray-600 mt-1">Live tracking of simulation progress and agent activity</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  autoRefresh ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Monitoring Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Simulations */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Simulations</h2>
              
              <div className="space-y-4">
                {liveSimulations.map((simulation) => (
                  <div key={simulation.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{simulation.name}</h3>
                        <p className="text-sm text-gray-500">{simulation.type}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[simulation.status]}`}>
                          {simulation.status.charAt(0).toUpperCase() + simulation.status.slice(1)}
                        </span>
                        <div className="flex space-x-2">
                          {simulation.status === 'running' ? (
                            <button
                              onClick={() => handleSimulationAction(simulation.id, 'pause')}
                              className="p-2 text-gray-400 hover:text-yellow-600"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          ) : simulation.status === 'paused' ? (
                            <button
                              onClick={() => handleSimulationAction(simulation.id, 'resume')}
                              className="p-2 text-gray-400 hover:text-green-600"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleSimulationAction(simulation.id, 'stop')}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{simulation.progress}%</div>
                        <div className="text-sm text-gray-500">Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{simulation.activeAgents}</div>
                        <div className="text-sm text-gray-500">Active Agents</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{simulation.responseRate}%</div>
                        <div className="text-sm text-gray-500">Response Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{formatDuration(simulation.startTime)}</div>
                        <div className="text-sm text-gray-500">Running Time</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${simulation.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Round {simulation.currentRound} of {simulation.totalRounds}</span>
                      <span>{simulation.totalAgents} total agents</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Performance</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Response Time */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Time (seconds)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceData}>
                      <Line type="monotone" dataKey="responseTime" stroke="#EF4444" strokeWidth={2} />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Active Connections */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Connections</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={performanceData}>
                      <Area type="monotone" dataKey="activeConnections" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Tooltip />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Panel */}
          <div className="space-y-6">
            
            {/* System Status */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }} />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Simulations</span>
                  <span className="font-medium">{liveSimulations.filter(s => s.status === 'running').length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Queue Length</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{EVENT_ICONS[event.type]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{event.message}</div>
                      <div className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</div>
                    </div>
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      event.severity === 'success' ? 'bg-green-500' :
                      event.severity === 'warning' ? 'bg-yellow-500' :
                      event.severity === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left">
                  📊 View All Results
                </button>
                <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-left">
                  🚀 Start New Simulation
                </button>
                <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-left">
                  ⏸️ Pause All Active
                </button>
                <button className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-left">
                  📁 Export Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}