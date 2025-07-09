
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { TerminalHeader } from './TerminalHeader';
import { useTerminalCommands } from '@/hooks/useTerminalCommands';

interface TerminalProps {
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export const Terminal: React.FC<TerminalProps> = ({ 
  onClose, 
  isMinimized = false, 
  onToggleMinimize 
}) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to Vibecode Terminal v1.0.0',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'output',
      content: 'Type "help" for available commands.',
      timestamp: new Date()
    }
  ]);
  
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const { currentPath, executeCommand } = useTerminalCommands();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      setCommandHistory(prev => [...prev, currentCommand]);
      setHistoryIndex(-1);
      executeCommand(currentCommand, lines, setLines);
      setCurrentCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when clicked
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  if (isMinimized) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 min-w-48">
        <TerminalHeader
          currentPath={currentPath}
          onClose={onClose}
          onToggleMinimize={onToggleMinimize}
          isMinimized={isMinimized}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg flex flex-col h-80">
      <TerminalHeader
        currentPath={currentPath}
        onClose={onClose}
        onToggleMinimize={onToggleMinimize}
        isMinimized={isMinimized}
      />

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 p-3 overflow-auto font-mono text-sm cursor-text"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`mb-1 ${
              line.type === 'command'
                ? 'text-green-400'
                : line.type === 'error'
                ? 'text-red-400'
                : 'text-slate-300'
            }`}
          >
            {line.content}
          </div>
        ))}
        
        {/* Current command line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-400 mr-2">{currentPath} $</span>
          <Input
            ref={inputRef}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-0 p-0 text-slate-300 font-mono text-sm focus:ring-0 focus:outline-none"
            placeholder=""
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};
