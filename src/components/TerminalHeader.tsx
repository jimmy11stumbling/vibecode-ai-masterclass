
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Terminal as TerminalIcon, 
  Minus, 
  Square, 
  X, 
  Settings,
  Copy,
  Download
} from 'lucide-react';

interface TerminalHeaderProps {
  currentPath: string;
  onClose?: () => void;
  onToggleMinimize?: () => void;
  isMinimized?: boolean;
  onSettings?: () => void;
  onClear?: () => void;
  onExport?: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  currentPath,
  onClose,
  onToggleMinimize,
  isMinimized = false,
  onSettings,
  onClear,
  onExport
}) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-3 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <TerminalIcon className="w-4 h-4 text-green-400" />
        {!isMinimized && (
          <>
            <span className="text-sm font-medium text-white">Terminal</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400">{currentPath}</span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {!isMinimized && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onExport}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Download className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClear}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onSettings}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleMinimize}
          className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <Minus className="w-3 h-3" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 hover:bg-slate-700"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
