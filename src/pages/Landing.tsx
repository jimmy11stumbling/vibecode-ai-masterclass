
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Code, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/ide');
  };

  const handleGoToChat = () => {
    navigate('/learning');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">
              Sovereign AI IDE
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGoToChat}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Chat
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Code className="w-4 h-4 mr-2" />
                Open IDE
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Build with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {' '}Sovereign AI
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            The most advanced AI-powered development environment. Chat with AI, generate code in real-time, 
            and build full-stack applications with unprecedented speed and intelligence.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 h-auto"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Building Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={handleGoToChat}
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 h-auto"
            >
              <Bot className="w-5 h-5 mr-2" />
              Try AI Chat
            </Button>
          </div>

          {/* Quick Access Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Ready to Chat with AI?</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Access the AI chat interface instantly. Ask questions, generate code, and get real-time assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleGoToChat}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Open AI Chat Interface
              </Button>
              <Button
                onClick={handleGetStarted}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Full IDE Experience
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Powered by Advanced AI
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Bot className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Real-Time AI Chat
              </h3>
              <p className="text-slate-300">
                Chat with DeepSeek Reasoner AI for instant code generation, debugging, and architectural guidance.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Code className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Full-Stack IDE
              </h3>
              <p className="text-slate-300">
                Complete development environment with code editor, live preview, and deployment tools.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Lightning Fast
              </h3>
              <p className="text-slate-300">
                Build and deploy applications in minutes with AI-powered code generation and optimization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto text-center">
          <p className="text-slate-400">
            © 2024 Sovereign AI IDE. Built with advanced AI technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
