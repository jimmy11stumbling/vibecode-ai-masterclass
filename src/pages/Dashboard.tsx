
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Bot, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Zap,
  Activity,
  Monitor,
  Database,
  Settings
} from 'lucide-react';
import { RealTimeStatusIndicator } from '@/components/RealTimeStatusIndicator';
import { RealTimeValidator } from '@/components/RealTimeValidator';
import { RealTimeChat } from '@/components/RealTimeChat';
import { ConsoleLogger } from '@/components/ConsoleLogger';
import { useRealTimeValidator } from '@/hooks/useRealTimeValidator';
import { useConsoleLogger } from '@/hooks/useConsoleLogger';

const Dashboard = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'processing' | 'error'>('connected');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [responseTime, setResponseTime] = useState<number>(245);
  const [currentProgress, setCurrentProgress] = useState(0);
  
  const {
    validations,
    validateSuccess,
    validateError,
    validateWarning,
    validateInfo,
    clearValidations,
    exportValidations
  } = useRealTimeValidator();

  const {
    logs,
    logInfo,
    logError,
    logWarn,
    logDebug,
    clearLogs,
    exportLogs
  } = useConsoleLogger();

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setResponseTime(Math.floor(Math.random() * 500) + 100);
      setCurrentProgress(prev => (prev + 1) % 101);
      
      // Add some random validations
      const validationTypes = [
        () => validateSuccess('Component rendered successfully', 'All props validated', 'Dashboard'),
        () => validateInfo('State updated', 'Connection status changed', 'Dashboard'),
        () => validateWarning('Slow response detected', 'Response time > 300ms', 'Dashboard'),
      ];
      
      if (Math.random() < 0.3) {
        validationTypes[Math.floor(Math.random() * validationTypes.length)]();
      }
      
      // Add some random logs
      const logTypes = [
        () => logInfo('Dashboard update cycle completed', { timestamp: new Date() }, 'Dashboard'),
        () => logDebug('Performance metrics updated', { responseTime, progress: currentProgress }, 'Dashboard'),
      ];
      
      if (Math.random() < 0.2) {
        logTypes[Math.floor(Math.random() * logTypes.length)]();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [responseTime, currentProgress, validateSuccess, validateInfo, validateWarning, logInfo, logDebug]);

  const handleChatMessage = (message: string) => {
    logInfo('Chat message received', { message }, 'RealTimeChat');
    validateInfo('Processing user message', message, 'RealTimeChat');
    setConnectionStatus('processing');
    
    setTimeout(() => {
      setConnectionStatus('connected');
      validateSuccess('Message processed successfully', 'AI response generated', 'RealTimeChat');
    }, 2000);
  };

  const handleRetryConnection = () => {
    setConnectionStatus('connecting');
    logInfo('Retrying connection', {}, 'Dashboard');
    
    setTimeout(() => {
      setConnectionStatus('connected');
      validateSuccess('Connection restored', 'Successfully reconnected to AI service', 'Dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Learning Dashboard
            </h1>
            <p className="text-slate-300">
              Track your progress and explore new technologies
            </p>
          </div>
          
          <RealTimeStatusIndicator
            status={connectionStatus}
            lastUpdate={lastUpdate}
            responseTime={responseTime}
            onRetry={handleRetryConnection}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <Monitor className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="learning" className="data-[state=active]:bg-purple-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="coding" className="data-[state=active]:bg-purple-600">
              <Code className="w-4 h-4 mr-2" />
              Coding
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600">
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="validator" className="data-[state=active]:bg-purple-600">
              <Activity className="w-4 h-4 mr-2" />
              Validator
            </TabsTrigger>
            <TabsTrigger value="console" className="data-[state=active]:bg-purple-600">
              <Database className="w-4 h-4 mr-2" />
              Console
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">12</div>
                  <Badge variant="secondary" className="mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +3 this week
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Learning Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">47.5</div>
                  <Badge variant="secondary" className="mt-2">
                    <Activity className="w-3 h-3 mr-1" />
                    This month
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Validations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{validations.length}</div>
                  <Badge variant="secondary" className="mt-2">
                    <Zap className="w-3 h-3 mr-1" />
                    Real-time
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Console Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{logs.length}</div>
                  <Badge variant="secondary" className="mt-2">
                    <Database className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">React Hooks</span>
                      <span className="text-white">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">TypeScript</span>
                      <span className="text-white">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Real-time Systems</span>
                      <span className="text-white">{currentProgress}%</span>
                    </div>
                    <Progress value={currentProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-300">Completed React tutorial</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-slate-300">Started TypeScript project</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-slate-300">AI validation system active</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-slate-300">Real-time logging enabled</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Resource Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">React Hooks Complete Guide</h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Comprehensive guide to using React hooks effectively in modern applications.
                    </p>
                    <Badge className="bg-blue-600">Intermediate</Badge>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">TypeScript Best Practices</h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Learn TypeScript patterns and practices for building scalable applications.
                    </p>
                    <Badge className="bg-red-600">Advanced</Badge>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Real-time Systems</h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Build responsive real-time applications with modern web technologies.
                    </p>
                    <Badge className="bg-green-600">Beginner</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coding Tab */}
          <TabsContent value="coding">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Code Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 p-4 rounded-lg">
                  <pre className="text-sm text-slate-300 overflow-x-auto">
                    <code>{`// Real-time validation example
const { validateSuccess, validateError } = useRealTimeValidator();

useEffect(() => {
  validateInfo('Component mounted', 'Dashboard initialized');
  
  const interval = setInterval(() => {
    validateSuccess('Heartbeat', 'System operational');
  }, 5000);
  
  return () => clearInterval(interval);
}, []);`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="h-[600px]">
              <RealTimeChat
                onMessage={handleChatMessage}
                isConnected={connectionStatus === 'connected'}
              />
            </div>
          </TabsContent>

          {/* Validator Tab */}
          <TabsContent value="validator">
            <div className="h-[600px]">
              <RealTimeValidator
                validations={validations}
                onClear={clearValidations}
                onExport={exportValidations}
              />
            </div>
          </TabsContent>

          {/* Console Tab */}
          <TabsContent value="console">
            <div className="h-[600px]">
              <ConsoleLogger
                logs={logs}
                onClear={clearLogs}
                onExport={exportLogs}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
