'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Database, FileText, Globe, Search, Plus, X, Link } from "lucide-react";

interface GroundingConfig {
  grounding_id: string;
  agent_id: string;
  source_type: 'local_files' | 'web_pages' | 'custom_documents';
  source_paths: string[];
  available_documents: string[];
  status: string;
  created_at: string;
}

interface GroundedAgent {
  persona_id: string;
  name: string;
  base_agent: string;
  grounding_sources: Array<{
    type: string;
    paths: string[];
  }>;
  consultation_context: string;
  status: string;
  created_at: string;
}

export default function GroundingSystemPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [groundingConfigs, setGroundingConfigs] = useState<GroundingConfig[]>([]);

  // Add Grounding State
  const [selectedAgent, setSelectedAgent] = useState('lisa');
  const [sourceType, setSourceType] = useState<'local_files' | 'web_pages' | 'custom_documents'>('local_files');
  const [sourcePaths, setSourcePaths] = useState<string[]>(['./financial_data/', './market_reports/2024/']);
  const [groundingName, setGroundingName] = useState('Financial Analysis Data');

  // Create Grounded Agent State
  const [agentSpecification, setAgentSpecification] = useState('lisa');
  const [customName, setCustomName] = useState('Financial Analyst');
  const [consultationContext, setConsultationContext] = useState('Investment analysis and market research');
  const [groundingSources, setGroundingSources] = useState([
    {
      type: 'local_files',
      paths: ['./financial_reports/', './market_analysis/']
    }
  ]);

  // Document Query State
  const [queryAgentId, setQueryAgentId] = useState('');
  const [queryType, setQueryType] = useState<'list' | 'retrieve' | 'search'>('list');
  const [documentName, setDocumentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const availableAgents = [
    { id: 'lisa', name: 'Lisa Carter', description: 'Marketing professional, health-conscious' },
    { id: 'oscar', name: 'Oscar Rodriguez', description: 'Architect, design-focused' },
    { id: 'marcos', name: 'Marcos Silva', description: 'Physician, analytical thinker' }
  ];

  const addSourcePath = () => {
    setSourcePaths([...sourcePaths, '']);
  };

  const updateSourcePath = (index: number, value: string) => {
    const updated = [...sourcePaths];
    updated[index] = value;
    setSourcePaths(updated);
  };

  const removeSourcePath = (index: number) => {
    setSourcePaths(sourcePaths.filter((_, i) => i !== index));
  };

  const addGroundingSource = () => {
    setGroundingSources([...groundingSources, {
      type: 'local_files',
      paths: ['']
    }]);
  };

  const updateGroundingSource = (index: number, field: string, value: any) => {
    const updated = [...groundingSources];
    updated[index] = { ...updated[index], [field]: value };
    setGroundingSources(updated);
  };

  const removeGroundingSource = (index: number) => {
    setGroundingSources(groundingSources.filter((_, i) => i !== index));
  };

  const updateGroundingSourcePath = (sourceIndex: number, pathIndex: number, value: string) => {
    const updated = [...groundingSources];
    updated[sourceIndex].paths[pathIndex] = value;
    setGroundingSources(updated);
  };

  const addGroundingSourcePath = (sourceIndex: number) => {
    const updated = [...groundingSources];
    updated[sourceIndex].paths.push('');
    setGroundingSources(updated);
  };

  const removeGroundingSourcePath = (sourceIndex: number, pathIndex: number) => {
    const updated = [...groundingSources];
    updated[sourceIndex].paths = updated[sourceIndex].paths.filter((_, i) => i !== pathIndex);
    setGroundingSources(updated);
  };

  const addGrounding = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch('http://localhost:8000/api/v1/grounding/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: sourceType,
          source_paths: sourcePaths.filter(path => path.trim() !== ''),
          agent_id: selectedAgent,
          grounding_name: groundingName
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add grounding');
      }

      setResults(data);
      loadGroundingConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createGroundedAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch('http://localhost:8000/api/v1/grounding/create-grounded-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_specification: agentSpecification,
          custom_name: customName,
          grounding_sources: groundingSources.map(source => ({
            type: source.type,
            paths: source.paths.filter(path => path.trim() !== '')
          })),
          consultation_context: consultationContext
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create grounded agent');
      }

      setResults(data);
      setQueryAgentId(data.persona_id); // Set for document querying
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const queryDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const requestBody: any = {
        agent_id: queryAgentId,
        query_type: queryType
      };

      if (queryType === 'retrieve' && documentName) {
        requestBody.document_name = documentName;
      } else if (queryType === 'search' && searchQuery) {
        requestBody.search_query = searchQuery;
        requestBody.top_k = 5;
      }

      const response = await fetch('http://localhost:8000/api/v1/grounding/query-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to query documents');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadGroundingConfigs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/grounding/list');
      const data = await response.json();
      if (response.ok) {
        setGroundingConfigs(data.groundings || []);
      }
    } catch (err) {
      console.error('Failed to load grounding configs:', err);
    }
  };

  useEffect(() => {
    loadGroundingConfigs();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Database className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Grounding System</h1>
      </div>
      <p className="text-gray-600">
        Connect agents to real data sources including local files, web pages, and documents. 
        Create grounded agents that can access and reason about specific data sets.
      </p>

      <Tabs defaultValue="add-grounding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="add-grounding" className="flex items-center space-x-2">
            <Link className="h-4 w-4" />
            <span>Add Grounding</span>
          </TabsTrigger>
          <TabsTrigger value="create-agent" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Grounded Agent</span>
          </TabsTrigger>
          <TabsTrigger value="query-docs" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Query Documents</span>
          </TabsTrigger>
          <TabsTrigger value="configs" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Configurations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-grounding">
          <Card>
            <CardHeader>
              <CardTitle>Add Grounding to Existing Agent</CardTitle>
              <CardDescription>
                Connect an existing agent to data sources for enhanced knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="selected-agent">Agent</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} - {agent.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source-type">Source Type</Label>
                  <Select value={sourceType} onValueChange={(value: any) => setSourceType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local_files">Local Files</SelectItem>
                      <SelectItem value="web_pages">Web Pages</SelectItem>
                      <SelectItem value="custom_documents">Custom Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="grounding-name">Grounding Name</Label>
                <Input
                  id="grounding-name"
                  value={groundingName}
                  onChange={(e) => setGroundingName(e.target.value)}
                  placeholder="Descriptive name for this grounding configuration"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Source Paths</Label>
                  <Button onClick={addSourcePath} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Path
                  </Button>
                </div>
                {sourcePaths.map((path, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={path}
                      onChange={(e) => updateSourcePath(index, e.target.value)}
                      placeholder={
                        sourceType === 'web_pages' 
                          ? 'https://example.com/page' 
                          : './data/folder/'
                      }
                    />
                    {sourcePaths.length > 1 && (
                      <Button
                        onClick={() => removeSourcePath(index)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-sm text-gray-500">
                  {sourceType === 'local_files' && 'Enter file paths or directory paths (e.g., ./data/, ./reports.pdf)'}
                  {sourceType === 'web_pages' && 'Enter URLs to web pages or APIs'}
                  {sourceType === 'custom_documents' && 'Enter paths to custom document sources'}
                </p>
              </div>

              <Button onClick={addGrounding} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Grounding to Agent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-agent">
          <Card>
            <CardHeader>
              <CardTitle>Create Grounded Agent</CardTitle>
              <CardDescription>
                Create a new agent instance with grounding sources from the start
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent-specification">Base Agent</Label>
                  <Select value={agentSpecification} onValueChange={setAgentSpecification}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} - {agent.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="custom-name">Custom Name (Optional)</Label>
                  <Input
                    id="custom-name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="AI Strategy Consultant"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="consultation-context">Consultation Context</Label>
                <Textarea
                  id="consultation-context"
                  value={consultationContext}
                  onChange={(e) => setConsultationContext(e.target.value)}
                  placeholder="Describe the consultation context for this grounded agent..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Grounding Sources</Label>
                  <Button onClick={addGroundingSource} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </div>

                {groundingSources.map((source, sourceIndex) => (
                  <Card key={sourceIndex} className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Source {sourceIndex + 1}</CardTitle>
                        {groundingSources.length > 1 && (
                          <Button
                            onClick={() => removeGroundingSource(sourceIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Source Type</Label>
                        <Select
                          value={source.type}
                          onValueChange={(value) => updateGroundingSource(sourceIndex, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local_files">Local Files</SelectItem>
                            <SelectItem value="web_pages">Web Pages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Paths</Label>
                          <Button
                            onClick={() => addGroundingSourcePath(sourceIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {source.paths.map((path, pathIndex) => (
                          <div key={pathIndex} className="flex items-center space-x-2">
                            <Input
                              value={path}
                              onChange={(e) => updateGroundingSourcePath(sourceIndex, pathIndex, e.target.value)}
                              placeholder={
                                source.type === 'web_pages' 
                                  ? 'https://example.com' 
                                  : './data/folder/'
                              }
                            />
                            {source.paths.length > 1 && (
                              <Button
                                onClick={() => removeGroundingSourcePath(sourceIndex, pathIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button onClick={createGroundedAgent} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Grounded Agent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query-docs">
          <Card>
            <CardHeader>
              <CardTitle>Query Grounded Documents</CardTitle>
              <CardDescription>
                Interact with documents available to grounded agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="query-agent-id">Agent ID</Label>
                  <Input
                    id="query-agent-id"
                    value={queryAgentId}
                    onChange={(e) => setQueryAgentId(e.target.value)}
                    placeholder="Enter agent ID or persona ID"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the agent ID from a grounded agent you've created
                  </p>
                </div>
                <div>
                  <Label htmlFor="query-type">Query Type</Label>
                  <Select value={queryType} onValueChange={(value: any) => setQueryType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">List Available Documents</SelectItem>
                      <SelectItem value="retrieve">Retrieve Specific Document</SelectItem>
                      <SelectItem value="search">Search Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {queryType === 'retrieve' && (
                <div>
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input
                    id="document-name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Q4_Financial_Report.pdf"
                  />
                </div>
              )}

              {queryType === 'search' && (
                <div>
                  <Label htmlFor="search-query">Search Query</Label>
                  <Input
                    id="search-query"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="revenue growth AI investment"
                  />
                </div>
              )}

              <Button onClick={queryDocuments} disabled={loading || !queryAgentId} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Query Documents
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configs">
          <Card>
            <CardHeader>
              <CardTitle>Grounding Configurations</CardTitle>
              <CardDescription>
                View and manage existing grounding configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groundingConfigs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No grounding configurations yet. Create your first one using the tabs above.
                </p>
              ) : (
                <div className="space-y-4">
                  {groundingConfigs.map((config) => (
                    <Card key={config.grounding_id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{config.source_type}</Badge>
                              <Badge>{config.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(config.created_at).toLocaleString()}
                            </p>
                          </div>
                          <p><strong>Agent:</strong> {config.agent_id}</p>
                          <p><strong>Sources:</strong> {config.source_paths.join(', ')}</p>
                          <p><strong>Available Documents:</strong> {config.available_documents.length} documents</p>
                          {config.available_documents.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Documents:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {config.available_documents.slice(0, 5).map((doc, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {doc}
                                  </Badge>
                                ))}
                                {config.available_documents.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{config.available_documents.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.grounding_id && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Grounding ID: {results.grounding_id}</Badge>
                  <Badge>Status: {results.status}</Badge>
                </div>
              )}
              
              {results.persona_id && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Persona ID: {results.persona_id}</Badge>
                  <Badge>Name: {results.name}</Badge>
                </div>
              )}

              {results.result && (
                <div>
                  <h3 className="font-semibold mb-2">Agent Response</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm whitespace-pre-wrap">{results.result}</p>
                  </div>
                </div>
              )}
              
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