
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading
}) => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Message copied",
        description: "Message has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };

  const handleDownloadCode = (code: string, language: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Code downloaded",
      description: `Code has been downloaded as code.${language}`,
    });
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="space-y-6 py-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-green-600 text-white'
                }>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className={`flex-1 min-w-0 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tl-lg rounded-bl-lg rounded-br-lg'
                    : 'bg-slate-800 text-slate-100 rounded-tr-lg rounded-bl-lg rounded-br-lg'
                } px-4 py-3 relative group`}>
                  
                  {/* Message Actions */}
                  <div className={`absolute top-2 ${
                    message.role === 'user' ? 'left-2' : 'right-2'
                  } opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        onClick={() => handleCopyMessage(message.content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      
                      {message.code && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          onClick={() => handleDownloadCode(message.code!, message.language || 'txt')}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>

                  {/* Code Block */}
                  {message.code && (
                    <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {message.language || 'code'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                          onClick={() => handleCopyMessage(message.code!)}
                        >
                          Copy
                        </Button>
                      </div>
                      <pre className="text-xs text-slate-300 overflow-x-auto">
                        <code>{message.code}</code>
                      </pre>
                    </div>
                  )}

                  <div className={`text-xs mt-2 opacity-70 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-sm ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
