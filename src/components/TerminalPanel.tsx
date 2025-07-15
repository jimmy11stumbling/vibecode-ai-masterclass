
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Terminal as TerminalIcon, 
  X, 
  Minimize2, 
  Maximize2,
  Play,
  Trash2
} from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface TerminalPanelProps {
  isMinimized?: boolean;
  onClose?: () => void;
  onToggleMinimize?: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  isMinimized = false,
  onClose,
  onToggleMinimize
}) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to Sovereign AI Terminal',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'output',
      content: 'Type "help" for available commands',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, isMinimized]);

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    // Add command to history
    setCommandHistory(prev => [...prev, trimmedCommand]);
    setHistoryIndex(-1);

    // Add command line
    const commandLine: TerminalLine = {
      id: `cmd-${Date.now()}`,
      type: 'command',
      content: `$ ${trimmedCommand}`,
      timestamp: new Date()
    };

    // Execute command and get output
    let outputLines: TerminalLine[] = [];
    
    switch (trimmedCommand.toLowerCase()) {
      case 'help':
        outputLines = [
          {
            id: `out-${Date.now()}-1`,
            type: 'output',
            content: 'Available commands:',
            timestamp: new Date()
          },
          {
            id: `out-${Date.now()}-2`,
            type: 'output',
            content: '  help - Show this help message',
            timestamp: new Date()
          },
          {
            id: `out-${Date.now()}-3`,
            type: 'output',
            content: '  clear - Clear the terminal',
            timestamp: new Date()
          },
          {
            id: `out-${Date.now()}-4`,
            type: 'output',
            content: '  ls - List files',
            timestamp: new Date()
          },
          {
            id: `out-${Date.now()}-5`,
            type: 'output',
            content: '  npm install - Install dependencies',
            timestamp: new Date()
          },
          {
            id: `out-${Date.now()}-6`,
            type: 'output',
            content: '  npm run dev - Start development server',
            timestamp: new Date()
          }
        ];
        break;
        
      case 'clear':
        setLines([]);
        return;
        
      case 'ls':
        outputLines = [
          {
            id: `out-${Date.now()}`,
            type: 'output',
            content: 'src/\npackage.json\nREADME.md\ntsconfig.json',
            timestamp: new Date()
          }
        ];
        break;
        
      case 'npm install':
        outputLines = [
          {
            id: `out-${Date.now()}-1`,
            type: 'output',
            content: 'Installing dependencies...',
            timestamp: new Date()
          },
          {
            id: `out-${Date.now()}-2`,
            type: 'output',
            content: '✓ Dependencies installed successfully',
            timestamp: new Date()
          }
        ];
        break;
        
      case 'npm run dev':
        outputLines = [
          {
            id: `out-${Date.now()}-1`,
            type: 'output',
            content: 'Starting development server...',
            timestamp: new Date()
          },
          {
            id: `out-${Date.now()}-2`,
            type: 'output',
            content: '✓ Server running on http://localhost:3000',
            timestamp: new Date()
          }
        ];
        break;
        
      default:
        outputLines = [
          {
            id: `out-${Date.now()}`,
            type: 'error',
            content: `Command not found: ${trimmedCommand}`,
            timestamp: new Date()
          }
        ];
    }

    setLines(prev => [...prev, commandLine, ...outputLines]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentCommand);
    setCurrentCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
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

  if (isMinimized) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TerminalIcon className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white font-medium">Terminal</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={onToggleMinimize}>
              <Maximize2 className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-lg flex flex-col h-80">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-3 py-2">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-sm text-white font-medium">Terminal</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button size="sm" variant="ghost" onClick={() => setLines([])}>
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onToggleMinimize}>
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="font-mono text-sm space-y-1">
          {lines.map((line) => (
            <div
              key={line.id}
              className={`${
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
        </div>
      </ScrollArea>

      {/* Command Input */}
      <form onSubmit={handleSubmit} className="border-t border-slate-700 p-3">
        <div className="flex items-center space-x-2 font-mono text-sm">
          <span className="text-green-400">$</span>
          <Input
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-white focus:ring-0 p-0"
            placeholder="Enter command..."
            autoFocus
          />
          <Button type="submit" size="sm" variant="ghost">
            <Play className="w-3 h-3" />
          </Button>
        </div>
      </form>
    </div>
  );
};
