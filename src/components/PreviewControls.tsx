
import React from 'react';
import { Play, Square, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewControlsProps {
  isRunning: boolean;
  hasCode: boolean;
  onRun: () => void;
  onStop: () => void;
  onRefresh: () => void;
  onOpenInNewTab: () => void;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  isRunning,
  hasCode,
  onRun,
  onStop,
  onRefresh,
  onOpenInNewTab
}) => {
  return (
    <div className="p-4 border-b border-slate-700">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Live Preview</h3>
        <div className="flex items-center space-x-2">
          {!isRunning ? (
            <Button
              size="sm"
              onClick={onRun}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!hasCode}
            >
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onStop}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="text-slate-400 hover:text-white"
            disabled={!hasCode}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenInNewTab}
            className="text-slate-400 hover:text-white"
            disabled={!hasCode}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
