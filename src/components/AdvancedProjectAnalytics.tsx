
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock,
  Code, FileText, Users, Zap, Target, Award, Activity
} from 'lucide-react';

interface ProjectMetrics {
  codeQuality: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    issues: number;
    coverage: number;
  };
  performance: {
    buildTime: number;
    bundleSize: number;
    lighthouse: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
    };
  };
  productivity: {
    linesOfCode: number;
    commits: number;
    filesModified: number;
    velocity: number;
  };
  collaboration: {
    activeUsers: number;
    comments: number;
    reviews: number;
    mergeRequests: number;
  };
}

interface TimeSeriesData {
  date: string;
  codeQuality: number;
  productivity: number;
  performance: number;
  collaboration: number;
}

interface IssueBreakdown {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  color: string;
}

export const AdvancedProjectAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    codeQuality: { score: 85, trend: 'up', issues: 12, coverage: 78 },
    performance: {
      buildTime: 45,
      bundleSize: 2.1,
      lighthouse: { performance: 92, accessibility: 88, bestPractices: 90, seo: 85 }
    },
    productivity: { linesOfCode: 15420, commits: 156, filesModified: 89, velocity: 23 },
    collaboration: { activeUsers: 4, comments: 67, reviews: 23, mergeRequests: 12 }
  });

  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([
    { date: '2024-01-01', codeQuality: 82, productivity: 75, performance: 88, collaboration: 65 },
    { date: '2024-01-08', codeQuality: 84, productivity: 78, performance: 90, collaboration: 70 },
    { date: '2024-01-15', codeQuality: 83, productivity: 82, performance: 89, collaboration: 72 },
    { date: '2024-01-22', codeQuality: 85, productivity: 85, performance: 92, collaboration: 75 },
    { date: '2024-01-29', codeQuality: 87, productivity: 88, performance: 91, collaboration: 78 },
  ]);

  const [issueBreakdown, setIssueBreakdown] = useState<IssueBreakdown[]>([
    { type: 'Type Errors', count: 5, severity: 'high', color: '#ef4444' },
    { type: 'Linting Issues', count: 7, severity: 'medium', color: '#f59e0b' },
    { type: 'Accessibility', count: 3, severity: 'medium', color: '#8b5cf6' },
    { type: 'Performance', count: 2, severity: 'low', color: '#06b6d4' }
  ]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full space-y-6 p-6 bg-slate-950">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Code Quality</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getScoreColor(metrics.codeQuality.score)}`}>
                    {metrics.codeQuality.score}
                  </span>
                  {getTrendIcon(metrics.codeQuality.trend)}
                </div>
                <p className="text-xs text-slate-500">{metrics.codeQuality.issues} issues</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Performance</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getScoreColor(metrics.performance.lighthouse.performance)}`}>
                    {metrics.performance.lighthouse.performance}
                  </span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-slate-500">{metrics.performance.buildTime}s build</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Productivity</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-blue-500">{metrics.productivity.velocity}</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-slate-500">{metrics.productivity.commits} commits</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Collaboration</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-purple-500">{metrics.collaboration.activeUsers}</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-slate-500">{metrics.collaboration.reviews} reviews</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Trends Chart */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Project Health Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="codeQuality" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="productivity" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="collaboration" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Issues Breakdown */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Issue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={issueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {issueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
                    <Award className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-white">Code quality improved by 3%</p>
                      <p className="text-xs text-slate-400">Great work on reducing technical debt!</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-white">Bundle size increased</p>
                      <p className="text-xs text-slate-400">Consider code splitting for better performance</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-white">Team velocity up 15%</p>
                      <p className="text-xs text-slate-400">Excellent collaboration this week</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Lighthouse Scores */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Lighthouse Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">Performance</span>
                      <span className={`text-sm font-medium ${getScoreColor(metrics.performance.lighthouse.performance)}`}>
                        {metrics.performance.lighthouse.performance}
                      </span>
                    </div>
                    <Progress value={metrics.performance.lighthouse.performance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">Accessibility</span>
                      <span className={`text-sm font-medium ${getScoreColor(metrics.performance.lighthouse.accessibility)}`}>
                        {metrics.performance.lighthouse.accessibility}
                      </span>
                    </div>
                    <Progress value={metrics.performance.lighthouse.accessibility} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">Best Practices</span>
                      <span className={`text-sm font-medium ${getScoreColor(metrics.performance.lighthouse.bestPractices)}`}>
                        {metrics.performance.lighthouse.bestPractices}
                      </span>
                    </div>
                    <Progress value={metrics.performance.lighthouse.bestPractices} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">SEO</span>
                      <span className={`text-sm font-medium ${getScoreColor(metrics.performance.lighthouse.seo)}`}>
                        {metrics.performance.lighthouse.seo}
                      </span>
                    </div>
                    <Progress value={metrics.performance.lighthouse.seo} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Build Metrics */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Build Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-white">{metrics.performance.buildTime}s</p>
                    <p className="text-sm text-slate-400">Build Time</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <FileText className="w-6 h-6 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-white">{metrics.performance.bundleSize}MB</p>
                    <p className="text-sm text-slate-400">Bundle Size</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code Quality Metrics */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Code Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">Overall Score</span>
                      <Badge className={`${getScoreBadgeColor(metrics.codeQuality.score)} text-white`}>
                        {metrics.codeQuality.score}/100
                      </Badge>
                    </div>
                    <Progress value={metrics.codeQuality.score} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">Test Coverage</span>
                      <span className={`text-sm font-medium ${getScoreColor(metrics.codeQuality.coverage)}`}>
                        {metrics.codeQuality.coverage}%
                      </span>
                    </div>
                    <Progress value={metrics.codeQuality.coverage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issue Details */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Issue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issueBreakdown.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: issue.color }}
                        />
                        <span className="text-sm text-white">{issue.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {issue.severity}
                        </Badge>
                        <span className="text-sm font-medium text-white">{issue.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Team Productivity */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Team Productivity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <Code className="w-6 h-6 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-white">{metrics.productivity.linesOfCode.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Lines of Code</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <Activity className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-white">{metrics.productivity.commits}</p>
                    <p className="text-sm text-slate-400">Commits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collaboration Stats */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <Users className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                    <p className="text-2xl font-bold text-white">{metrics.collaboration.activeUsers}</p>
                    <p className="text-sm text-slate-400">Active Users</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <Award className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold text-white">{metrics.collaboration.reviews}</p>
                    <p className="text-sm text-slate-400">Code Reviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
