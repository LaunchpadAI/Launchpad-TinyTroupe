'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TinyTroupeApiClient } from '@tinytroupe/api-client';

export default function Home() {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            TinyTroupe Complete Platform
          </h1>
          <p className="mt-2 text-gray-600">
            Comprehensive testing interface for all TinyTroupe capabilities including Phase 4 advanced features
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Enhanced Worlds
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Content Enhancement
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Grounding System
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Document Creation
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* API Status Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              API Status
            </h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${ 
                apiStatus === 'healthy' ? 'bg-green-500' :
                apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">
                {apiStatus === 'healthy' ? 'API is healthy' :
                 apiStatus === 'error' ? 'API is down' : 'Checking API...'}
              </span>
              <button
                onClick={checkApiHealth}
                className="ml-4 text-sm text-blue-600 hover:text-blue-500"
              >
                Refresh
              </button>
            </div>
            {healthData && (
              <div className="mt-4 text-sm text-gray-600">
                <p>Version: {healthData.version}</p>
                <p>Personas: {healthData.personas_count || 0}</p>
                <p>Simulations: {healthData.simulations_count || 0}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Cards - Core Features */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Core TinyTroupe Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/personas" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    Persona Management
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Test persona creation, loading, and validation endpoints
                  </p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      • Load existing agents (Lisa, Oscar, Marcos)<br/>
                      • Generate demographic samples<br/>
                      • Apply behavioral fragments<br/>
                      • Validate personas
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/research" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    Market Research
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Test product evaluation, ad testing, and segment analysis
                  </p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      • Product evaluation research<br/>
                      • Advertisement testing<br/>
                      • Market segment analysis<br/>
                      • Statistical results
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/simulations" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    Simulations
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Test focus groups, individual interactions, and social simulations
                  </p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      • Individual interactions<br/>
                      • Focus group discussions<br/>
                      • Social simulations<br/>
                      • Real-time monitoring
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/examples" className="group">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-orange-600">
                    Advanced Examples
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Test advanced TinyTroupe capabilities and examples
                  </p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      • TV Advertisement Creation<br/>
                      • Customer Interviews<br/>
                      • Creative Brainstorming<br/>
                      • AI Storytelling
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Phase 4 Advanced Features */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 Phase 4 Advanced Features
            <span className="ml-2 text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded">NEW</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/worlds" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow border border-purple-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600">
                    Enhanced Worlds
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Multi-environment simulations with social networks and temporal progression
                  </p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      • Multi-environment simulations<br/>
                      • Social network dynamics<br/>
                      • Investment firm consultations<br/>
                      • Temporal world progression
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/content" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow border border-blue-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    Content Enhancement
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    AI-powered content enrichment and professional styling
                  </p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      • Content enrichment (5x expansion)<br/>
                      • Professional styling<br/>
                      • Context-aware processing<br/>
                      • Enhancement history
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/grounding" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow border border-green-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
                    Grounding System
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Connect agents to real data sources and documents
                  </p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      • Local files integration<br/>
                      • Web page grounding<br/>
                      • Document querying<br/>
                      • Multi-source data
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/documents" className="group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow border border-orange-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-orange-600">
                    Document Creation
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Professional document generation with TinyWordProcessor
                  </p>
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      • Multi-format export (MD, DOCX, PDF)<br/>
                      • Grounded documents<br/>
                      • Content enrichment<br/>
                      • Professional formatting
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Test Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Core Features */}
              <button
                onClick={() => window.location.href = '/personas?action=load-lisa'}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="font-medium text-gray-900">Load Lisa Persona</div>
                <div className="text-sm text-gray-600">Test loading existing agent</div>
              </button>
              
              <button
                onClick={() => window.location.href = '/research?template=gazpacho'}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="font-medium text-gray-900">Gazpacho Research</div>
                <div className="text-sm text-gray-600">Test product evaluation</div>
              </button>
              
              <button
                onClick={() => window.location.href = '/simulations?type=focus-group'}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="font-medium text-gray-900">Focus Group</div>
                <div className="text-sm text-gray-600">Test group simulation</div>
              </button>

              {/* Phase 4 Advanced Features */}
              <button
                onClick={() => window.location.href = '/worlds'}
                className="text-left p-4 border border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50"
              >
                <div className="font-medium text-gray-900">Multi-Environment</div>
                <div className="text-sm text-gray-600">Advanced world simulation</div>
              </button>

              <button
                onClick={() => window.location.href = '/content'}
                className="text-left p-4 border border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="font-medium text-gray-900">Content Enhancement</div>
                <div className="text-sm text-gray-600">AI-powered content enrichment</div>
              </button>

              <button
                onClick={() => window.location.href = '/documents'}
                className="text-left p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50"
              >
                <div className="font-medium text-gray-900">Create Document</div>
                <div className="text-sm text-gray-600">Professional document generation</div>
              </button>
            </div>
          </div>
        </div>

        {/* Professional Interface Access */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready for Professional Workflows?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Experience the advanced TinyTroupe Platform v2 with drag-and-drop simulation designer, 
              advanced population builder, and comprehensive analytics suite.
            </p>
            <Link 
              href="/v2"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Launch TinyTroupe Platform v2
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
