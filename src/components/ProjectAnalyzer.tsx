
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  Layers,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { dynamicCodeModifier } from '@/services/dynamicCodeModifier';

interface ProjectMetrics {
  totalFiles: number;
  totalLines: number;
  fileTypes: Record<string, number>;
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
  issues: ProjectIssue[];
  suggestions: string[];
}

interface ProjectIssue {
  type: 'error' | 'warning' | 'info';
  file: string;
  message: string;
  line?: number;
}

export const ProjectAnalyzer: React.FC = () => {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const analyzeProject = async () => {
    setIsAnalyzing(true);
    
    try {
      const structure = await dynamicCodeModifier.getProjectStructure();
      const analysis = await performProjectAnalysis(structure);
      setMetrics(analysis);
      setLastAnalysis(new Date());
    } catch (error) {
      console.error('Project analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performProjectAnalysis = async (structure: any[]): Promise<ProjectMetrics> => {
    let totalFiles = 0;
    let totalLines = 0;
    const fileTypes: Record<string, number> = {};
    const issues: ProjectIssue[] = [];
    const dependencies: string[] = [];
    const suggestions: string[] = [];

    // Analyze each file
    for (const node of structure) {
      if (node.type === 'file') {
        totalFiles++;
        
        const content = await dynamicCodeModifier.readFile(node.path);
        if (content) {
          const lines = content.split('\n').length;
          totalLines += lines;
          
          const ext = node.path.split('.').pop()?.toLowerCase() || '';
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
          
          // Analyze file content
          const fileIssues = analyzeFileContent(content, node.path);
          issues.push(...fileIssues);
          
          // Extract dependencies
          const fileDeps = extractDependencies(content);
          dependencies.push(...fileDeps);
        }
      }
    }

    // Determine complexity
    const complexity = totalFiles > 50 ? 'high' : totalFiles > 20 ? 'medium' : 'low';

    // Generate suggestions
    if (fileTypes['tsx'] && !fileTypes['test']) {
      suggestions.push('Consider adding unit tests for your React components');
    }
    if (!fileTypes['json'] || !dependencies.includes('package.json')) {
      suggestions.push('Consider adding a package.json file for dependency management');
    }
    if (totalLines / totalFiles > 100) {
      suggestions.push('Some files are quite large, consider breaking them into smaller modules');
    }

    return {
      totalFiles,
      totalLines,
      fileTypes,
      complexity,
      dependencies: [...new Set(dependencies)],
      issues,
      suggestions
    };
  };

  const analyzeFileContent = (content: string, filePath: string): ProjectIssue[] => {
    const issues: ProjectIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for common issues
      if (line.includes('console.log') && !filePath.includes('debug')) {
        issues.push({
          type: 'warning',
          file: filePath,
          message: 'Console.log statement found in production code',
          line: index + 1
        });
      }

      if (line.includes('// TODO') || line.includes('// FIXME')) {
        issues.push({
          type: 'info',
          file: filePath,
          message: 'TODO/FIXME comment found',
          line: index + 1
        });
      }

      if (line.includes('any') && filePath.endsWith('.ts')) {
        issues.push({
          type: 'warning',
          file: filePath,
          message: 'TypeScript "any" type used - consider specific typing',
          line: index + 1
        });
      }
    });

    return issues;
  };

  const extractDependencies = (content: string): string[] => {
    const deps: string[] = [];
    const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const dep = match[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        deps.push(dep);
      }
    }

    return deps;
  };

  useEffect(() => {
    analyzeProject();
  }, []);

  const getIssueIcon = (type: ProjectIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Project Analyzer</h3>
          <p className="text-sm text-slate-400">
            Comprehensive analysis of your codebase
          </p>
        </div>
        <Button
          onClick={analyzeProject}
          disabled={isAnalyzing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <BarChart3 className="w-4 h-4 mr-2" />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {metrics && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{metrics.totalFiles}</p>
                    <p className="text-xs text-slate-400">Files</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{metrics.totalLines}</p>
                    <p className="text-xs text-slate-400">Lines</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className={`text-2xl font-bold ${getComplexityColor(metrics.complexity)}`}>
                      {metrics.complexity.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400">Complexity</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{metrics.issues.length}</p>
                    <p className="text-xs text-slate-400">Issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Types */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">File Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.fileTypes).map(([ext, count]) => (
                  <div key={ext} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">.{ext}</Badge>
                      <span className="text-sm text-slate-300">{count} files</span>
                    </div>
                    <Progress 
                      value={(count / metrics.totalFiles) * 100} 
                      className="w-20 h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          {metrics.issues.length > 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {metrics.issues.map((issue, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-slate-700 rounded">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <p className="text-sm text-white">{issue.message}</p>
                          <p className="text-xs text-slate-400">
                            {issue.file}{issue.line && `:${issue.line}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {metrics.suggestions.length > 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                      <p className="text-sm text-slate-300">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lastAnalysis && (
            <p className="text-xs text-slate-500 text-center">
              Last analyzed: {lastAnalysis.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {!metrics && !isAnalyzing && (
        <div className="text-center text-slate-500 py-8">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Click "Analyze" to start project analysis</p>
        </div>
      )}
    </div>
  );
};
