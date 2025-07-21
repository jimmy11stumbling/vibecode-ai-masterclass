
import { Crown, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  isProcessing: boolean;
  onStartGeneration: () => void;
}

export const PromptInput = ({
  userPrompt,
  setUserPrompt,
  isProcessing,
  onStartGeneration
}: PromptInputProps) => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Describe your project... (e.g., 'Create a task management app with user authentication, real-time updates, and a modern dashboard')"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        className="min-h-[100px] bg-slate-800 border-slate-600 text-white placeholder-slate-400"
        disabled={isProcessing}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>DeepSeek Reasoner</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Multi-Agent System</span>
          </div>
        </div>
        
        <Button
          onClick={onStartGeneration}
          disabled={isProcessing || !userPrompt.trim()}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Start Autonomous Generation
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
