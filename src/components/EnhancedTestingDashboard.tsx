
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Bug,
  Shield,
  Zap,
  Eye,
  Settings,
  RefreshCw,
  Download,
  FileText,
  BarChart3,
  Target,
  Layers,
  Code2,
  Users
} from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'visual' | 'performance' | 'security';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  file: string;
  line?: number;
  error?: string;
  coverage?: number;
}

interface TestSuite {
  id: string;
  name: string;
  tests: TestCase[];
  status: 'pending' | 'running' | 'completed';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

const mockTestSuites: TestSuite[] = [
  {
    id: '1',
    name: 'Component Tests',
    status: 'completed',
    totalTests: 15,
    passedTests: 13,
    failedTests: 2,
    duration: 2340,
    tests: [
      {
        id: '1-1',
        name: 'App component renders correctly',
        type: 'unit',
        status: 'passed',
        duration: 120,
        file: 'App.test.tsx',
        coverage: 95
      },
      {
        id: '1-2',
        name: 'Button click handlers work',
        type: 'unit',
        status: 'passed',
        duration: 85,
        file: 'Button.test.tsx',
        coverage: 100
      },
      {
        id: '1-3',
        name: 'Form validation logic',
        type: 'unit',
        status: 'failed',
        duration: 200,
        file: 'Form.test.tsx',
        line: 25,
        error: 'Expected validation to fail for empty email field',
        coverage: 78
      }
    ]
  },
  {
    id: '2',
    name: 'API Integration Tests',
    status: 'running',
    totalTests: 8,
    passedTests: 5,
    failedTests: 0,
    duration: 1200,
    tests: [
      {
        id: '2-1',
        name: 'User authentication flow',
        type: 'integration',
        status: 'passed',
        duration: 340,
        file: 'auth.test.tsx',
        coverage: 92
      },
      {
        id: '2-2',
        name: 'Data fetching and caching',
        type: 'integration',
        status: 'running',
        duration: 0,
        file: 'api.test.tsx'
      }
    ]
  },
  {
    id: '3',
    name: 'E2E User Flows',
    status: 'pending',
    totalTests: 12,
    passedTests: 0,
    failedTests: 0,
    duration: 0,
    tests: [
      {
        id: '3-1',
        name: 'Complete user signup flow',
        type: 'e2e',
        status: 'pending',
        duration: 0,
        file: 'signup.e2e.tsx'
      },
      {
        id: '3-2',
        name: 'Purchase workflow',
        type: 'e2e',
        status: 'pending',
        duration: 0,
        file: 'purchase.e2e.tsx'
      }
    ]
  }
];

export const EnhancedTestingDashboard: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>(mockTestSuites);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [testFilter, setTestFilter] = useState<string>('all');

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
  const overallCoverage = 85.6; // Mock coverage percentage

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'skipped': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: TestCase['type']) => {
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

  const runAllTests = async () => {
    setIsRunningAll(true);
    
    // Simulate running all tests
    for (const suite of testSuites) {
      if (suite.status === 'pending') {
        suite.status = 'running';
        setTestSuites([...testSuites]);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        suite.status = 'completed';
        suite.passedTests = Math.floor(suite.totalTests * 0.8);
        suite.failedTests = suite.totalTests - suite.passedTests;
        setTestSuites([...testSuites]);
      }
    }
    
    setIsRunningAll(false);
  };

  const generateTestReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        coverage: overallCoverage
      },
      suites: testSuites
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-slate-900 text-white">
      <Tabs defaultValue="overview" className="h-full flex flex-col">
        <div className="border-b border-slate-700 px-4 py-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Testing Dashboard</h2>
            <div className="flex space-x-2">
              <Button
                onClick={runAllTests}
                disabled={isRunningAll}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunningAll ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isRunningAll ? 'Running...' : 'Run All Tests'}
              </Button>
              <Button variant="outline" onClick={generateTestReport}>
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
            <TabsTrigger value="reports" className="data-[state=active]:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="h-full m-0">
            <div className="p-4 space-y-6">
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
                        <p className="text-2xl font-bold text-green-400">{totalPassed}</p>
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
                        <p className="text-2xl font-bold text-red-400">{totalFailed}</p>
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
                        <p className="text-2xl font-bold text-blue-400">{overallCoverage}%</p>
                      </div>
                      <Target className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Test Suites Overview */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Test Suites Status</CardTitle>
                  <CardDescription>Overview of all test suites and their current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testSuites.map((suite) => (
                      <div key={suite.id} className="p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium">{suite.name}</h4>
                            <p className="text-slate-400 text-sm">
                              {suite.totalTests} tests • {suite.passedTests} passed • {suite.failedTests} failed
                            </p>
                          </div>
                          <Badge className={
                            suite.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            suite.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }>
                            {suite.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <Progress 
                              value={suite.totalTests > 0 ? (suite.passedTests / suite.totalTests) * 100 : 0}
                              className="h-2"
                            />
                          </div>
                          <span className="text-slate-400 text-sm">
                            {suite.totalTests > 0 ? Math.round((suite.passedTests / suite.totalTests) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                            {suite.totalTests} tests
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
                        {selectedSuite.totalTests} tests • Duration: {(selectedSuite.duration / 1000).toFixed(1)}s
                      </p>
                    </div>
                    
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-2">
                        {selectedSuite.tests.map((test) => (
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
                              <span>{test.file}{test.line && `:${test.line}`}</span>
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
                        <div className="text-3xl font-bold text-green-400">{overallCoverage}%</div>
                        <div className="text-slate-400 text-sm">Overall Coverage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">92.3%</div>
                        <div className="text-slate-400 text-sm">Statements</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400">88.7%</div>
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

          <TabsContent value="reports" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Test Reports</CardTitle>
                    <CardDescription>Historical test reports and analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">Test Run #247</h4>
                          <p className="text-slate-400 text-sm">January 15, 2024 • 10:30 AM</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-green-500/20 text-green-400">Passed</Badge>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">Test Run #246</h4>
                          <p className="text-slate-400 text-sm">January 15, 2024 • 9:15 AM</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
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
  );
};
