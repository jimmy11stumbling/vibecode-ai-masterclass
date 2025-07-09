
import React from 'react';
import { Play, Save, Download, Upload, Settings, Maximize2, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeEditorHeaderProps {
  filesCount: number;
  onRun: () => void;
  onSave: () => void;
  onLoad: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
}

export const CodeEditorHeader: React.FC<CodeEditorHeaderProps> = ({
  filesCount,
  onRun,
  onSave,
  onLoad,
  onDownload,
  onCopy,
  onReset,
  onToggleFullscreen
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-700">
      <div className="flex items-center space-x-2">
        <h3 className="font-semibold text-white">Code Editor</h3>
        <span className="text-xs text-slate-400">
          {filesCount} file{filesCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={onRun}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="w-4 h-4 mr-2" />
          Run
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onSave}
          className="text-slate-400 hover:text-white"
        >
          <Save className="w-4 h-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onLoad}
          className="text-slate-400 hover:text-white"
        >
          <Upload className="w-4 h-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onDownload}
          className="text-slate-400 hover:text-white"
        >
          <Download className="w-4 h-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onCopy}
          className="text-slate-400 hover:text-white"
        >
          <Copy className="w-4 h-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          className="text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleFullscreen}
          className="text-slate-400 hover:text-white"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-400 hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
