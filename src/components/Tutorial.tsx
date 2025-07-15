
import React, { useState } from 'react';
import { Play, CheckCircle, Circle, ArrowRight, ArrowLeft, BookOpen, Target, Lightbulb, Code, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  content: string;
  completed: boolean;
  duration: string;
  icon: React.ReactNode;
}

export const Tutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      id: 1,
      title: "Welcome to AI Development",
      description: "Get started with your AI-powered coding journey",
      content: "Welcome to the next generation of development! This platform combines AI assistance with full-stack development capabilities. You'll learn how to use natural language to build applications, leverage AI for code generation, and create sophisticated web applications without traditional coding barriers.",
      completed: false,
      duration: "3 min",
      icon: <Lightbulb className="w-4 h-4" />
    },
    {
      id: 2,
      title: "AI Chat Interface",
      description: "Master AI-driven development communication",
      content: "The AI chat is your primary development tool. Use specific, detailed prompts like 'Create a React dashboard with user authentication and data visualization' to get better results. The AI can generate complete applications, debug issues, and even refactor existing code.",
      completed: false,
      duration: "4 min",
      icon: <Brain className="w-4 h-4" />
    },
    {
      id: 3,
      title: "Code Generation & Preview",
      description: "See your ideas come to life instantly",
      content: "Watch as your natural language descriptions transform into working code. The integrated preview shows real-time results, and you can iterate quickly by refining your requests. The AI handles everything from component creation to styling and functionality.",
      completed: false,
      duration: "5 min",
      icon: <Code className="w-4 h-4" />
    },
    {
      id: 4,
      title: "Advanced AI Features",
      description: "Leverage cutting-edge AI capabilities",
      content: "Explore advanced features like automatic API integration, database schema generation, and intelligent code optimization. The AI can connect to external services, create complex workflows, and even handle deployment configurations.",
      completed: false,
      duration: "6 min",
      icon: <Zap className="w-4 h-4" />
    }
  ]);

  const completeStep = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    ));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      completeStep(currentStep);
      setCurrentStep(currentStep + 1);
    } else {
      completeStep(currentStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">AI Development Tutorial</h2>
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            {completedSteps}/{steps.length} Complete
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Step Navigation */}
        <div className="w-72 border-r border-white/10 flex-shrink-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="text-sm font-medium text-white mb-3">Tutorial Steps</h3>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentStep === index
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/50'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : currentStep === index ? (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            {step.icon}
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white truncate">
                            {step.title}
                          </h4>
                          <span className="text-xs text-gray-400 ml-2">
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Step Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {currentStepData.title}
                  </h1>
                  <p className="text-gray-300 mb-6">
                    {currentStepData.description}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {currentStepData.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-3">What you'll learn</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {currentStepData.content}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Example */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-400/20 mt-6">
                  <h3 className="text-lg font-medium text-white mb-3">Try it yourself</h3>
                  <p className="text-gray-300 mb-4">
                    Ready to practice? Use the AI chat on the right to start building your first AI-powered application.
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    <Play className="w-4 h-4 mr-2" />
                    Start Building
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="border-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => completeStep(currentStep)}
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>

                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
