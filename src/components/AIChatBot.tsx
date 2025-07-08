
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Code, Database, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'code' | 'explanation' | 'help';
}

interface AIChatBotProps {
  context?: string;
  onCodeGenerated?: (code: string) => void;
}

export const AIChatBot: React.FC<AIChatBotProps> = ({ context, onCodeGenerated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI coding assistant. I can help you with React, TypeScript, APIs, databases, and more. What would you like to build?",
      timestamp: new Date(),
      type: 'help'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { icon: Code, text: "Create a React component", type: 'code' },
    { icon: Database, text: "Design a database schema", type: 'code' },
    { icon: Globe, text: "Build an API endpoint", type: 'code' },
    { icon: Sparkles, text: "Optimize my code", type: 'help' }
  ];

  const handleSend = async (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you want to ${messageToSend.toLowerCase()}. Here's a comprehensive solution:\n\n\`\`\`typescript\n// Example implementation\nconst ExampleComponent = () => {\n  return (\n    <div className="p-4">\n      <h1>Generated Code</h1>\n    </div>\n  );\n};\n\nexport default ExampleComponent;\n\`\`\`\n\nThis code provides a solid foundation. Would you like me to explain any part or add more features?`,
        timestamp: new Date(),
        type: 'code'
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);

      if (onCodeGenerated && aiResponse.content.includes('```')) {
        const codeMatch = aiResponse.content.match(/```[\s\S]*?\n([\s\S]*?)```/);
        if (codeMatch) {
          onCodeGenerated(codeMatch[1]);
        }
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-slate-400">Powered by DeepSeek</p>
          </div>
        </div>
        <div className="flex space-x-1">
          {quickPrompts.map((prompt, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              onClick={() => handleSend(prompt.text)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <prompt.icon className="w-3 h-3" />
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me to build something..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
