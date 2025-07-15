
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Bot, 
  Database, 
  Zap,
  ArrowRight,
  Sparkles,
  Brain,
  Server,
  Shield,
  Activity,
  Rocket,
  Users,
  BookOpen,
  Settings
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sovereign AI IDE</h1>
              <p className="text-xs text-slate-400">Production-Ready Development Environment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-green-400 border-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Online
            </Badge>
            <Link to="/dashboard">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                <Activity className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/ide">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Rocket className="w-4 h-4 mr-2" />
                Launch IDE
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by DeepSeek Reasoner
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Sovereign AI
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> IDE</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto">
              The most advanced AI-powered development environment with seamless agent communication, MCP integration, and RAG 2.0 database connectivity.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/ide">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8 py-4">
                <Code className="w-5 h-5 mr-2" />
                Start Coding Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-700 text-lg px-8 py-4">
                <Activity className="w-5 h-5 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Production-Ready Features</h2>
            <p className="text-slate-300 text-lg">Everything you need for professional AI-powered development</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">AI Assistant Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Advanced AI chatbot with DeepSeek Reasoner for intelligent code generation and assistance.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Server className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">MCP Hub & Servers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Model Context Protocol integration with seamless agent-to-agent communication.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-green-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">RAG 2.0 Database</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Advanced Retrieval-Augmented Generation with vector embeddings and semantic search.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-yellow-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Full IDE Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Complete development environment with code editor, live preview, and terminal.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-red-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <CardTitle className="text-white">Real-time Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Live code validation and error detection with comprehensive logging system.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white">Multi-Agent System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Coordinated AI agents working together for complex development tasks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 py-16 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Quick Access</h2>
            <p className="text-slate-300">Jump straight into your development workflow</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link to="/ide" className="group">
              <Card className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Code className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Full IDE</h3>
                  <p className="text-slate-400 text-sm">Complete development environment</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard" className="group">
              <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Dashboard</h3>
                  <p className="text-slate-400 text-sm">Monitor your progress</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/" className="group">
              <Card className="bg-slate-800 border-slate-700 hover:border-green-500 transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Learning</h3>
                  <p className="text-slate-400 text-sm">AI-powered tutorials</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ide" className="group">
              <Card className="bg-slate-800 border-slate-700 hover:border-yellow-500 transition-all group-hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Settings className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Settings</h3>
                  <p className="text-slate-400 text-sm">Configure your workspace</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">Sovereign AI IDE</span>
          </div>
          <p className="text-slate-400">
            The future of AI-powered development. Built with cutting-edge technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
