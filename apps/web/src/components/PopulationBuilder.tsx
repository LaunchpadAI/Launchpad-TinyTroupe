'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import clsx from 'clsx';

interface DemographicProfile {
  age_range: string;
  income_level: string;
  location: string;
  personality_fragments: string[];
}

interface PopulationBuilderProps {
  onChange: (population: DemographicProfile[]) => void;
  maxSize?: number;
  className?: string;
}

const PERSONALITY_FRAGMENTS = [
  { id: 'health_conscious', name: 'Health Conscious', description: 'Focuses on wellness and healthy lifestyle choices' },
  { id: 'price_sensitive', name: 'Price Sensitive', description: 'Values cost-effectiveness and deals' },
  { id: 'tech_savvy', name: 'Tech Savvy', description: 'Comfortable with technology and digital solutions' },
  { id: 'environmentally_aware', name: 'Environmentally Aware', description: 'Cares about sustainability and eco-friendliness' },
  { id: 'brand_loyal', name: 'Brand Loyal', description: 'Prefers established brands and familiar products' },
  { id: 'early_adopter', name: 'Early Adopter', description: 'Likes to try new products and trends first' },
  { id: 'social_influence', name: 'Social Influence', description: 'Influenced by social media and peer opinions' },
  { id: 'quality_focused', name: 'Quality Focused', description: 'Prioritizes high-quality products and experiences' }
];

const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
const INCOME_LEVELS = ['Low ($20-40k)', 'Middle ($40-80k)', 'High ($80k+)'];
const LOCATIONS = ['Urban', 'Suburban', 'Rural'];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function PopulationBuilder({ onChange, maxSize = 1000, className }: PopulationBuilderProps) {
  const [populationSize, setPopulationSize] = useState(100);
  const [ageDistribution, setAgeDistribution] = useState<Record<string, number>>({
    '18-25': 20,
    '26-35': 25,
    '36-45': 25,
    '46-55': 20,
    '56-65': 8,
    '65+': 2
  });
  const [incomeDistribution, setIncomeDistribution] = useState<Record<string, number>>({
    'Low ($20-40k)': 30,
    'Middle ($40-80k)': 50,
    'High ($80k+)': 20
  });
  const [locationDistribution, setLocationDistribution] = useState<Record<string, number>>({
    'Urban': 45,
    'Suburban': 40,
    'Rural': 15
  });
  const [selectedFragments, setSelectedFragments] = useState<string[]>(['health_conscious', 'price_sensitive']);

  // Generate population data when parameters change
  useEffect(() => {
    generatePopulation();
  }, [populationSize, ageDistribution, incomeDistribution, locationDistribution, selectedFragments]);

  const generatePopulation = () => {
    const population: DemographicProfile[] = [];
    
    for (let i = 0; i < populationSize; i++) {
      // Randomly assign demographics based on distribution
      const age_range = weightedRandomSelect(ageDistribution);
      const income_level = weightedRandomSelect(incomeDistribution);
      const location = weightedRandomSelect(locationDistribution);
      
      // Randomly assign 1-3 personality fragments
      const fragmentCount = Math.floor(Math.random() * 3) + 1;
      const personality_fragments = selectedFragments
        .sort(() => 0.5 - Math.random())
        .slice(0, fragmentCount);

      population.push({
        age_range,
        income_level,
        location,
        personality_fragments
      });
    }

    onChange(population);
  };

  const weightedRandomSelect = (distribution: Record<string, number>): string => {
    const items = Object.keys(distribution);
    const weights = Object.values(distribution);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  };

  const updateAgeDistribution = (range: string, value: number) => {
    setAgeDistribution(prev => ({ ...prev, [range]: value }));
  };

  const updateIncomeDistribution = (level: string, value: number) => {
    setIncomeDistribution(prev => ({ ...prev, [level]: value }));
  };

  const updateLocationDistribution = (location: string, value: number) => {
    setLocationDistribution(prev => ({ ...prev, [location]: value }));
  };

  const toggleFragment = (fragmentId: string) => {
    setSelectedFragments(prev => 
      prev.includes(fragmentId) 
        ? prev.filter(id => id !== fragmentId)
        : [...prev, fragmentId]
    );
  };

  const prepareChartData = (distribution: Record<string, number>) => {
    return Object.entries(distribution).map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length]
    }));
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Population Size Control */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Population Size</h3>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-blue-800">Size:</label>
          <input
            type="range"
            min={10}
            max={maxSize}
            step={10}
            value={populationSize}
            onChange={(e) => setPopulationSize(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-lg font-bold text-blue-900 min-w-[60px]">
            {populationSize}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution Controls */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Age Distribution (%)</h4>
          <div className="space-y-3">
            {AGE_RANGES.map(range => (
              <div key={range} className="flex items-center justify-between">
                <label className="text-sm text-gray-700 min-w-[80px]">{range}:</label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={ageDistribution[range]}
                  onChange={(e) => updateAgeDistribution(range, parseInt(e.target.value))}
                  className="flex-1 mx-3"
                />
                <span className="text-sm font-medium text-gray-900 min-w-[40px]">
                  {ageDistribution[range]}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareChartData(ageDistribution)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {prepareChartData(ageDistribution).map((entry, index) => (
                    <Cell key={`age-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Distribution Controls */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Income Distribution (%)</h4>
          <div className="space-y-3">
            {INCOME_LEVELS.map(level => (
              <div key={level} className="flex items-center justify-between">
                <label className="text-sm text-gray-700 min-w-[120px]">{level}:</label>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={incomeDistribution[level]}
                  onChange={(e) => updateIncomeDistribution(level, parseInt(e.target.value))}
                  className="flex-1 mx-3"
                />
                <span className="text-sm font-medium text-gray-900 min-w-[40px]">
                  {incomeDistribution[level]}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareChartData(incomeDistribution)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {prepareChartData(incomeDistribution).map((entry, index) => (
                    <Cell key={`income-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Distribution Controls */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Location Distribution (%)</h4>
          <div className="space-y-3">
            {LOCATIONS.map(location => (
              <div key={location} className="flex items-center justify-between">
                <label className="text-sm text-gray-700 min-w-[80px]">{location}:</label>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={locationDistribution[location]}
                  onChange={(e) => updateLocationDistribution(location, parseInt(e.target.value))}
                  className="flex-1 mx-3"
                />
                <span className="text-sm font-medium text-gray-900 min-w-[40px]">
                  {locationDistribution[location]}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareChartData(locationDistribution)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {prepareChartData(locationDistribution).map((entry, index) => (
                    <Cell key={`location-cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personality Fragments */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Personality Fragments ({selectedFragments.length} selected)
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {PERSONALITY_FRAGMENTS.map(fragment => (
              <label
                key={fragment.id}
                className={clsx(
                  'flex items-start p-3 border rounded-lg cursor-pointer transition-colors',
                  selectedFragments.includes(fragment.id)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedFragments.includes(fragment.id)}
                  onChange={() => toggleFragment(fragment.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{fragment.name}</div>
                  <div className="text-xs text-gray-500">{fragment.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Population Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-2">Generated Population Preview</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Total Size:</strong> {populationSize} agents</p>
          <p><strong>Age Distribution:</strong> {Object.entries(ageDistribution).map(([range, pct]) => `${range}: ${pct}%`).join(', ')}</p>
          <p><strong>Personality Traits:</strong> {selectedFragments.length} fragment types selected</p>
          <p><strong>Geographic Mix:</strong> {Object.entries(locationDistribution).map(([loc, pct]) => `${loc}: ${pct}%`).join(', ')}</p>
        </div>
      </div>
    </div>
  );
}