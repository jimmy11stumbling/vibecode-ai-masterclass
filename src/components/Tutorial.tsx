
import React, { useState } from 'react';
import { Play, CheckCircle, Circle, ArrowRight, ArrowLeft, BookOpen, Target, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  completed: boolean;
  duration: string;
}

export const Tutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([
    {
      id: 1,
      title: "Welcome to Vibecode",
      description: "Get started with your coding journey",
      content: "Welcome to Vibecode AI! This platform helps you master prompt engineering and full-stack development. In this tutorial, you'll learn how to navigate the interface, use the AI chat, and build your first project.",
      completed: false,
      duration: "2 min"
    },
    {
      id: 2,
      title: "AI Chat Interface",
      description: "Learn to communicate with AI effectively",
      content: "The AI chat is your main tool for learning. You can ask questions, request code examples, and get explanations. Try using specific prompts like 'Create a React component for a user profile' to get better results.",
      completed: false,
      duration: "3 min"
    },
    {
      id: 3,
      title: "Code Editor Basics",
      description: "Master the integrated development environment",
      content: "The code editor supports multiple files, syntax highlighting, and real-time preview. You can run your code, see the output, and make changes instantly. Use the tabs to switch between files.",
      completed: false,
      duration: "4 min"
    },
    {
      id: 4,
      title: "Building Your First Component",
      description: "Create and customize React components",
      content: "Let's build a simple React component together. We'll create a button component with props, styling, and interactive features. This will teach you the basics of component architecture.",
      completed: false,
      duration: "5 min"
    },
    {
      id: 5,
      title: "Project Management",
      description: "Organize and structure your projects",
      content: "Learn how to organize your files, create folders, and manage project structure. Good organization is key to maintaining large applications and collaborating with others.",
      completed: false,
      duration: "3 min"
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
    <div className="h-full flex flex-col bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Getting Started Tutorial</h2>
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

      <div className="flex-1 flex">
        {/* Step Navigation */}
        <div className="w-80 border-r border-white/10 p-4">
          <h3 className="text-sm font-medium text-white mb-4">Tutorial Steps</h3>
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
                      <Play className="w-5 h-5 text-blue-400" />
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

        {/* Step Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
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

            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-3 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">What you'll learn</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {currentStepData.content}
                  </p>
                </div>
              </div>

              {currentStepData.videoUrl && (
                <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Video tutorial coming soon</p>
                </div>
              )}
            </div>

            {/* Interactive Example */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-400/20">
              <h3 className="text-lg font-medium text-white mb-3">Try it yourself</h3>
              <p className="text-gray-300 mb-4">
                Click the button below to practice what you've learned in this step.
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Play className="w-4 h-4 mr-2" />
                Start Practice
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-white/10">
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
                  disabled={currentStep === steps.length - 1}
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
