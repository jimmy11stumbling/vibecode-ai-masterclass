
import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Minimize2, Square, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [currentPath, setCurrentPath] = useState('~/vibecode');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  };

  const executeCommand = (command: string) => {
    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    // Add command line
    addLine('command', `${currentPath} $ ${command}`);
    
    // Process command
    const [cmd, ...args] = command.trim().split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'help':
        addLine('output', 'Available commands:');
        addLine('output', '  help      - Show this help message');
        addLine('output', '  clear     - Clear terminal');
        addLine('output', '  ls        - List files');
        addLine('output', '  pwd       - Print working directory');
        addLine('output', '  echo      - Echo text');
        addLine('output', '  npm       - Node package manager');
        addLine('output', '  git       - Git commands (simulated)');
        addLine('output', '  build     - Build project');
        addLine('output', '  dev       - Start development server');
        break;
        
      case 'clear':
        setLines([]);
        break;
        
      case 'ls':
        addLine('output', 'src/');
        addLine('output', 'public/');
        addLine('output', 'package.json');
        addLine('output', 'tailwind.config.ts');
        addLine('output', 'vite.config.ts');
        addLine('output', 'README.md');
        break;
        
      case 'pwd':
        addLine('output', currentPath);
        break;
        
      case 'echo':
        addLine('output', args.join(' '));
        break;
        
      case 'npm':
        if (args[0] === 'install') {
          addLine('output', 'Installing dependencies...');
          setTimeout(() => {
            addLine('output', '✓ Dependencies installed successfully');
          }, 1000);
        } else if (args[0] === 'run' && args[1] === 'dev') {
          addLine('output', 'Starting development server...');
          addLine('output', '  Local:   http://localhost:5173/');
          addLine('output', '  ready in 1.2s');
        } else {
          addLine('output', `npm ${args.join(' ')}`);
        }
        break;
        
      case 'git':
        if (args[0] === 'status') {
          addLine('output', 'On branch main');
          addLine('output', 'Your branch is up to date with \'origin/main\'.');
          addLine('output', 'nothing to commit, working tree clean');
        } else if (args[0] === 'add') {
          addLine('output', `Added ${args.slice(1).join(' ') || '.'} to staging`);
        } else if (args[0] === 'commit') {
          addLine('output', '[main abc123] Your commit message');
          addLine('output', '1 file changed, 5 insertions(+)');
        } else {
          addLine('output', `git ${args.join(' ')}`);
        }
        break;
        
      case 'build':
        addLine('output', 'Building for production...');
        setTimeout(() => {
          addLine('output', '✓ Build complete in 3.2s');
          addLine('output', 'dist/ folder created');
        }, 1500);
        break;
        
      case 'dev':
        addLine('output', 'Starting Vite dev server...');
        addLine('output', '  Local:   http://localhost:5173/');
        addLine('output', '  Network: use --host to expose');
        break;
        
      case '':
        // Empty command, just add prompt
        break;
        
      default:
        addLine('error', `Command not found: ${cmd}`);
        addLine('output', 'Type "help" for available commands.');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      executeCommand(currentCommand);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-300">
            <TerminalIcon className="w-4 h-4" />
            <span className="text-sm">Terminal</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <Square className="w-3 h-3" />
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
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg flex flex-col h-80">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800 rounded-t-lg">
        <div className="flex items-center space-x-2 text-slate-300">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Terminal</span>
          <span className="text-xs text-slate-500">{currentPath}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleMinimize}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
          >
            <Minimize2 className="w-3 h-3" />
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
