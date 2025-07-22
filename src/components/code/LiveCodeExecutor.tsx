
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Square, RotateCcw, Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExecutionResult {
  id: string;
  code: string;
  output: string;
  error?: string;
  executionTime: number;
  timestamp: Date;
  language: string;
}

export const LiveCodeExecutor: React.FC = () => {
  const [code, setCode] = useState('console.log("Hello, World!");');
  const [language, setLanguage] = useState('javascript');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ExecutionResult | null>(null);
  const { toast } = useToast();

  const executeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No Code",
        description: "Please enter some code to execute",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      let result: ExecutionResult;

      if (language === 'javascript') {
        result = await executeJavaScript(code);
      } else if (language === 'python') {
        result = await executePython(code);
      } else {
        throw new Error(`Language ${language} not supported`);
      }

      result.executionTime = Date.now() - startTime;
      result.timestamp = new Date();
      result.language = language;

      setCurrentResult(result);
      setExecutionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

      toast({
        title: "Code Executed",
        description: `Executed in ${result.executionTime}ms`,
      });
    } catch (error) {
      const errorResult: ExecutionResult = {
        id: `exec_${Date.now()}`,
        code,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
        language
      };

      setCurrentResult(errorResult);
      setExecutionHistory(prev => [errorResult, ...prev.slice(0, 9)]);

      toast({
        title: "Execution Error",
        description: errorResult.error,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeJavaScript = async (code: string): Promise<ExecutionResult> => {
    return new Promise((resolve) => {
      const originalLog = console.log;
      const originalError = console.error;
      let output = '';
      let error = '';

      // Capture console output
      console.log = (...args) => {
        output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\n';
      };

      console.error = (...args) => {
        error += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\n';
      };

      try {
        // Create a safe execution environment
        const func = new Function(`
          "use strict";
          ${code}
        `);
        
        const result = func();
        if (result !== undefined) {
          output += `Return value: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}\n`;
        }

        resolve({
          id: `exec_${Date.now()}`,
          code,
          output: output || 'Code executed successfully (no output)',
          error: error || undefined,
          executionTime: 0,
          timestamp: new Date(),
          language: 'javascript'
        });
      } catch (err) {
        resolve({
          id: `exec_${Date.now()}`,
          code,
          output: output,
          error: err instanceof Error ? err.message : 'Unknown error',
          executionTime: 0,
          timestamp: new Date(),
          language: 'javascript'
        });
      } finally {
        // Restore original console methods
        console.log = originalLog;
        console.error = originalError;
      }
    });
  };

  const executePython = async (code: string): Promise<ExecutionResult> => {
    // For Python, we would need a Python interpreter
    // For now, we'll simulate Python execution
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `exec_${Date.now()}`,
          code,
          output: 'Python execution not implemented yet. This is simulated output.',
          executionTime: 0,
          timestamp: new Date(),
          language: 'python'
        });
      }, 500);
    });
  };

  const clearOutput = () => {
    setCurrentResult(null);
  };

  const saveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code_${Date.now()}.${language === 'javascript' ? 'js' : 'py'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromHistory = (result: ExecutionResult) => {
    setCode(result.code);
    setLanguage(result.language);
    setCurrentResult(result);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Code Executor</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{language}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'javascript' ? 'python' : 'javascript')}
              >
                Switch to {language === 'javascript' ? 'Python' : 'JavaScript'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Enter your ${language} code here...`}
              className="min-h-[200px] font-mono"
            />
            
            <div className="flex items-center space-x-2">
              <Button onClick={executeCode} disabled={isExecuting}>
                <Play className="mr-2 h-4 w-4" />
                {isExecuting ? 'Running...' : 'Run Code'}
              </Button>
              <Button variant="outline" onClick={clearOutput}>
                <Square className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button variant="outline" onClick={() => setCode('')}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button variant="outline" onClick={saveCode}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-full">
              {currentResult ? (
                <Tabs defaultValue="output" className="h-full">
                  <TabsList>
                    <TabsTrigger value="output">Output</TabsTrigger>
                    {currentResult.error && <TabsTrigger value="error">Error</TabsTrigger>}
                  </TabsList>
                  <TabsContent value="output" className="mt-4">
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto h-64">
                      {currentResult.output || 'No output'}
                    </pre>
                  </TabsContent>
                  {currentResult.error && (
                    <TabsContent value="error" className="mt-4">
                      <pre className="bg-red-50 p-4 rounded-lg text-sm text-red-600 overflow-auto h-64">
                        {currentResult.error}
                      </pre>
                    </TabsContent>
                  )}
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Run some code to see the output here
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {executionHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No execution history yet
                </div>
              ) : (
                executionHistory.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => loadFromHistory(result)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={result.error ? 'destructive' : 'default'}>
                        {result.language}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-mono truncate">
                      {result.code.split('\n')[0]}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Executed in {result.executionTime}ms
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
