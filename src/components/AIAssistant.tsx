
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Send, 
  Loader2,
  Code,
  FileText,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'error';
}

interface AIAssistantProps {
  onCodeGenerated?: (code: string) => void;
  projectContext?: any;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onCodeGenerated,
  projectContext
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date(),
        type: userMessage.content.toLowerCase().includes('code') ? 'code' : 'text'
      };

      setMessages(prev => [...prev, aiResponse]);
      
      if (aiResponse.type === 'code' && onCodeGenerated) {
        onCodeGenerated(aiResponse.content);
      }
      
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "I can help you with that! Let me generate some code for you.",
      "Here's a solution based on your requirements:",
      "I understand what you're looking for. Let me create that component.",
      "Great idea! Here's how we can implement that feature:",
      "Let me help you build that functionality step by step."
    ];

    if (userInput.toLowerCase().includes('component')) {
      return `${responses[Math.floor(Math.random() * responses.length)]\n\n\`\`\`typescript\nimport React from 'react';\n\nconst MyComponent = () => {\n  return (\n    <div className="p-4">\n      <h2>Generated Component</h2>\n    </div>\n  );\n};\n\nexport default MyComponent;\n\`\`\``;
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getMessageIcon = (message: Message) => {
    if (message.role === 'user') {
      return <User className="w-4 h-4 text-blue-400" />;
    }
    return <Bot className="w-4 h-4 text-green-400" />;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
          <Badge variant="secondary" className="text-xs">
            Online
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">AI Assistant Ready</h4>
              <p className="text-sm mb-4">Ask me to help you code, debug, or explain concepts!</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">React Components</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">Debugging</Badge>
                <Badge variant="outline">Code Review</Badge>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    {getMessageIcon(message)}
                  </div>
                )}
                
                <div className={`max-w-[80%] ${
                  message.role === 'user' ? 'order-2' : 'order-1'
                }`}>
                  <div className={`px-4 py-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-800 text-slate-100'
                  }`}>
                    {message.type === 'code' ? (
                      <div>
                        <div className="flex items-center mb-2">
                          <Code className="w-4 h-4 mr-2" />
                          <span className="text-xs font-medium">Generated Code</span>
                        </div>
                        <pre className="text-sm bg-slate-900 p-3 rounded overflow-x-auto">
                          <code>{message.content}</code>
                        </pre>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.type === 'code' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => onCodeGenerated?.(message.content)}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    {getMessageIcon(message)}
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-400" />
              </div>
              <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to help you code..."
            className="flex-1 bg-slate-800 border-slate-600 text-white"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
