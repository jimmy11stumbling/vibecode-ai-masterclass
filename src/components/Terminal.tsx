import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal as TerminalIcon, X, Minimize2, Maximize2 } from 'lucide-react';

interface TerminalOutput {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ 
  onClose, 
  isMinimized = false, 
  onToggleMinimize 
}) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<TerminalOutput[]>([
    {
      id: '1',
      type: 'output',
      content: 'Welcome to AI Code Studio Terminal',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'output',
      content: 'Type "help" for available commands',
      timestamp: new Date()
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add command to history
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Add command to output
    const commandOutput: TerminalOutput = {
      id: Date.now().toString(),
      type: 'command',
      content: `$ ${trimmedCmd}`,
      timestamp: new Date()
    };

    setOutput(prev => [...prev, commandOutput]);

    // Process command
    try {
      const result = await processCommand(trimmedCmd);
      const resultOutput: TerminalOutput = {
        id: (Date.now() + 1).toString(),
        type: result.type,
        content: result.content,
        timestamp: new Date()
      };
      setOutput(prev => [...prev, resultOutput]);
    } catch (error) {
      const errorOutput: TerminalOutput = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setOutput(prev => [...prev, errorOutput]);
    }
  };

  const processCommand = async (cmd: string): Promise<{ type: 'output' | 'error', content: string }> => {
    const [command, ...args] = cmd.split(' ');

    switch (command.toLowerCase()) {
      case 'help':
        return {
          type: 'output',
          content: `Available commands:
• help - Show this help message
• clear - Clear the terminal
• ls - List files in current directory
• pwd - Show current directory
• echo [text] - Echo text back
• date - Show current date and time
• whoami - Show current user info
• version - Show terminal version`
        };

      case 'clear':
        setOutput([]);
        return { type: 'output', content: '' };

      case 'ls':
        return {
          type: 'output',
          content: `src/
public/
package.json
README.md
tsconfig.json
vite.config.ts`
        };

      case 'pwd':
        return { type: 'output', content: '/workspace/ai-code-studio' };

      case 'echo':
        return { type: 'output', content: args.join(' ') || '' };

      case 'date':
        return { type: 'output', content: new Date().toString() };

      case 'whoami':
        return { type: 'output', content: 'developer@ai-code-studio' };

      case 'version':
        return { type: 'output', content: 'AI Code Studio Terminal v1.0.0' };

      case 'npm':
        if (args[0] === 'install') {
          return {
            type: 'output',
            content: `Installing packages...
✓ Dependencies installed successfully!`
          };
        }
        return { type: 'output', content: 'npm command executed' };

      case 'git':
        return {
          type: 'output',
          content: `Git command: ${args.join(' ')}
(Git simulation - not connected to actual repository)`
        };

      default:
        return {
          type: 'error',
          content: `Command not found: ${command}. Type 'help' for available commands.`
        };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      executeCommand(command);
      setCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex] || '');
        }
      }
    }
  };

  const getOutputColor = (type: TerminalOutput['type']) => {
    switch (type) {
      case 'command':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'output':
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-gray-300">Terminal</span>
          <Badge variant="secondary" className="text-xs">
            Ready
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          {onToggleMinimize && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
          )}
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Terminal Output */}
          <ScrollArea className="flex-1 p-4 bg-gray-900" ref={scrollRef}>
            <div className="font-mono text-sm space-y-1">
              {output.map((item) => (
                <div key={item.id} className={`${getOutputColor(item.type)} whitespace-pre-wrap`}>
                  {item.content}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Terminal Input */}
          <div className="border-t border-gray-700 bg-gray-900 p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <span className="text-green-400 font-mono text-sm">$</span>
              <Input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none text-gray-300 font-mono text-sm focus:ring-0 focus:border-none p-0"
                placeholder="Enter command..."
                autoFocus
              />
            </form>
          </div>
        </>
      )}
    </div>
  );
};