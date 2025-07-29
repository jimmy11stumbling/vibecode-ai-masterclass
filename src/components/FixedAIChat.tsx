import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, File, CheckCircle } from 'lucide-react';
import { realTimeAIAgent } from '@/services/realTimeAIAgent';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: Array<{ path: string; action: string }>;
}

export const FixedAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [createdFiles, setCreatedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setCurrentResponse('');
    setCreatedFiles([]);

    const assistantMessageId = (Date.now() + 1).toString();

    try {
      await realTimeAIAgent.streamCodeGeneration(
        `Generate working React/TypeScript code for: ${input.trim()}. 

IMPORTANT: Always wrap code in proper code blocks with filenames:
\`\`\`tsx src/components/MyComponent.tsx
// Your code here
\`\`\`

Create complete, functional components that can be immediately used.`,
        
        // Token handler
        (token: string) => {
          setCurrentResponse(prev => prev + token);
        },
        
        // File operation handler
        (operation) => {
          console.log(`📁 File operation: ${operation.type} ${operation.path}`);
          setCreatedFiles(prev => [...prev, operation.path]);
          
          toast({
            title: "File Operation",
            description: `File ${operation.type}d: ${operation.path}`,
          });

          // Force UI refresh
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('forceFileRefresh'));
          }, 100);
        },
        
        // Progress handler
        (stats) => {
          console.log('📊 Streaming stats:', stats);
        }
      );

      // Add assistant message
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: currentResponse,
        timestamp: new Date(),
        files: createdFiles.map(path => ({ path, action: 'created' }))
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (createdFiles.length > 0) {
        toast({
          title: "Success!",
          description: `Files Created Successfully: ${createdFiles.length} file(s)`,
        });
      }

    } catch (error) {
      console.error('AI Chat error:', error);
      toast({
        title: "Error",
        description: `${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setIsStreaming(false);
      setCurrentResponse('');
    }
  }, [input, isStreaming, currentResponse, createdFiles, toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          AI Code Generator (FIXED)
        </h3>
        <p className="text-sm text-muted-foreground">
          Generate and create files instantly - Now actually working!
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {message.content}
                </pre>
                
                {message.files && message.files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.files.map((file, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <File className="w-3 h-3 mr-1" />
                        {file.path}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating code...
                </div>
                
                {currentResponse && (
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {currentResponse}
                  </pre>
                )}
                
                {createdFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {createdFiles.map((path, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                        {path}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe what you want to build... (e.g., 'Create a todo list component with add/delete functionality')"
            className="resize-none"
            rows={2}
            disabled={isStreaming}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isStreaming}
            size="sm"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {createdFiles.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {createdFiles.length} files created
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};