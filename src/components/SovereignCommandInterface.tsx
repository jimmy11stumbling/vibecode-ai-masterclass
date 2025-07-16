
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Terminal, 
  Crown, 
  Send, 
  History, 
  Command, 
  ChevronRight,
  Copy,
  Trash2,
  Settings,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';

interface CommandLog {
  id: string;
  command: string;
  timestamp: Date;
  status: 'success' | 'error' | 'running' | 'pending';
  output?: string;
  executionTime?: number;
}

interface SovereignCommandInterfaceProps {
  onCommandExecute?: (command: string) => void;
  onSystemAction?: (action: string, params?: any) => void;
}

export const SovereignCommandInterface: React.FC<SovereignCommandInterfaceProps> = ({
  onCommandExecute,
  onSystemAction
}) => {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandLog[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'ready' | 'busy' | 'maintenance'>('ready');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Predefined commands for autocomplete
  const predefinedCommands = [
    'sovereign.status',
    'sovereign.agents.list',
    'sovereign.agents.start [agent-id]',
    'sovereign.agents.stop [agent-id]',
    'sovereign.agents.restart [agent-id]',
    'sovereign.project.create [name]',
    'sovereign.project.build [project-id]',
    'sovereign.project.deploy [project-id]',
    'sovereign.system.health',
    'sovereign.system.metrics',
    'sovereign.database.status',
    'sovereign.database.backup',
    'sovereign.logs.view [level]',
    'sovereign.logs.clear',
    'sovereign.config.reload',
    'sovereign.config.export',
    'help',
    'clear'
  ];

  useEffect(() => {
    // Auto-scroll to bottom when new commands are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    const newCommand: CommandLog = {
      id: `cmd_${Date.now()}`,
      command: cmd,
      timestamp: new Date(),
      status: 'running'
    };

    setCommandHistory(prev => [...prev, newCommand]);
    setIsProcessing(true);
    setCommand('');
    setHistoryIndex(-1);

    // Simulate command execution
    try {
      const startTime = Date.now();
      let output = '';
      let status: 'success' | 'error' = 'success';

      // Handle different command types
      switch (cmd.toLowerCase()) {
        case 'help':
          output = `Sovereign AI Command Interface v2.1.0

Available Commands:
  sovereign.status              - Show system status
  sovereign.agents.list         - List all agents
  sovereign.agents.start [id]   - Start specific agent
  sovereign.agents.stop [id]    - Stop specific agent
  sovereign.project.create      - Create new project
  sovereign.project.build       - Build current project
  sovereign.system.health       - System health check
  sovereign.database.status     - Database connection status
  clear                         - Clear command history
  help                          - Show this help message`;
          break;

        case 'sovereign.status':
          output = `System Status: OPERATIONAL
Active Agents: 6/6
Current Load: 23%
Uptime: 7d 14h 32m
Last Update: ${new Date().toLocaleString()}`;
          break;

        case 'sovereign.agents.list':
          output = `Active Agents:
┌─────────────────┬────────┬───────┬──────────────┐
│ Agent ID        │ Status │ Tasks │ Performance  │
├─────────────────┼────────┼───────┼──────────────┤
│ orchestrator    │ ACTIVE │   12  │      98.5%   │
│ architect       │ BUSY   │    8  │      94.2%   │
│ frontend_builder│ ACTIVE │   15  │      96.8%   │
│ backend_builder │ ACTIVE │   11  │      97.1%   │
│ validator       │ IDLE   │    3  │      99.2%   │
│ optimizer       │ ACTIVE │    7  │      95.7%   │
└─────────────────┴────────┴───────┴──────────────┘`;
          break;

        case 'sovereign.system.health':
          output = `System Health Check:
✓ CPU Usage: 23.4% (Normal)
✓ Memory: 67.8% (Normal)
✓ Network: 45ms latency (Good)
✓ Database: Connected (Healthy)
✓ Storage: 78% available (Good)
✓ Agent Fleet: All operational
✓ Security: No threats detected

Overall Status: HEALTHY`;
          break;

        case 'sovereign.database.status':
          output = `Database Status:
Connection: ESTABLISHED
Host: sovereign-db-cluster.aws.com
Database: sovereign_production
Tables: 24 active
Connections: 12/100 active
Response Time: 2.3ms average
Last Backup: 2 hours ago
Status: HEALTHY`;
          break;

        case 'clear':
          setCommandHistory([]);
          setIsProcessing(false);
          return;

        default:
          if (cmd.startsWith('sovereign.agents.start ')) {
            const agentId = cmd.split(' ')[1];
            output = `Starting agent: ${agentId}
Agent ${agentId} initialization sequence initiated...
Loading configuration...
Establishing connections...
Agent ${agentId} is now ACTIVE`;
          } else if (cmd.startsWith('sovereign.agents.stop ')) {
            const agentId = cmd.split(' ')[1];
            output = `Stopping agent: ${agentId}
Gracefully shutting down agent ${agentId}...
Completing active tasks...
Agent ${agentId} is now STOPPED`;
          } else if (cmd.startsWith('sovereign.project.')) {
            output = `Project operation initiated...
Processing request: ${cmd}
Operation completed successfully.`;
          } else {
            output = `Command not recognized: ${cmd}
Type 'help' for available commands.`;
            status = 'error';
          }
      }

      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

      const executionTime = Date.now() - startTime;

      setCommandHistory(prev => 
        prev.map(log => 
          log.id === newCommand.id 
            ? { ...log, status, output, executionTime }
            : log
        )
      );

      onCommandExecute?.(cmd);
    } catch (error) {
      setCommandHistory(prev => 
        prev.map(log => 
          log.id === newCommand.id 
            ? { 
                ...log, 
                status: 'error', 
                output: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}` 
              }
            : log
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const commands = commandHistory.map(log => log.command);
      if (commands.length > 0) {
        const newIndex = historyIndex < commands.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(commands[commands.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const commands = commandHistory.map(log => log.command);
        setCommand(commands[commands.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete
      const matches = predefinedCommands.filter(cmd => 
        cmd.toLowerCase().startsWith(command.toLowerCase())
      );
      if (matches.length === 1) {
        setCommand(matches[0]);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'running':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
  };

  const clearHistory = () => {
    setCommandHistory([]);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <Terminal className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Sovereign Command Interface</h3>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              {systemStatus}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={clearHistory}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Command Output */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-4 space-y-3">
            {commandHistory.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sovereign Command Interface Ready</p>
                <p className="text-sm">Type 'help' for available commands</p>
              </div>
            ) : (
              commandHistory.map((log) => (
                <div key={log.id} className="space-y-2">
                  {/* Command Line */}
                  <div className="flex items-center space-x-2 font-mono text-sm">
                    <span className="text-yellow-400">sovereign@ai</span>
                    <span className="text-slate-400">$</span>
                    <span className="text-white">{log.command}</span>
                    <div className="flex items-center space-x-2 ml-auto">
                      {getStatusIcon(log.status)}
                      {log.executionTime && (
                        <span className="text-xs text-slate-400">
                          {log.executionTime}ms
                        </span>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyCommand(log.command)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Command Output */}
                  {log.output && (
                    <div className={`font-mono text-xs whitespace-pre-wrap p-3 bg-slate-800 rounded-lg border-l-2 ${
                      log.status === 'error' ? 'border-red-500' : 'border-blue-500'
                    }`}>
                      <span className={getStatusColor(log.status)}>
                        {log.output}
                      </span>
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="text-xs text-slate-500">
                    {log.timestamp.toLocaleTimeString()}
                  </div>
                  
                  <Separator className="bg-slate-700" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Command Input */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 font-mono text-sm">
            <span className="text-yellow-400">sovereign@ai</span>
            <span className="text-slate-400">$</span>
          </div>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter sovereign command... (Tab for autocomplete)"
              className="bg-slate-800 border-slate-600 text-white font-mono"
              disabled={isProcessing}
            />
          </div>
          <Button 
            size="sm"
            onClick={() => executeCommand(command)}
            disabled={!command.trim() || isProcessing}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-slate-400">
          Press ↑/↓ for command history • Tab for autocomplete • Enter to execute
        </div>
      </div>
    </div>
  );
};
