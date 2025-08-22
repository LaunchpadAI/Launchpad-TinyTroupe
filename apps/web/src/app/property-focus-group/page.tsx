'use client';

import { useState } from 'react';
// Note: Using direct fetch instead of TinyTroupeApiClient for this endpoint

interface PropertyDetails {
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  yearBuilt: string;
  style: string;
  features: string;
  neighborhood: string;
  description: string;
}

interface InteractionConfig {
  allow_cross_communication: boolean;
  rounds: number;
  enable_memory: boolean;
  enable_semantic_memory: boolean;
}

interface FocusGroupParticipant {
  id: string;
  name: string;
  profession: string;
  netWorth: string;
  specialty: string;
}

const HIGH_NET_WORTH_PERSONAS: FocusGroupParticipant[] = [
  {
    id: 'tony_parker',
    name: 'Tony Parker',
    profession: 'Former NBA Player',
    netWorth: '$85M',
    specialty: 'Entertainment spaces, sports facilities, international markets'
  },
  {
    id: 'kenny_pickett',
    name: 'Kenny Pickett',
    profession: 'NFL Quarterback',
    netWorth: '$15M',
    specialty: 'Family spaces, technology integration, practical luxury'
  },
  {
    id: 'wayne_gretzky',
    name: 'Wayne Gretzky',
    profession: 'Hockey Legend',
    netWorth: '$250M',
    specialty: 'Classic luxury, entertainment, celebrity privacy'
  },
  {
    id: 'carey_price',
    name: 'Carey Price',
    profession: 'NHL Goaltender',
    netWorth: '$40M',
    specialty: 'Wellness spaces, home gyms, family living'
  },
  {
    id: 'eric_lamaze',
    name: 'Eric Lamaze',
    profession: 'Olympic Equestrian',
    netWorth: '$10M',
    specialty: 'European design, country estates, craftsmanship'
  },
  {
    id: 'brian_griese',
    name: 'Brian Griese',
    profession: 'Former NFL QB/Coach',
    netWorth: '$12M',
    specialty: 'Smart homes, mountain luxury, entertainment spaces'
  },
  {
    id: 'channing_frye',
    name: 'Channing Frye',
    profession: 'Former NBA Forward',
    netWorth: '$20M',
    specialty: 'Colonial architecture, family spaces, fine art integration'
  },
  {
    id: 'tessa_virtue',
    name: 'Tessa Virtue',
    profession: 'Olympic Ice Dancing Champion',
    netWorth: '$8M',
    specialty: 'French design, heritage properties, elegant entertaining'
  },
  {
    id: 'jason_arnott',
    name: 'Jason Arnott',
    profession: 'Former NHL All-Star',
    netWorth: '$15M',
    specialty: 'Contemporary luxury, entertaining, high-end finishes'
  },
  {
    id: 'derrick_johnson',
    name: 'Derrick Johnson',
    profession: 'Former NFL LB/Hall of Famer',
    netWorth: '$25M',
    specialty: 'Texas luxury, family properties, water features'
  },
  {
    id: 'brandon_mcmanus',
    name: 'Brandon McManus',
    profession: 'Former NFL Kicker',
    netWorth: '$8M',
    specialty: 'Smart technology, automation, contemporary design'
  },
  {
    id: 'real_estate',
    name: 'David Chen',
    profession: 'Real Estate Mogul',
    netWorth: '$300M',
    specialty: 'Market trends, renovation ROI, resale value'
  }
];

const MODIFICATION_QUESTIONS = [
  "Should the seller make modifications to increase marketability?",
  "What specific renovations would add the most value (pool, kitchen, rec room, bar, wine cellar, home theater, etc.)?",
  "What type of buyer would be most interested in this property?",
  "What is the ideal price point for this property given the market?",
  "What are the property's strongest selling points?",
  "What are potential concerns buyers might have?"
];

