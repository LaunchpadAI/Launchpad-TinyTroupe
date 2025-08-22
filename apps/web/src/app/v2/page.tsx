'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TinyTroupeApiClient } from '@tinytroupe/api-client';

export default function V2Home() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'healthy' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);

  const client = new TinyTroupeApiClient();

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const health = await client.health();
      setHealthData(health);
      setApiStatus('healthy');
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TinyTroupe Platform v2
              </h1>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl">
                Professional simulation platform for intervention testing, market research, and behavioral analysis
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                apiStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                apiStatus === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  apiStatus === 'healthy' ? 'bg-green-500' :
                  apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                {apiStatus === 'healthy' ? 'API Connected' :
                 apiStatus === 'error' ? 'API Offline' : 'Connecting...'}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {healthData && `${healthData.personas_count || 0} agents available`}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Core Workflow Cards */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Professional Simulation Workflows</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create, execute, and analyze complex behavioral simulations with our enterprise-grade workflow builder
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Simulation Designer */}
            <Link href="/v2/simulation-designer" className="group">
              <div className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-300" />
                <div className="relative p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 ml-4 group-hover:text-blue-600 transition-colors">
                      Simulation Designer
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-lg mb-6">
                    Visual drag-and-drop workflow builder for creating complex simulations with templates and guided setup
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                      <span>Template Library (Survey, Focus Group, A/B Test)</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                      <span>Guided 4-Step Workflow Builder</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      <span>Real-time Configuration Validation</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                    <span>Start Building</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Results Analytics */}
            <Link href="/v2/results-analytics" className="group">
              <div className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
                <div className="relative p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 ml-4 group-hover:text-emerald-600 transition-colors">
                      Results Analytics
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-lg mb-6">
                    Advanced analytics suite with individual agent exploration, segment comparison, and statistical testing
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                      <span>Individual Agent Response Tracking</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mr-3" />
                      <span>Statistical Significance Testing</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      <span>Multi-format Data Export</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center text-emerald-600 font-medium group-hover:text-emerald-700">
                    <span>Explore Analytics</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Secondary Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Population Builder */}
            <Link href="/v2/population-builder" className="group">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 ml-3 group-hover:text-violet-600 transition-colors">
                    Population Builder
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Configure agent demographics and personalities with advanced segmentation controls
                </p>
                <div className="text-sm text-gray-500">
                  • Demographic slider controls<br/>
                  • 16 personality fragments<br/>
                  • Cost estimation & visualization
                </div>
              </div>
            </Link>

            {/* Intervention Designer */}
            <Link href="/v2/intervention-designer" className="group">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 ml-3 group-hover:text-amber-600 transition-colors">
                    Intervention Designer
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Create and configure intervention experiments with A/B testing capabilities
                </p>
                <div className="text-sm text-gray-500">
                  • Variant editor with rich content<br/>
                  • Timing & channel configuration<br/>
                  • Success metrics tracking
                </div>
              </div>
            </Link>

            {/* Real-time Monitor */}
            <Link href="/v2/monitoring" className="group">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h3a1 1 0 011 1v2h4a1 1 0 011 1v3a1 1 0 01-1 1h-2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V9H4a1 1 0 01-1-1V5a1 1 0 011-1h3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 ml-3 group-hover:text-red-600 transition-colors">
                    Real-time Monitor
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Track simulation progress with live response monitoring and agent activity
                </p>
                <div className="text-sm text-gray-500">
                  • Live response tracking<br/>
                  • Agent activity heatmaps<br/>
                  • Error monitoring & alerts
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Templates */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Market Research Survey */}
            <button
              onClick={() => window.location.href = '/v2/simulation-designer?template=market-research'}
              className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 text-lg mb-2">Market Research Survey</div>
              <div className="text-sm text-gray-600">50-200 agents • Quantitative analysis • Demographic breakdown</div>
            </button>

            {/* Focus Group */}
            <button
              onClick={() => window.location.href = '/v2/simulation-designer?template=focus-group'}
              className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 text-lg mb-2">Focus Group Discussion</div>
              <div className="text-sm text-gray-600">5-8 agents • Open discussion • Qualitative insights</div>
            </button>

            {/* A/B Test */}
            <button
              onClick={() => window.location.href = '/v2/simulation-designer?template=ab-test'}
              className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-violet-200">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 text-lg mb-2">A/B Intervention Test</div>
              <div className="text-sm text-gray-600">Split populations • Multiple variants • Statistical comparison</div>
            </button>

            {/* Customer Journey */}
            <button
              onClick={() => window.location.href = '/v2/simulation-designer?template=customer-journey'}
              className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="font-bold text-gray-900 text-lg mb-2">Customer Journey</div>
              <div className="text-sm text-gray-600">Sequential interventions • Behavioral tracking • Conversion analysis</div>
            </button>
          </div>
        </div>

        {/* Legacy Access */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gray-100 rounded-full">
            <span className="text-gray-600 mr-3">Need API testing tools?</span>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Access Legacy Interface →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}