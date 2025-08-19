'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, World, Users, Clock, Building, Plus, X } from "lucide-react";

interface Environment {
  world_name: string;
  world_type: 'basic_world' | 'social_network' | 'temporal_world';
  participants: string[];
  initial_context: string;
  enable_cross_communication: boolean;
  simulation_rounds: number;
  relationships?: Relationship[];
  temporal_settings?: TemporalSettings;
}

interface Relationship {
  agent_1: string;
  agent_2: string;
  relationship_type: 'colleague' | 'friend' | 'family' | 'professional' | 'custom';
  strength: number;
  description?: string;
}

interface TemporalSettings {
  start_datetime?: string;
  time_step_minutes: number;
  max_duration_hours?: number;
}

export default function EnhancedWorldsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Multi-Environment Simulation State
  const [simulationName, setSimulationName] = useState('');
  const [globalContext, setGlobalContext] = useState('');
  const [coordinationRounds, setCoordinationRounds] = useState(3);
  const [environments, setEnvironments] = useState<Environment[]>([
    {
      world_name: 'Marketing Department',
      world_type: 'social_network',
      participants: ['lisa', 'oscar'],
      initial_context: 'Marketing team planning product launch',
      enable_cross_communication: true,
      simulation_rounds: 5,
      relationships: [
        {
          agent_1: 'lisa',
          agent_2: 'oscar',
          relationship_type: 'colleague',
          strength: 7.0,
          description: 'Collaborative work relationship'
        }
      ]
    }
  ]);

  // Investment Firm State
  const [firmName, setFirmName] = useState('Strategic Investments LLC');
  const [firmContext, setFirmContext] = useState('Boutique investment firm specializing in tech sector analysis');
  const [analystCount, setAnalystCount] = useState(2);
  const [customerProfile, setCustomerProfile] = useState('High-net-worth individual interested in AI startups');
  const [consultationTopic, setConsultationTopic] = useState('Evaluate investment potential in generative AI companies');

  // Enhanced World State
  const [worldName, setWorldName] = useState('Research Team');
  const [worldType, setWorldType] = useState<'basic_world' | 'social_network' | 'temporal_world'>('basic_world');
  const [participants, setParticipants] = useState<string[]>(['lisa']);
  const [initialContext, setInitialContext] = useState('Team conducting market research analysis');
  const [enableCrossCommunication, setEnableCrossCommunication] = useState(true);
  const [simulationRounds, setSimulationRounds] = useState(5);

  const availableAgents = [
    { id: 'lisa', name: 'Lisa Carter', description: 'Marketing professional, health-conscious' },
    { id: 'oscar', name: 'Oscar Rodriguez', description: 'Architect, design-focused' },
    { id: 'marcos', name: 'Marcos Silva', description: 'Physician, analytical thinker' }
  ];

  const addEnvironment = () => {
    setEnvironments([...environments, {
      world_name: `Environment ${environments.length + 1}`,
      world_type: 'basic_world',
      participants: ['lisa'],
      initial_context: '',
      enable_cross_communication: true,
      simulation_rounds: 5
    }]);
  };

  const removeEnvironment = (index: number) => {
    setEnvironments(environments.filter((_, i) => i !== index));
  };

  const updateEnvironment = (index: number, field: keyof Environment, value: any) => {
    const updated = [...environments];
    updated[index] = { ...updated[index], [field]: value };
    setEnvironments(updated);
  };

  const addRelationship = (envIndex: number) => {
    const updated = [...environments];
    if (!updated[envIndex].relationships) {
      updated[envIndex].relationships = [];
    }
    updated[envIndex].relationships!.push({
      agent_1: 'lisa',
      agent_2: 'oscar',
      relationship_type: 'colleague',
      strength: 5.0
    });
    setEnvironments(updated);
  };

  const removeRelationship = (envIndex: number, relIndex: number) => {
    const updated = [...environments];
    updated[envIndex].relationships = updated[envIndex].relationships?.filter((_, i) => i !== relIndex);
    setEnvironments(updated);
  };

  const runMultiEnvironmentSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch('http://localhost:8000/api/v1/worlds/multi-environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulation_name: simulationName,
          environments: environments,
          global_context: globalContext,
          coordination_rounds: coordinationRounds
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Multi-environment simulation failed');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const runInvestmentFirmSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch('http://localhost:8000/api/v1/worlds/investment-firm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firm_name: firmName,
          firm_context: firmContext,
          analyst_count: analystCount,
          customer_profile: customerProfile,
          consultation_topic: consultationTopic
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Investment firm simulation failed');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const runEnhancedWorldSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const requestBody: any = {
        world_name: worldName,
        world_type: worldType,
        participants: participants,
        initial_context: initialContext,
        enable_cross_communication: enableCrossCommunication,
        simulation_rounds: simulationRounds
      };

      if (worldType === 'temporal_world') {
        requestBody.temporal_settings = {
          time_step_minutes: 60,
          max_duration_hours: 8
        };
      }

      const response = await fetch('http://localhost:8000/api/v1/worlds/create-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Enhanced world simulation failed');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <World className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Enhanced World Simulations</h1>
      </div>
      <p className="text-gray-600">
        Test advanced TinyTroupe world simulation capabilities including multi-environment scenarios, 
        social networks, temporal simulations, and specialized contexts like investment consulting.
      </p>

      <Tabs defaultValue="multi-environment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="multi-environment" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Multi-Environment</span>
          </TabsTrigger>
          <TabsTrigger value="investment-firm" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Investment Firm</span>
          </TabsTrigger>
          <TabsTrigger value="enhanced-world" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Enhanced World</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="multi-environment">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Environment Simulation</CardTitle>
              <CardDescription>
                Create complex scenarios with multiple environments and agent transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="simulation-name">Simulation Name</Label>
                  <Input
                    id="simulation-name"
                    value={simulationName}
                    onChange={(e) => setSimulationName(e.target.value)}
                    placeholder="Cross-Department Collaboration Study"
                  />
                </div>
                <div>
                  <Label htmlFor="coordination-rounds">Coordination Rounds</Label>
                  <Input
                    id="coordination-rounds"
                    type="number"
                    value={coordinationRounds}
                    onChange={(e) => setCoordinationRounds(parseInt(e.target.value))}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="global-context">Global Context</Label>
                <Textarea
                  id="global-context"
                  value={globalContext}
                  onChange={(e) => setGlobalContext(e.target.value)}
                  placeholder="Company-wide product launch preparation"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Environments</h3>
                  <Button onClick={addEnvironment} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Environment
                  </Button>
                </div>

                {environments.map((env, envIndex) => (
                  <Card key={envIndex} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Environment {envIndex + 1}</CardTitle>
                        {environments.length > 1 && (
                          <Button
                            onClick={() => removeEnvironment(envIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>World Name</Label>
                          <Input
                            value={env.world_name}
                            onChange={(e) => updateEnvironment(envIndex, 'world_name', e.target.value)}
                            placeholder="Department Name"
                          />
                        </div>
                        <div>
                          <Label>World Type</Label>
                          <Select
                            value={env.world_type}
                            onValueChange={(value) => updateEnvironment(envIndex, 'world_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic_world">Basic World</SelectItem>
                              <SelectItem value="social_network">Social Network</SelectItem>
                              <SelectItem value="temporal_world">Temporal World</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Participants</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {availableAgents.map((agent) => (
                            <div key={agent.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`env-${envIndex}-agent-${agent.id}`}
                                checked={env.participants.includes(agent.id)}
                                onCheckedChange={(checked) => {
                                  const updated = checked
                                    ? [...env.participants, agent.id]
                                    : env.participants.filter(p => p !== agent.id);
                                  updateEnvironment(envIndex, 'participants', updated);
                                }}
                              />
                              <Label htmlFor={`env-${envIndex}-agent-${agent.id}`} className="text-sm">
                                {agent.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Initial Context</Label>
                        <Textarea
                          value={env.initial_context}
                          onChange={(e) => updateEnvironment(envIndex, 'initial_context', e.target.value)}
                          placeholder="Context for this environment"
                          rows={2}
                        />
                      </div>

                      {env.world_type === 'social_network' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Relationships</Label>
                            <Button
                              onClick={() => addRelationship(envIndex)}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                          {env.relationships?.map((rel, relIndex) => (
                            <div key={relIndex} className="flex items-center space-x-2 p-2 border rounded">
                              <Select
                                value={rel.agent_1}
                                onValueChange={(value) => {
                                  const updated = [...environments];
                                  updated[envIndex].relationships![relIndex].agent_1 = value;
                                  setEnvironments(updated);
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableAgents.map(agent => (
                                    <SelectItem key={agent.id} value={agent.id}>{agent.name.split(' ')[0]}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span>↔</span>
                              <Select
                                value={rel.agent_2}
                                onValueChange={(value) => {
                                  const updated = [...environments];
                                  updated[envIndex].relationships![relIndex].agent_2 = value;
                                  setEnvironments(updated);
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableAgents.map(agent => (
                                    <SelectItem key={agent.id} value={agent.id}>{agent.name.split(' ')[0]}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={rel.relationship_type}
                                onValueChange={(value) => {
                                  const updated = [...environments];
                                  updated[envIndex].relationships![relIndex].relationship_type = value as any;
                                  setEnvironments(updated);
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="colleague">Colleague</SelectItem>
                                  <SelectItem value="friend">Friend</SelectItem>
                                  <SelectItem value="professional">Professional</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={() => removeRelationship(envIndex, relIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button onClick={runMultiEnvironmentSimulation} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Run Multi-Environment Simulation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investment-firm">
          <Card>
            <CardHeader>
              <CardTitle>Investment Firm Consultation</CardTitle>
              <CardDescription>
                Simulate financial consultation scenarios with specialized analysts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firm-name">Firm Name</Label>
                  <Input
                    id="firm-name"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="analyst-count">Number of Analysts</Label>
                  <Input
                    id="analyst-count"
                    type="number"
                    value={analystCount}
                    onChange={(e) => setAnalystCount(parseInt(e.target.value))}
                    min="1"
                    max="5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="firm-context">Firm Context</Label>
                <Textarea
                  id="firm-context"
                  value={firmContext}
                  onChange={(e) => setFirmContext(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="customer-profile">Customer Profile</Label>
                <Textarea
                  id="customer-profile"
                  value={customerProfile}
                  onChange={(e) => setCustomerProfile(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="consultation-topic">Consultation Topic</Label>
                <Textarea
                  id="consultation-topic"
                  value={consultationTopic}
                  onChange={(e) => setConsultationTopic(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={runInvestmentFirmSimulation} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Run Investment Consultation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhanced-world">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced World Simulation</CardTitle>
              <CardDescription>
                Create advanced world simulations with social networks and temporal progression
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="world-name">World Name</Label>
                  <Input
                    id="world-name"
                    value={worldName}
                    onChange={(e) => setWorldName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="world-type">World Type</Label>
                  <Select value={worldType} onValueChange={(value: any) => setWorldType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic_world">Basic World</SelectItem>
                      <SelectItem value="social_network">Social Network</SelectItem>
                      <SelectItem value="temporal_world">Temporal World</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Participants</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {availableAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`agent-${agent.id}`}
                        checked={participants.includes(agent.id)}
                        onCheckedChange={(checked) => {
                          setParticipants(checked
                            ? [...participants, agent.id]
                            : participants.filter(p => p !== agent.id)
                          );
                        }}
                      />
                      <Label htmlFor={`agent-${agent.id}`}>
                        {agent.name}
                        <p className="text-xs text-gray-500">{agent.description}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="initial-context">Initial Context</Label>
                <Textarea
                  id="initial-context"
                  value={initialContext}
                  onChange={(e) => setInitialContext(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cross-communication"
                    checked={enableCrossCommunication}
                    onCheckedChange={setEnableCrossCommunication}
                  />
                  <Label htmlFor="cross-communication">Enable Cross Communication</Label>
                </div>
                <div>
                  <Label htmlFor="simulation-rounds">Simulation Rounds</Label>
                  <Input
                    id="simulation-rounds"
                    type="number"
                    value={simulationRounds}
                    onChange={(e) => setSimulationRounds(parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <Button onClick={runEnhancedWorldSimulation} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Run Enhanced World Simulation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Status: {results.status}</Badge>
                {results.simulation_id && <Badge>ID: {results.simulation_id}</Badge>}
                {results.firm_id && <Badge>Firm ID: {results.firm_id}</Badge>}
                {results.world_id && <Badge>World ID: {results.world_id}</Badge>}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}