const TEST_PROPERTIES = [
  {
    name: "Beverly Hills Modern Estate",
    data: {
      address: "123 Rodeo Drive, Beverly Hills, CA 90210",
      price: "$12,500,000",
      bedrooms: "6",
      bathrooms: "8",
      sqft: "8,500",
      yearBuilt: "2019",
      style: "Modern Contemporary",
      features: "Pool, Tennis Court, Wine Cellar, Home Theater, Guest House, Smart Home Automation",
      neighborhood: "Beverly Hills Flats",
      description: "Stunning modern estate with panoramic city views. Features include a resort-style pool, regulation tennis court, temperature-controlled wine cellar for 2000+ bottles, state-of-the-art home theater, and separate guest house. The home showcases floor-to-ceiling windows, premium finishes throughout, and comprehensive smart home automation. Located on a private gated lot in the prestigious Beverly Hills Flats."
    }
  },
  {
    name: "Austin Luxury Family Home",
    data: {
      address: "456 Hill Country Drive, Austin, TX 78738",
      price: "$3,750,000",
      bedrooms: "5",
      bathrooms: "6",
      sqft: "6,200",
      yearBuilt: "2020",
      style: "Texas Contemporary",
      features: "Pool with Water Slide, Media Room, Home Gym, Outdoor Kitchen, Game Room",
      neighborhood: "Spanish Oaks",
      description: "Impressive family estate in prestigious Spanish Oaks neighborhood. Features a stunning multi-level pool with water slide, spacious media room, professional home gym, and fully equipped outdoor kitchen. The open floor plan includes a gourmet kitchen with oversized island, formal dining room, and multiple living areas. Perfect for entertaining with large game room and seamless indoor-outdoor flow."
    }
  },
  {
    name: "Denver Smart Home",
    data: {
      address: "789 Mountain View Lane, Denver, CO 80205",
      price: "$3,490,000",
      bedrooms: "6",
      bathrooms: "7",
      sqft: "7,000",
      yearBuilt: "2022",
      style: "Contemporary Mountain",
      features: "Whole-House Automation, Heated Driveways, Home Theater, Gym, Outdoor Kitchen",
      neighborhood: "Polo Club",
      description: "Cutting-edge smart home with comprehensive automation systems. Features include whole-house speakers, mechanical window shades, heated pavers and driveways, automated pool systems, and advanced climate control. The home includes a professional-grade home theater, fully equipped gym, and covered outdoor kitchen with mountain views. All systems controllable via smartphone integration."
    }
  }
];

