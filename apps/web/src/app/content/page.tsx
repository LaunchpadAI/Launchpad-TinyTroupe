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
import { Slider } from "@/components/ui/slider";
import { Loader2, FileText, Palette, History, Download, Copy } from "lucide-react";

interface ContentEnhancement {
  enhancement_id: string;
  original_content: string;
  enhanced_content: string;
  requirements?: string;
  style?: string;
  content_type?: string;
  status: string;
  created_at: string;
}

export default function ContentEnhancementPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ContentEnhancement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enhancements, setEnhancements] = useState<ContentEnhancement[]>([]);

  // Content Enrichment State
  const [enrichRequirements, setEnrichRequirements] = useState('Transform this outline into a comprehensive business proposal with detailed sections, financial projections, and risk analysis');
  const [enrichContent, setEnrichContent] = useState('AI Customer Service Platform\n- Reduce response time\n- Improve satisfaction\n- Cost savings');
  const [enrichContentType, setEnrichContentType] = useState('business_proposal');
  const [enrichContextInfo, setEnrichContextInfo] = useState('B2B SaaS company targeting enterprise clients');
  const [enrichUsePastResults, setEnrichUsePastResults] = useState(false);

  // Content Styling State
  const [styleContent, setStyleContent] = useState('Our AI platform helps companies handle customer questions faster and better.');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [styleContentType, setStyleContentType] = useState('executive_summary');
  const [styleContextInfo, setStyleContextInfo] = useState('');
  const [temperature, setTemperature] = useState([0.7]);
  const [styleUsePastResults, setStyleUsePastResults] = useState(false);

  const contentTypes = [
    'business_proposal', 'executive_summary', 'email', 'report', 'article', 
    'marketing_copy', 'technical_documentation', 'presentation', 'memo'
  ];

  const styles = [
    { value: 'professional', label: 'Professional', description: 'Formal business tone' },
    { value: 'casual', label: 'Casual', description: 'Conversational and friendly' },
    { value: 'technical', label: 'Technical', description: 'Precise and detailed' },
    { value: 'academic', label: 'Academic', description: 'Scholarly and researched' },
    { value: 'executive', label: 'Executive', description: 'High-level strategic' },
    { value: 'marketing', label: 'Marketing', description: 'Persuasive and engaging' },
    { value: 'journalistic', label: 'Journalistic', description: 'News and reporting style' }
  ];

  const enrichContent = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch('http://localhost:8000/api/v1/content/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: enrichRequirements,
          content: enrichContent,
          content_type: enrichContentType,
          context_info: enrichContextInfo,
          use_past_results: enrichUsePastResults
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Content enrichment failed');
      }

      setResults(data);
      loadEnhancements(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyStyle = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch('http://localhost:8000/api/v1/content/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: styleContent,
          style: selectedStyle,
          content_type: styleContentType,
          context_info: styleContextInfo,
          temperature: temperature[0],
          use_past_results: styleUsePastResults
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Content styling failed');
      }

      setResults(data);
      loadEnhancements(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadEnhancements = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/content/enhancements');
      const data = await response.json();
      if (response.ok) {
        setEnhancements(data.enhancements || []);
      }
    } catch (err) {
      console.error('Failed to load enhancements:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const loadEnhancementById = async (enhancementId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/content/enhancement/${enhancementId}`);
      const data = await response.json();
      if (response.ok) {
        setResults(data);
      }
    } catch (err) {
      setError('Failed to load enhancement details');
    }
  };

  // Load enhancements on component mount
  React.useEffect(() => {
    loadEnhancements();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Content Enhancement Suite</h1>
      </div>
      <p className="text-gray-600">
        Enhance and style your content using TinyTroupe's AI-powered content enhancement capabilities.
        Transform outlines into comprehensive documents or apply professional styling.
      </p>

      <Tabs defaultValue="enrich" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enrich" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Content Enrichment</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Content Styling</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Enhancement History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrich">
          <Card>
            <CardHeader>
              <CardTitle>Content Enrichment</CardTitle>
              <CardDescription>
                Transform brief content into comprehensive, detailed documents (5x expansion)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="enrich-requirements">Enhancement Requirements</Label>
                <Textarea
                  id="enrich-requirements"
                  value={enrichRequirements}
                  onChange={(e) => setEnrichRequirements(e.target.value)}
                  placeholder="Describe how you want the content enhanced..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="enrich-content">Content to Enhance</Label>
                <Textarea
                  id="enrich-content"
                  value={enrichContent}
                  onChange={(e) => setEnrichContent(e.target.value)}
                  placeholder="Enter your outline or brief content..."
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Characters: {enrichContent.length}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="enrich-content-type">Content Type</Label>
                  <Select value={enrichContentType} onValueChange={setEnrichContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enrich-use-past"
                    checked={enrichUsePastResults}
                    onCheckedChange={setEnrichUsePastResults}
                  />
                  <Label htmlFor="enrich-use-past">Use Past Results for Context</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="enrich-context">Context Information (Optional)</Label>
                <Textarea
                  id="enrich-context"
                  value={enrichContextInfo}
                  onChange={(e) => setEnrichContextInfo(e.target.value)}
                  placeholder="Additional context about your business, audience, or purpose..."
                  rows={2}
                />
              </div>

              <Button onClick={enrichContent} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enrich Content (5x Expansion)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="style">
          <Card>
            <CardHeader>
              <CardTitle>Content Styling</CardTitle>
              <CardDescription>
                Apply professional styles and tones to your content while preserving meaning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="style-content">Content to Style</Label>
                <Textarea
                  id="style-content"
                  value={styleContent}
                  onChange={(e) => setStyleContent(e.target.value)}
                  placeholder="Enter content to apply styling to..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="selected-style">Style</Label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="style-content-type">Content Type</Label>
                  <Select value={styleContentType} onValueChange={setStyleContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="temperature">
                  Creativity Level: {temperature[0].toFixed(1)}
                </Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onValueChange={setTemperature}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <Label htmlFor="style-context">Context Information (Optional)</Label>
                <Textarea
                  id="style-context"
                  value={styleContextInfo}
                  onChange={(e) => setStyleContextInfo(e.target.value)}
                  placeholder="Additional context for styling..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="style-use-past"
                  checked={styleUsePastResults}
                  onCheckedChange={setStyleUsePastResults}
                />
                <Label htmlFor="style-use-past">Use Past Results for Context</Label>
              </div>

              <Button onClick={applyStyle} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Apply Style
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Enhancement History</CardTitle>
              <CardDescription>
                View and reuse your previous content enhancements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enhancements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No enhancements yet. Create your first enhancement using the tabs above.
                </p>
              ) : (
                <div className="space-y-4">
                  {enhancements.map((enhancement) => (
                    <Card key={enhancement.enhancement_id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                {enhancement.requirements ? 'Enrichment' : 'Styling'}
                              </Badge>
                              {enhancement.content_type && (
                                <Badge variant="secondary">{enhancement.content_type}</Badge>
                              )}
                              {enhancement.style && (
                                <Badge variant="secondary">{enhancement.style}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Created: {new Date(enhancement.created_at).toLocaleString()}
                            </p>
                            <p className="text-sm">
                              <strong>Original:</strong> {enhancement.original_content.substring(0, 100)}
                              {enhancement.original_content.length > 100 ? '...' : ''}
                            </p>
                          </div>
                          <Button
                            onClick={() => loadEnhancementById(enhancement.enhancement_id)}
                            variant="outline"
                            size="sm"
                          >
                            View Details
                          </Button>
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
            <CardTitle className="flex items-center justify-between">
              Enhancement Results
              <div className="flex space-x-2">
                <Button
                  onClick={() => copyToClipboard(results.enhanced_content)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Result
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Status: {results.status}</Badge>
                <Badge>ID: {results.enhancement_id}</Badge>
                {results.requirements && <Badge variant="secondary">Enrichment</Badge>}
                {results.style && <Badge variant="secondary">Style: {results.style}</Badge>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Original Content</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="text-sm whitespace-pre-wrap">
                      {results.original_content}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Length: {results.original_content.length} characters
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Enhanced Content</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <pre className="text-sm whitespace-pre-wrap max-h-96 overflow-auto">
                      {results.enhanced_content}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Length: {results.enhanced_content.length} characters
                    {results.requirements && (
                      <span className="ml-2 text-green-600">
                        ({Math.round(results.enhanced_content.length / results.original_content.length * 10) / 10}x expansion)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {results.requirements && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    {results.requirements}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}