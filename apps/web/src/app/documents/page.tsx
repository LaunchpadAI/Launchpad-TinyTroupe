'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Plus, X, Download, User, Database } from "lucide-react";

interface DocumentCreation {
  document_id: string;
  title: string;
  status: string;
  export_paths?: {
    md?: string;
    docx?: string;
    pdf?: string;
    json?: string;
  };
  content_preview?: string;
  created_at: string;
}

interface GroundingSource {
  type: 'local_files' | 'web_pages';
  paths: string[];
}

export default function DocumentCreationPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DocumentCreation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentCreation[]>([]);

  // Simple Document Creation State
  const [selectedAgent, setSelectedAgent] = useState('lisa');
  const [documentTitle, setDocumentTitle] = useState('Market Analysis Report');
  const [contentPrompt, setContentPrompt] = useState('Create a comprehensive market analysis report including industry trends, competitive landscape, and strategic recommendations');
  const [useEnrichment, setUseEnrichment] = useState(true);
  const [exportFormats, setExportFormats] = useState<string[]>(['md', 'docx']);

  // Grounded Document Creation State
  const [agentSpecification, setAgentSpecification] = useState('lisa');
  const [customName, setCustomName] = useState('Business Analyst');
  const [documentTask, setDocumentTask] = useState('Write a detailed financial analysis report incorporating the latest market data and trends');
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([
    {
      type: 'local_files',
      paths: ['./financial_reports/', './market_data/']
    }
  ]);
  const [groundedUseEnrichment, setGroundedUseEnrichment] = useState(true);
  const [groundedExportFormats, setGroundedExportFormats] = useState<string[]>(['md', 'docx', 'pdf']);

  // Content to Document State
  const [contentToConvert, setContentToConvert] = useState('Q4 Revenue Analysis\n\nKey Findings:\n- Revenue increased 23% YoY\n- Customer acquisition up 45%\n- Operating margins improved to 15.2%\n\nRecommendations:\n- Expand sales team\n- Invest in R&D\n- Explore new markets');
  const [conversionPrompt, setConversionPrompt] = useState('Transform this content into a professional executive report with detailed analysis, charts, and actionable recommendations');
  const [contentUseEnrichment, setContentUseEnrichment] = useState(true);
  const [contentExportFormats, setContentExportFormats] = useState<string[]>(['md', 'pdf']);

  const availableAgents = [
    { id: 'lisa', name: 'Lisa Carter', description: 'Marketing professional, health-conscious' },
    { id: 'oscar', name: 'Oscar Rodriguez', description: 'Architect, design-focused' },
    { id: 'marcos', name: 'Marcos Silva', description: 'Physician, analytical thinker' }
  ];

  const formatOptions = [
    { value: 'md', label: 'Markdown (.md)', description: 'Plain text with formatting' },
    { value: 'docx', label: 'Word Document (.docx)', description: 'Microsoft Word format' },
    { value: 'pdf', label: 'PDF (.pdf)', description: 'Portable document format' },
    { value: 'json', label: 'JSON (.json)', description: 'Structured data format' }
  ];

  const handleFormatChange = (format: string, checked: boolean, setter: (formats: string[]) => void, currentFormats: string[]) => {
    if (checked) {
      setter([...currentFormats, format]);
    } else {
      setter(currentFormats.filter(f => f !== format));
    }
  };

  const addGroundingSource = () => {
    setGroundingSources([...groundingSources, {
      type: 'local_files',
      paths: ['']
    }]);
  };

  const removeGroundingSource = (index: number) => {
    setGroundingSources(groundingSources.filter((_, i) => i !== index));
  };

  const updateGroundingSource = (index: number, field: keyof GroundingSource, value: any) => {
    const updated = [...groundingSources];
    updated[index] = { ...updated[index], [field]: value };
    setGroundingSources(updated);
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

  const createDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch('http://localhost:8000/api/v1/documents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: selectedAgent,
          title: documentTitle,
          content_prompt: contentPrompt,
          use_enrichment: useEnrichment,
          export_formats: exportFormats
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Document creation failed');
      }

      setResults(data);
      loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createGroundedDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch('http://localhost:8000/api/v1/documents/create-with-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_specification: agentSpecification,
          custom_name: customName,
          document_task: documentTask,
          grounding_sources: groundingSources.map(source => ({
            type: source.type,
            paths: source.paths.filter(path => path.trim() !== '')
          })),
          use_enrichment: groundedUseEnrichment,
          export_formats: groundedExportFormats
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Grounded document creation failed');
      }

      setResults(data);
      loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const convertContentToDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch('http://localhost:8000/api/v1/documents/content-to-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentToConvert,
          conversion_prompt: conversionPrompt,
          use_enrichment: contentUseEnrichment,
          export_formats: contentExportFormats
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Content conversion failed');
      }

      setResults(data);
      loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/documents/list');
      const data = await response.json();
      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Document Creation Platform</h1>
      </div>
      <p className="text-gray-600">
        Create professional documents using TinyWordProcessor with AI-powered content generation, 
        enhancement, and multi-format export capabilities.
      </p>

      <Tabs defaultValue="simple" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simple" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Simple Document</span>
          </TabsTrigger>
          <TabsTrigger value="grounded" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Grounded Document</span>
          </TabsTrigger>
          <TabsTrigger value="convert" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Content to Document</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Document History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simple">
          <Card>
            <CardHeader>
              <CardTitle>Create Simple Document</CardTitle>
              <CardDescription>
                Generate professional documents using existing agents with customizable content prompts
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
                  <Label htmlFor="document-title">Document Title</Label>
                  <Input
                    id="document-title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Market Analysis Report"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content-prompt">Content Prompt</Label>
                <Textarea
                  id="content-prompt"
                  value={contentPrompt}
                  onChange={(e) => setContentPrompt(e.target.value)}
                  placeholder="Describe what content you want the agent to create..."
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label>Export Formats</Label>
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map((format) => (
                    <div key={format.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`format-${format.value}`}
                        checked={exportFormats.includes(format.value)}
                        onCheckedChange={(checked) => 
                          handleFormatChange(format.value, checked as boolean, setExportFormats, exportFormats)
                        }
                      />
                      <div>
                        <Label htmlFor={`format-${format.value}`} className="font-medium">
                          {format.label}
                        </Label>
                        <p className="text-xs text-gray-500">{format.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-enrichment"
                  checked={useEnrichment}
                  onCheckedChange={setUseEnrichment}
                />
                <Label htmlFor="use-enrichment">Use Content Enrichment (5x expansion)</Label>
              </div>

              <Button onClick={createDocument} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grounded">
          <Card>
            <CardHeader>
              <CardTitle>Create Grounded Document</CardTitle>
              <CardDescription>
                Generate documents with agents connected to specific data sources for enhanced accuracy
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
                  <Label htmlFor="custom-name">Custom Agent Name</Label>
                  <Input
                    id="custom-name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Business Analyst"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="document-task">Document Task</Label>
                <Textarea
                  id="document-task"
                  value={documentTask}
                  onChange={(e) => setDocumentTask(e.target.value)}
                  placeholder="Describe the document you want created using the grounded data..."
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
                  <Card key={sourceIndex} className="border-l-4 border-l-blue-500">
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

              <div className="space-y-3">
                <Label>Export Formats</Label>
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map((format) => (
                    <div key={format.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`grounded-format-${format.value}`}
                        checked={groundedExportFormats.includes(format.value)}
                        onCheckedChange={(checked) => 
                          handleFormatChange(format.value, checked as boolean, setGroundedExportFormats, groundedExportFormats)
                        }
                      />
                      <div>
                        <Label htmlFor={`grounded-format-${format.value}`} className="font-medium">
                          {format.label}
                        </Label>
                        <p className="text-xs text-gray-500">{format.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="grounded-use-enrichment"
                  checked={groundedUseEnrichment}
                  onCheckedChange={setGroundedUseEnrichment}
                />
                <Label htmlFor="grounded-use-enrichment">Use Content Enrichment</Label>
              </div>

              <Button onClick={createGroundedDocument} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Grounded Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convert">
          <Card>
            <CardHeader>
              <CardTitle>Convert Content to Document</CardTitle>
              <CardDescription>
                Transform existing content into professional documents with enhancement and formatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content-to-convert">Content to Convert</Label>
                <Textarea
                  id="content-to-convert"
                  value={contentToConvert}
                  onChange={(e) => setContentToConvert(e.target.value)}
                  placeholder="Paste your existing content here..."
                  rows={8}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Characters: {contentToConvert.length}
                </p>
              </div>

              <div>
                <Label htmlFor="conversion-prompt">Conversion Instructions</Label>
                <Textarea
                  id="conversion-prompt"
                  value={conversionPrompt}
                  onChange={(e) => setConversionPrompt(e.target.value)}
                  placeholder="Describe how you want the content transformed..."
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Export Formats</Label>
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map((format) => (
                    <div key={format.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`content-format-${format.value}`}
                        checked={contentExportFormats.includes(format.value)}
                        onCheckedChange={(checked) => 
                          handleFormatChange(format.value, checked as boolean, setContentExportFormats, contentExportFormats)
                        }
                      />
                      <div>
                        <Label htmlFor={`content-format-${format.value}`} className="font-medium">
                          {format.label}
                        </Label>
                        <p className="text-xs text-gray-500">{format.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="content-use-enrichment"
                  checked={contentUseEnrichment}
                  onCheckedChange={setContentUseEnrichment}
                />
                <Label htmlFor="content-use-enrichment">Use Content Enrichment</Label>
              </div>

              <Button onClick={convertContentToDocument} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Convert to Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Document History</CardTitle>
              <CardDescription>
                View and manage your previously created documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No documents created yet. Use the tabs above to create your first document.
                </p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <Card key={doc.document_id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{doc.title}</h3>
                              <p className="text-sm text-gray-600">
                                Created: {new Date(doc.created_at).toLocaleString()}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                Status: {doc.status}
                              </Badge>
                            </div>
                          </div>
                          
                          {doc.export_paths && Object.keys(doc.export_paths).length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Available Formats:</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(doc.export_paths).map(([format, path]) => (
                                  <Badge key={format} variant="secondary" className="text-xs">
                                    {format.toUpperCase()}: {path}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {doc.content_preview && (
                            <div>
                              <p className="text-sm font-medium mb-2">Content Preview:</p>
                              <div className="bg-gray-50 p-3 rounded-lg border max-h-32 overflow-auto">
                                <pre className="text-xs whitespace-pre-wrap">
                                  {doc.content_preview.substring(0, 300)}
                                  {doc.content_preview.length > 300 ? '...' : ''}
                                </pre>
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
            <CardTitle>Document Creation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Document ID: {results.document_id}</Badge>
                <Badge>Status: {results.status}</Badge>
                <Badge variant="secondary">Title: {results.title}</Badge>
              </div>

              {results.export_paths && Object.keys(results.export_paths).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Export Files</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(results.export_paths).map(([format, path]) => (
                      <div key={format} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{format.toUpperCase()}</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {path}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.content_preview && (
                <div>
                  <h3 className="font-semibold mb-2">Content Preview</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 max-h-64 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                      {results.content_preview}
                    </pre>
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