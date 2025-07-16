
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Terminal, 
  Send, 
  Brain, 
  Zap, 
  Database, 
  Network,
  CheckCircle,
  AlertCircle,
  Clock,
  Cpu
} from 'lucide-react';
import { masterControlProgram } from '@/services/masterControlProgram';
import { deepSeekIntegration } from '@/services/deepSeekIntegrationService';

interface CommandResult {
  id: string;
  command: string;
  result: string;
  status: 'success' | 'error' | 'processing';
  timestamp: Date;
  processingTime?: number;
  systemUsed?: string;
}

interface StreamingResponse {
  content: string;
  isComplete: boolean;
}

export const SovereignCommandInterface: React.FC = () => {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState<StreamingResponse>({ content: '', isComplete: true });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandHistory, streamingResponse]);

  const executeCommand = async () => {
    if (!command.trim() || isProcessing) return;

    const commandId = `cmd_${Date.now()}`;
    const startTime = Date.now();
    
    setIsProcessing(true);
    setStreamingResponse({ content: '', isComplete: false });

    // Add command to history as processing
    const processingResult: CommandResult = {
      id: commandId,
      command: command.trim(),
      result: 'Processing...',
      status: 'processing',
      timestamp: new Date(),
      systemUsed: 'Master Control Program'
    };

    setCommandHistory(prev => [...prev, processingResult]);
    setCommand('');

    try {
      let result: string;
      let systemUsed = 'Master Control Program';

      // Determine which system to use based on command
      if (command.toLowerCase().includes('reason') || command.toLowerCase().includes('analyze')) {
        systemUsed = 'DeepSeek Reasoner';
        
        // Use streaming for reasoning commands
        result = await deepSeekIntegration.generateStreamingResponse(
          command,
          'Production environment with full system access',
          (chunk) => {
            setStreamingResponse(prev => ({
              content: prev.content + chunk,
              isComplete: false
            }));
          }
        );
        
        setStreamingResponse(prev => ({ ...prev, isComplete: true }));
        
      } else {
        // Use Master Control Program for other commands
        result = await masterControlProgram.processUserRequest(command);
      }

      const processingTime = Date.now() - startTime;

      // Update the command result
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? {
                ...cmd,
                result: result,
                status: 'success' as const,
                processingTime,
                systemUsed
              }
            : cmd
        )
      );

      console.log(`✅ Command executed successfully in ${processingTime}ms`);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandId 
            ? {
                ...cmd,
                result: `Error: ${errorMessage}`,
                status: 'error' as const,
                processingTime,
                systemUsed: 'System Error'
              }
            : cmd
        )
      );

      console.error('❌ Command execution failed:', error);
    } finally {
      setIsProcessing(false);
      setStreamingResponse({ content: '', isComplete: true });
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'DeepSeek Reasoner':
        return <Brain className="w-3 h-3" />;
      case 'RAG Database':
        return <Database className="w-3 h-3" />;
      case 'MCP Hub':
        return <Zap className="w-3 h-3" />;
      case 'A2A Protocol':
        return <Network className="w-3 h-3" />;
      default:
        return <Cpu className="w-3 h-3" />;
    }
  };

  const suggestedCommands = [
    'Analyze the current system architecture',
    'Generate a React component for user authentication',
    'Reason about optimal database schema design',
    'Create a comprehensive project plan',
    'Optimize the current codebase structure'
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      <Card className="flex-1 bg-slate-900 border-slate-700 flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <span>Sovereign Command Interface</span>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              Production Ready
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Command History */}
          <ScrollArea ref={scrollRef} className="flex-1 rounded-md border border-slate-700 bg-slate-950 p-4">
            <div className="space-y-4">
              {commandHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Sovereign AI System Ready</p>
                  <p className="text-sm">Enter commands to interact with the Master Control Program</p>
                </div>
              ) : (
                commandHistory.map((cmd) => (
                  <div key={cmd.id} className="border-l-2 border-slate-600 pl-4 space-y-2">
                    {/* Command Input */}
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 font-mono">$</span>
                      <span className="text-white font-mono">{cmd.command}</span>
                      <div className="flex items-center space-x-2 ml-auto">
                        {getStatusIcon(cmd.status)}
                        <Badge variant="outline" className="text-xs">
                          {getSystemIcon(cmd.systemUsed || 'System')}
                          <span className="ml-1">{cmd.systemUsed}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Command Result */}
                    <div className="bg-slate-800 rounded-md p-3 ml-4">
                      <div className="text-slate-300 text-sm whitespace-pre-wrap">
                        {cmd.result}
                      </div>
                      {cmd.processingTime && (
                        <div className="text-xs text-slate-500 mt-2">
                          Completed in {cmd.processingTime}ms • {cmd.timestamp.toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Streaming Response */}
              {!streamingResponse.isComplete && streamingResponse.content && (
                <div className="border-l-2 border-yellow-500 pl-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 font-mono">~</span>
                    <span className="text-yellow-400 font-mono">Streaming Response...</span>
                    <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
                  </div>
                  <div className="bg-slate-800 rounded-md p-3 ml-4">
                    <div className="text-slate-300 text-sm whitespace-pre-wrap">
                      {streamingResponse.content}
                      <span className="animate-pulse">▋</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Command Input */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter command for the Master Control Program..."
                className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 pr-12"
                disabled={isProcessing}
              />
              <Button
                onClick={executeCommand}
                disabled={!command.trim() || isProcessing}
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Suggested Commands */}
          {commandHistory.length === 0 && (
            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-medium">Suggested Commands:</div>
              <div className="flex flex-wrap gap-2">
                {suggestedCommands.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setCommand(suggestion)}
                    className="text-xs text-slate-300 border-slate-600 hover:bg-slate-700"
                    disabled={isProcessing}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
