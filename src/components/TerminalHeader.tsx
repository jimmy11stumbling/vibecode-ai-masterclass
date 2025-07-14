
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Square, X } from 'lucide-react';

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
  isMinimized
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800">
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium text-white">Terminal</div>
        <div className="text-xs text-slate-400">{currentPath}</div>
      </div>
      
      <div className="flex items-center space-x-1">
        {onToggleMinimize && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleMinimize}
            className="h-6 w-6 p-0 hover:bg-slate-700"
          >
            <Minus className="w-3 h-3" />
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleMinimize}
          className="h-6 w-6 p-0 hover:bg-slate-700"
        >
          <Square className="w-3 h-3" />
        </Button>
        
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-slate-700 text-red-400"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