export default function PropertyFocusGroup() {
  const [property, setProperty] = useState<PropertyDetails>({
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    yearBuilt: '',
    style: '',
    features: '',
    neighborhood: '',
    description: ''
  });

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<string[]>(MODIFICATION_QUESTIONS);
  const [interactionConfig, setInteractionConfig] = useState<InteractionConfig>({
    allow_cross_communication: true,
    rounds: 3,  // Use TinyTroupe standard of 3 rounds like examples
    enable_memory: true,
    enable_semantic_memory: true
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePropertyChange = (field: keyof PropertyDetails, value: string) => {
    setProperty(prev => ({ ...prev, [field]: value }));
  };

  const loadTestProperty = (testProperty: typeof TEST_PROPERTIES[0]) => {
    setProperty(testProperty.data);
  };

  const handleInteractionConfigChange = (field: keyof InteractionConfig, value: boolean | number) => {
    setInteractionConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const runFocusGroup = async () => {
    if (selectedParticipants.length < 3) {
      setError('Please select at least 3 participants');
      return;
    }

    setIsRunning(true);
    setError(null);
    
    try {
      // Create property description stimulus
      const propertyStimulus = `
Property Overview:
- Address: ${property.address}
- Asking Price: ${property.price}
- Size: ${property.sqft} sq ft
- Bedrooms: ${property.bedrooms} | Bathrooms: ${property.bathrooms}
- Year Built: ${property.yearBuilt}
- Style: ${property.style}
- Key Features: ${property.features}
- Neighborhood: ${property.neighborhood}

Description: ${property.description}

As high net worth individuals with experience in luxury real estate, please discuss:
${customQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Please provide specific, actionable recommendations based on your expertise and market knowledge.
      `;

      // Use the direct focus group endpoint
      const response = await fetch('http://localhost:8000/api/v1/simulate/focus-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          simulation_type: 'focus_group',
          participants: {
            mode: 'from_agent',
            specifications: selectedParticipants
          },
          interaction_config: interactionConfig,
          stimulus: {
            type: 'property_evaluation',
            content: propertyStimulus,
            context: {
              property_type: 'luxury_residential',
              market_segment: 'high_net_worth'
            }
          },
          extraction_config: {
            extract_results: true,
            extraction_objective: 'Extract specific renovation recommendations, target buyer profiles, pricing suggestions, and marketing strategies',
            result_type: 'structured'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setResults(result);
      
    } catch (err) {
      console.error('Focus group failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to run focus group');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Luxury Property Focus Group</h1>
        <p className="text-gray-600">
          Get expert feedback from high net worth individuals on property improvements and marketing strategy
        </p>
      </div>

      {/* Property Details Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Property Details</h2>
        
        {/* Test Property Buttons */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-700">Quick Test Examples</h3>
          <div className="flex flex-wrap gap-3">
            {TEST_PROPERTIES.map((testProp, index) => (
              <button
                key={index}
                onClick={() => loadTestProperty(testProp)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
              >
                {testProp.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={property.address}
              onChange={(e) => handlePropertyChange('address', e.target.value)}
              placeholder="123 Luxury Lane, Beverly Hills, CA"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asking Price
            </label>
            <input
              type="text"
              value={property.price}
              onChange={(e) => handlePropertyChange('price', e.target.value)}
              placeholder="$12,500,000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <input
              type="text"
              value={property.bedrooms}
              onChange={(e) => handlePropertyChange('bedrooms', e.target.value)}
              placeholder="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <input
              type="text"
              value={property.bathrooms}
              onChange={(e) => handlePropertyChange('bathrooms', e.target.value)}
              placeholder="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Square Footage
            </label>
            <input
              type="text"
              value={property.sqft}
              onChange={(e) => handlePropertyChange('sqft', e.target.value)}
              placeholder="12,000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Built
            </label>
            <input
              type="text"
              value={property.yearBuilt}
              onChange={(e) => handlePropertyChange('yearBuilt', e.target.value)}
              placeholder="2018"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Architectural Style
            </label>
            <input
              type="text"
              value={property.style}
              onChange={(e) => handlePropertyChange('style', e.target.value)}
              placeholder="Modern Mediterranean"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Neighborhood
            </label>
            <input
              type="text"
              value={property.neighborhood}
              onChange={(e) => handlePropertyChange('neighborhood', e.target.value)}
              placeholder="Beverly Hills Flats"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key Features
          </label>
          <input
            type="text"
            value={property.features}
            onChange={(e) => handlePropertyChange('features', e.target.value)}
            placeholder="Pool, Tennis Court, Wine Cellar, Home Theater, Guest House"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Description
          </label>
          <textarea
            value={property.description}
            onChange={(e) => handlePropertyChange('description', e.target.value)}
            placeholder="Describe the property, its unique features, current condition, and any potential issues..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      {/* Simulation Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Simulation Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discussion Rounds
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={interactionConfig.rounds}
              onChange={(e) => handleInteractionConfigChange('rounds', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="crossCommunication"
              checked={interactionConfig.allow_cross_communication}
              onChange={(e) => handleInteractionConfigChange('allow_cross_communication', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="crossCommunication" className="text-sm font-medium text-gray-700">
              Enable Cross-Communication
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableMemory"
              checked={interactionConfig.enable_memory}
              onChange={(e) => handleInteractionConfigChange('enable_memory', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="enableMemory" className="text-sm font-medium text-gray-700">
              Enable Memory
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="semanticMemory"
              checked={interactionConfig.enable_semantic_memory}
              onChange={(e) => handleInteractionConfigChange('enable_semantic_memory', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="semanticMemory" className="text-sm font-medium text-gray-700">
              Enable Semantic Memory (for document access)
            </label>
          </div>
        </div>
      </div>

      {/* Participant Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Select Focus Group Participants (Choose at least 3)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGH_NET_WORTH_PERSONAS.map(participant => (
            <div
              key={participant.id}
              onClick={() => toggleParticipant(participant.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedParticipants.includes(participant.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-800">{participant.name}</h3>
              <p className="text-sm text-gray-600">{participant.profession}</p>
              <p className="text-sm font-medium text-green-600">{participant.netWorth}</p>
              <p className="text-xs text-gray-500 mt-1">{participant.specialty}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Customization */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Discussion Questions</h2>
        
        <div className="space-y-2">
          {customQuestions.map((question, index) => (
            <div key={index} className="flex items-center">
              <span className="text-gray-500 mr-2">{index + 1}.</span>
              <input
                type="text"
                value={question}
                onChange={(e) => {
                  const newQuestions = [...customQuestions];
                  newQuestions[index] = e.target.value;
                  setCustomQuestions(newQuestions);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setCustomQuestions([...customQuestions, ''])}
          className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
        >
          + Add Question
        </button>
      </div>

      {/* Run Button */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <button
          onClick={runFocusGroup}
          disabled={isRunning || selectedParticipants.length < 3}
          className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors ${
            isRunning || selectedParticipants.length < 3
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Focus Group...' : 'Run Focus Group Discussion'}
        </button>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Results Display */}
      {results && (
        <div className="space-y-6">
          {/* Key Recommendations Summary */}
          {results.extracted_results && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Key Recommendations</h2>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <div className="prose max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {typeof results.extracted_results === 'string' 
                      ? results.extracted_results 
                      : JSON.stringify(results.extracted_results, null, 2)
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expert Discussion */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Expert Discussion</h2>
            <p className="text-gray-600 mb-6">
              Full conversation between selected high net worth real estate experts
            </p>
            
            {/* Professional Focus Group Conversation Display */}
            <div className="space-y-4">
              {results.interactions?.map((interaction: any, index: number) => {
                // Display clean agent contributions in a professional timeline
                if (interaction.type === 'agent_contribution') {
                  const participant = HIGH_NET_WORTH_PERSONAS.find(p => 
                    interaction.agent.includes(p.name.split(' ')[0]) && 
                    interaction.agent.includes(p.name.split(' ')[1])
                  );
                  
                  return (
                    <div key={index} className="flex space-x-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      {/* Agent Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {interaction.agent?.split(' ').map((n: string) => n[0]).join('') || 'E'}
                        </div>
                        {participant && (
                          <div className="text-center mt-1">
                            <div className="text-xs text-gray-500 font-medium">{participant.netWorth}</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Agent Message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{interaction.agent}</h3>
                            {participant && (
                              <p className="text-sm text-gray-600">{participant.profession}</p>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            Round {interaction.round}
                          </div>
                        </div>
                        
                        <div className="text-gray-700 leading-relaxed text-base">
                          {interaction.content}
                        </div>
                        
                        {participant && (
                          <div className="mt-3 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                            <span className="font-medium">Expertise:</span> {participant.specialty}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                
                // Display conversation summary fallback
                if (interaction.type === 'conversation_summary') {
                  return (
                    <div key={index} className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📋</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-lg">{interaction.agent}</h3>
                        <span className="text-sm text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                          Raw Conversation Data
                        </span>
                      </div>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded border max-h-96 overflow-y-auto font-mono text-sm">
                        {interaction.content}
                      </div>
                    </div>
                  );
                }
                
                // Fallback for unexpected interaction types
                return (
                  <div key={index} className="flex space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {interaction.agent?.charAt(0) || '?'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{interaction.agent}</h3>
                      <div className="text-gray-700 leading-relaxed">
                        {interaction.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Empty state */}
              {(!results.interactions || results.interactions.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-lg">No conversation data available</p>
                  <p className="text-sm">The focus group simulation may have encountered an issue</p>
                </div>
              )}
            </div>
          </div>

          {/* Simulation Metadata */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Simulation Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Participants</h3>
                <p className="text-blue-700">{selectedParticipants.length} experts</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Discussion Rounds</h3>
                <p className="text-green-700">{results.interactions?.length || 0} exchanges</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Property Value</h3>
                <p className="text-purple-700">{property.price || 'Not specified'}</p>
              </div>
            </div>

            {results.session_id && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Session ID:</span> {results.session_id}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}