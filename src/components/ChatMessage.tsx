
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, User, Bot, Code, Check } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const renderCodeBlock = (code: string, language?: string) => {
    return (
      <div className="relative mt-3 bg-slate-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between bg-slate-700 px-3 py-2">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-slate-400" />
            {language && (
              <Badge variant="secondary" className="text-xs">
                {language}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCopy(code)}
            className="text-slate-400 hover:text-white h-6 w-6 p-0"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
        <pre className="p-3 text-sm overflow-x-auto">
          <code className="text-slate-200">{code}</code>
        </pre>
      </div>
    );
  };

  const parseContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        language: match[1],
        content: match[2]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const contentParts = parseContent(message.content);

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            message.role === 'user' 
              ? 'bg-blue-600' 
              : 'bg-slate-700'
          }`}>
            {message.role === 'user' ? (
              <User className="w-3 h-3 text-white" />
            ) : (
              <Bot className="w-3 h-3 text-white" />
            )}
          </div>
          <span className="text-xs text-slate-400">
            {message.role === 'user' ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-slate-500">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        <div className={`p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-100'
        }`}>
          {contentParts.map((part, index) => (
            <div key={index}>
              {part.type === 'text' ? (
                <div className="whitespace-pre-wrap text-sm">{part.content}</div>
              ) : (
                renderCodeBlock(part.content, part.language)
              )}
            </div>
          ))}
          
          {message.code && (
            renderCodeBlock(message.code, message.language)
          )}
        </div>
      </div>
    </div>
  );
};
