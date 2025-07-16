
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  Brain, 
  Settings, 
  Activity, 
  Zap, 
  Code,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { DeepSeekReasonerCore } from '@/services/deepSeekReasonerCore';
import { useToast } from '@/hooks/use-toast';

interface ReasoningSession {
  id: string;
  query: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  reasoning: string;
  conclusion: string;
  confidence: number;
  timestamp: Date;
  processingTime: number;
}

interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export const DeepSeekReasonerDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<ReasoningSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.3,
    maxTokens: 4000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  });
  
  const { apiKey, streamingStats } = useDeepSeekAPI();
  const { toast } = useToast();

  const [reasonerCore] = useState(() => new DeepSeekReasonerCore(apiKey));

  useEffect(() => {
    if (apiKey) {
      reasonerCore.setApiKey(apiKey);
    }
  }, [apiKey, reasonerCore]);

  const startReasoningSession = async (query: string) => {
    if (!query.trim()) return;

    const sessionId = `session_${Date.now()}`;
    const newSession: ReasoningSession = {
      id: sessionId,
      query,
      status: 'processing',
      reasoning: '',
      conclusion: '',
      confidence: 0,
      timestamp: new Date(),
      processingTime: 0
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSession(sessionId);
    setIsProcessing(true);

    try {
      const startTime = Date.now();
      
      const result = await reasonerCore.performAdvancedReasoning({
        projectId: 'current',
        userQuery: query,
        systemInstructions: `You are DeepSeek Reasoner, an advanced AI system with deep reasoning capabilities. 
        
Configuration:
- Temperature: ${modelConfig.temperature}
- Max Tokens: ${modelConfig.maxTokens}
- Top P: ${modelConfig.topP}

Provide structured, step-by-step reasoning with clear conclusions and confidence assessments.`
      });

      const processingTime = Date.now() - startTime;

      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              status: 'completed',
              reasoning: result.reasoning,
              conclusion: result.conclusion,
              confidence: result.confidence,
              processingTime
            }
          : session
      ));

      toast({
        title: "Reasoning Complete",
        description: `Session completed in ${(processingTime / 1000).toFixed(1)}s with ${Math.round(result.confidence * 100)}% confidence`,
      });

    } catch (error) {
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'error' }
          : session
      ));

      toast({
        title: "Reasoning Failed",
        description: "Failed to complete reasoning session",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: ReasoningSession['status']) => {
    switch (status) {
      case 'processing':
        return <Activity className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: ReasoningSession['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">DeepSeek Reasoner</h2>
              <p className="text-sm text-slate-400">Advanced AI Reasoning Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs ${apiKey ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {apiKey ? 'Connected' : 'No API Key'}
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
              {sessions.length} Sessions
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="reasoning" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-b border-slate-700">
          <TabsTrigger value="reasoning" className="data-[state=active]:bg-slate-700">
            Reasoning
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-slate-700">
            Configuration
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="reasoning" className="h-full m-0">
            <div className="h-full flex">
              {/* Sessions List */}
              <div className="w-1/3 border-r border-slate-700">
                <div className="p-4">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Enter your reasoning query..."
                      className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isProcessing) {
                          startReasoningSession(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      disabled={!apiKey || isProcessing}
                    />
                  </div>
                  
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <Card
                          key={session.id}
                          className={`cursor-pointer transition-all ${
                            activeSession === session.id 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                          }`}
                          onClick={() => setActiveSession(session.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm text-white font-medium line-clamp-2">
                                {session.query}
                              </p>
                              {getStatusIcon(session.status)}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                                {session.status}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {session.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Session Details */}
              <div className="flex-1 p-4">
                {activeSession ? (
                  (() => {
                    const session = sessions.find(s => s.id === activeSession);
                    if (!session) return null;

                    return (
                      <div className="h-full">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-white mb-2">Reasoning Session</h3>
                          <p className="text-slate-300">{session.query}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-3">
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Status</p>
                                <div className="flex items-center justify-center mt-1">
                                  {getStatusIcon(session.status)}
                                  <span className="ml-2 text-sm text-white capitalize">
                                    {session.status}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-3">
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Confidence</p>
                                <p className="text-lg font-bold text-white mt-1">
                                  {Math.round(session.confidence * 100)}%
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-3">
                              <div className="text-center">
                                <p className="text-sm text-slate-400">Time</p>
                                <p className="text-lg font-bold text-white mt-1">
                                  {(session.processingTime / 1000).toFixed(1)}s
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <ScrollArea className="h-[calc(100vh-500px)]">
                          <div className="space-y-4">
                            {session.reasoning && (
                              <Card className="bg-slate-800 border-slate-700">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm text-white flex items-center">
                                    <Brain className="w-4 h-4 mr-2" />
                                    Reasoning Process
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                                    {session.reasoning}
                                  </pre>
                                </CardContent>
                              </Card>
                            )}

                            {session.conclusion && (
                              <Card className="bg-slate-800 border-slate-700">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm text-white flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Conclusion
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-slate-300">
                                    {session.conclusion}
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    );
                  })()
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400">Select a reasoning session to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="h-full m-0 p-4">
            <div className="grid grid-cols-2 gap-6 h-full">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Session Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{sessions.length}</p>
                      <p className="text-sm text-slate-400">Total Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {sessions.filter(s => s.status === 'completed').length}
                      </p>
                      <p className="text-sm text-slate-400">Completed</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-400">
                      {sessions.length > 0 
                        ? Math.round(sessions.reduce((acc, s) => acc + s.confidence, 0) / sessions.length * 100)
                        : 0
                      }%
                    </p>
                    <p className="text-sm text-slate-400">Avg Confidence</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {sessions.length > 0 
                        ? (sessions.reduce((acc, s) => acc + s.processingTime, 0) / sessions.length / 1000).toFixed(1)
                        : 0
                      }s
                    </p>
                    <p className="text-sm text-slate-400">Avg Processing Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{streamingStats.tokensReceived}</p>
                    <p className="text-sm text-slate-400">Tokens Processed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="config" className="h-full m-0 p-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Model Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Temperature: {modelConfig.temperature}
                  </label>
                  <Slider
                    value={[modelConfig.temperature]}
                    onValueChange={([value]) => 
                      setModelConfig(prev => ({ ...prev, temperature: value }))
                    }
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Max Tokens: {modelConfig.maxTokens}
                  </label>
                  <Slider
                    value={[modelConfig.maxTokens]}
                    onValueChange={([value]) => 
                      setModelConfig(prev => ({ ...prev, maxTokens: value }))
                    }
                    max={8000}
                    min={1000}
                    step={100}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Top P: {modelConfig.topP}
                  </label>
                  <Slider
                    value={[modelConfig.topP]}
                    onValueChange={([value]) => 
                      setModelConfig(prev => ({ ...prev, topP: value }))
                    }
                    max={1}
                    min={0}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={() => {
                    toast({
                      title: "Configuration Saved",
                      description: "Model configuration has been updated",
                    });
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
