
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { VirtualizedList } from '@/components/VirtualizedList';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { testRunner, TestResult, TestSuite } from '@/services/testing/testRunner';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Bug,
  Shield,
  Zap,
  Eye,
  RefreshCw,
  Download,
  FileText,
  BarChart3,
  Target,
  Code2,
  Users,
  Layers
} from 'lucide-react';

export const EnhancedTestingDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [overallCoverage, setOverallCoverage] = useState(0);
  const { measureRenderTime, measureMemoryUsage, metrics } = usePerformanceOptimization();

  useEffect(() => {
    const endMeasure = measureRenderTime('EnhancedTestingDashboard');
    measureMemoryUsage();
    
    // Load initial test suites
    setTestSuites(testRunner.getTestSuites());
    
    // Add listener for test results
    const handleTestResults = (results: TestResult[]) => {
      setTestResults(results);
      const avgCoverage = results.reduce((sum, r) => sum + (r.coverage || 0), 0) / results.length;
      setOverallCoverage(avgCoverage);
    };
    
    testRunner.addListener(handleTestResults);
    
    return () => {
      endMeasure();
      testRunner.removeListener(handleTestResults);
    };
  }, [measureRenderTime, measureMemoryUsage]);

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      await testRunner.runAllTests();
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const generateReport = async () => {
    const report = await testRunner.generateTestReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'skipped': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: TestResult['type']) => {
    switch (type) {
      case 'unit': return <Code2 className="w-4 h-4 text-blue-400" />;
      case 'integration': return <Layers className="w-4 h-4 text-purple-400" />;
      case 'e2e': return <Users className="w-4 h-4 text-green-400" />;
      case 'visual': return <Eye className="w-4 h-4 text-pink-400" />;
      case 'performance': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'security': return <Shield className="w-4 h-4 text-red-400" />;
      default: return <TestTube className="w-4 h-4 text-gray-400" />;
    }
  };

  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;

  return (
    <ErrorBoundary>
      <div className="h-full bg-slate-900 text-white">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <div className="border-b border-slate-700 px-4 py-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Enhanced Testing Dashboard</h2>
              <div className="flex space-x-2">
                <Button
                  onClick={runAllTests}
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRunning ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isRunning ? 'Running...' : 'Run All Tests'}
                </Button>
                <Button variant="outline" onClick={generateReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
            
            <TabsList className="bg-slate-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="suites" className="data-[state=active]:bg-slate-700">
                <TestTube className="w-4 h-4 mr-2" />
                Test Suites
              </TabsTrigger>
              <TabsTrigger value="coverage" className="data-[state=active]:bg-slate-700">
                <Target className="w-4 h-4 mr-2" />
                Coverage
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-slate-700">
                <Zap className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full m-0">
              <div className="p-4 space-y-6">
                {/* Performance Metrics */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {metrics.renderTime.toFixed(2)}ms
                        </div>
                        <div className="text-slate-400 text-sm">Render Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {metrics.memoryUsage.toFixed(1)}MB
                        </div>
                        <div className="text-slate-400 text-sm">Memory Usage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {overallCoverage.toFixed(1)}%
                        </div>
                        <div className="text-slate-400 text-sm">Test Coverage</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Total Tests</p>
                          <p className="text-2xl font-bold text-white">{totalTests}</p>
                        </div>
                        <TestTube className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Passed</p>
                          <p className="text-2xl font-bold text-green-400">{passedTests}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Failed</p>
                          <p className="text-2xl font-bold text-red-400">{failedTests}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Coverage</p>
                          <p className="text-2xl font-bold text-blue-400">{overallCoverage.toFixed(1)}%</p>
                        </div>
                        <Target className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Virtualized Test Results */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Test Results</CardTitle>
                    <CardDescription>Virtualized list for optimal performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VirtualizedList
                      items={testResults}
                      itemHeight={60}
                      containerHeight={300}
                      renderItem={(test, index) => (
                        <div className="flex items-center justify-between p-3 border-b border-slate-700">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <p className="text-white font-medium">{test.name}</p>
                              <p className="text-slate-400 text-sm">{test.file}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-300 text-sm">{test.duration}ms</p>
                            {test.coverage && (
                              <p className="text-slate-400 text-xs">{test.coverage}%</p>
                            )}
                          </div>
                        </div>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="suites" className="h-full m-0">
              <div className="h-full flex">
                {/* Test Suites List */}
                <div className="w-1/3 border-r border-slate-700">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">Test Suites</h3>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                      {testSuites.map((suite) => (
                        <Card
                          key={suite.id}
                          className={`bg-slate-800 border-slate-700 cursor-pointer transition-all ${
                            selectedSuite?.id === suite.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => setSelectedSuite(suite)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-medium">{suite.name}</h4>
                              <Badge className={
                                suite.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                suite.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                              }>
                                {suite.status}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm mt-1">
                              {suite.tests.length} tests
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Test Details */}
                <div className="flex-1">
                  {selectedSuite ? (
                    <div className="h-full flex flex-col">
                      <div className="p-4 border-b border-slate-700">
                        <h3 className="text-lg font-semibold text-white">{selectedSuite.name}</h3>
                        <p className="text-slate-400 text-sm">
                          {selectedSuite.tests.length} tests • Coverage: {selectedSuite.coverage.toFixed(1)}%
                        </p>
                      </div>
                      
                      <ScrollArea className="flex-1">
                        <div className="p-4 space-y-2">
                          {testResults.filter(test => test.file.startsWith(selectedSuite.name)).map((test) => (
                            <div key={test.id} className="p-3 bg-slate-800 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(test.status)}
                                  {getTypeIcon(test.type)}
                                  <span className="text-white font-medium">{test.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {test.coverage && (
                                    <Badge variant="outline" className="text-xs">
                                      {test.coverage}% coverage
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {test.type}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-slate-400">
                                <span>{test.file}</span>
                                <span>{test.duration}ms</span>
                              </div>
                              
                              {test.error && (
                                <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded text-red-300 text-sm">
                                  <Bug className="w-4 h-4 inline mr-1" />
                                  {test.error}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select a test suite to view details</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="coverage" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Code Coverage Report</CardTitle>
                      <CardDescription>Detailed coverage analysis for your codebase</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-400">{overallCoverage.toFixed(1)}%</div>
                          <div className="text-slate-400 text-sm">Overall Coverage</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-400">N/A</div>
                          <div className="text-slate-400 text-sm">Statements</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-400">N/A</div>
                          <div className="text-slate-400 text-sm">Branches</div>
                        </div>
                      </div>
                    
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">src/components/</span>
                          <div className="flex items-center space-x-3">
                            <Progress value={89} className="w-24 h-2" />
                            <span className="text-slate-400 text-sm w-12">89%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">src/services/</span>
                          <div className="flex items-center space-x-3">
                            <Progress value={76} className="w-24 h-2" />
                            <span className="text-slate-400 text-sm w-12">76%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">src/utils/</span>
                          <div className="flex items-center space-x-3">
                            <Progress value={95} className="w-24 h-2" />
                            <span className="text-slate-400 text-sm w-12">95%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="performance" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Performance Analysis</CardTitle>
                      <CardDescription>Component render times and memory usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">Render Time</span>
                            <span className="text-slate-300">{metrics.renderTime.toFixed(2)}ms</span>
                          </div>
                          <Progress value={Math.min(metrics.renderTime / 50 * 100, 100)} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">Memory Usage</span>
                            <span className="text-slate-300">{metrics.memoryUsage.toFixed(2)} MB</span>
                          </div>
                          <Progress value={Math.min(metrics.memoryUsage / 200 * 100, 100)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};
