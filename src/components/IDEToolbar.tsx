
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  Save, 
  Upload, 
  Download, 
  Settings, 
  RefreshCw,
  GitBranch,
  Terminal,
  Database,
  Zap
} from 'lucide-react';

interface IDEToolbarProps {
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onSettings: () => void;
  onToggleTerminal: () => void;
  isRunning: boolean;
  hasUnsavedChanges: boolean;
  isBuilding: boolean;
}

export const IDEToolbar: React.FC<IDEToolbarProps> = ({
  onRun,
  onStop,
  onSave,
  onExport,
  onImport,
  onSettings,
  onToggleTerminal,
  isRunning,
  hasUnsavedChanges,
  isBuilding
}) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={isRunning ? onStop : onRun}
            className={isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            onClick={onSave}
            disabled={!hasUnsavedChanges}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <Button
            size="sm"
            onClick={onExport}
            variant="outline"
            className="border-slate-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button
            size="sm"
            onClick={onImport}
            variant="outline"
            className="border-slate-600"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {isBuilding && (
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Building
            </Badge>
          )}
          
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-400 border-amber-400">
              ● Unsaved
            </Badge>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleTerminal}
            className="text-slate-400 hover:text-white"
          >
            <Terminal className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <GitBranch className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <Database className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onSettings}
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
