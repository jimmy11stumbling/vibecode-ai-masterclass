
import React from 'react';
import { Terminal as TerminalIcon, X, Minimize2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TerminalHeaderProps {
  currentPath: string;
  onClose?: () => void;
  onToggleMinimize?: () => void;
  isMinimized?: boolean;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  currentPath,
  onClose,
  onToggleMinimize,
  isMinimized = false
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800 rounded-t-lg">
      <div className="flex items-center space-x-2 text-slate-300">
        <TerminalIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Terminal</span>
        {!isMinimized && <span className="text-xs text-slate-500">{currentPath}</span>}
      </div>
      <div className="flex items-center space-x-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleMinimize}
          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
        >
          {isMinimized ? <Square className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
