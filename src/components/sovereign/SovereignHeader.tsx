
import { Crown, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowExecution } from '@/services/sovereignOrchestrator';

interface SovereignHeaderProps {
  currentExecution: WorkflowExecution | null;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSettings: () => void;
}

export const SovereignHeader = ({
  currentExecution,
  onPause,
  onResume,
  onReset,
  onSettings
}: SovereignHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sovereign AI Development</h1>
          <p className="text-slate-400">Autonomous code generation and project orchestration</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {currentExecution && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              disabled={currentExecution.status !== 'running'}
              className="border-slate-600"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onResume}
              disabled={currentExecution.status !== 'paused'}
              className="border-slate-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-slate-600"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSettings}
          className="border-slate-600"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};
