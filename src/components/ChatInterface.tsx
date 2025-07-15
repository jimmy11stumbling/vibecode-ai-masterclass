
import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { PromptBuilder } from './PromptBuilder';
import { CodePreview } from './CodePreview';
import { ApiKeyInput } from './ApiKeyInput';
import { TypingIndicator } from './TypingIndicator';
import { RealTimeProgress } from './RealTimeProgress';
import { ConsoleLogger } from './ConsoleLogger';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { useConsoleLogger } from '@/hooks/useConsoleLogger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
  description?: string;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to Vibecode AI! I'm here to help you master prompt engineering for full-stack development. Let's start with a simple React component. What would you like to build?",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showConsole, setShowConsole] = useState(false);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const { apiKey, setApiKey, streamChatResponse, streamingStats } = useDeepSeekAPI();
  const { logs, logInfo, logError, logWarn, clearLogs, exportLogs } = useConsoleLogger();

  // Log real-time validation info
  useEffect(() => {
    console.log('Real-time streaming stats updated:', streamingStats);
    logInfo('Streaming stats updated', streamingStats, 'ChatInterface');
  }, [streamingStats, logInfo]);

  const extractCodeFromMessage = (content: string): CodeBlock[] => {
    const codeBlocks: CodeBlock[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let blockId = 1;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      if (code) {
        codeBlocks.push({
          id: `code-${Date.now()}-${blockId}`,
          language,
          code,
          filename: `code.${language}`,
          description: `Generated ${language} code`
        });
        blockId++;
      }
    }

    return codeBlocks;
  };

  const handleSendMessage = async (content: string) => {
    console.log('User message sent:', content);
    logInfo('User message sent', { content }, 'ChatInterface');
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const conversationMessages = [...messages, userMessage];
      
      console.log('Starting real-time response streaming...');
      logInfo('Starting real-time response streaming', {}, 'ChatInterface');
      
      let fullResponse = '';
      
      await streamChatResponse(
        conversationMessages, 
        (token: string) => {
          console.log('Real-time token received:', token);
          fullResponse += token;
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: msg.content + token }
                : msg
            );
            return updated;
          });
        },
        (stats) => {
          console.log('Real-time progress update:', stats);
          logInfo('Real-time progress update', stats, 'ChatInterface');
        }
      );
      
      // Extract code blocks from the complete response
      const extractedCodeBlocks = extractCodeFromMessage(fullResponse);
      if (extractedCodeBlocks.length > 0) {
        setCodeBlocks(prev => [...prev, ...extractedCodeBlocks]);
        logInfo('Code blocks extracted', { count: extractedCodeBlocks.length }, 'ChatInterface');
      }
      
      console.log('Real-time response completed successfully');
      logInfo('Real-time response completed successfully', {}, 'ChatInterface');
    } catch (error) {
      console.error('Real-time response error:', error);
      logError('Real-time response error', error, 'ChatInterface');
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from DeepSeek API'}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCode = async (code: string, language: string) => {
    logInfo('Code execution requested', { language, codeLength: code.length }, 'ChatInterface');
    // Code execution logic would be implemented here
    console.log('Executing code:', { language, code: code.substring(0, 100) + '...' });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-full flex flex-col relative">
      <ApiKeyInput onApiKeySet={setApiKey} />
      
      {/* Real-time Progress Indicator */}
      <div className="px-6 py-2">
        <RealTimeProgress
          isStreaming={isLoading}
          tokensReceived={streamingStats.tokensReceived}
          responseTime={streamingStats.responseTime}
          status={streamingStats.status}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="chat" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                Chat
              </TabsTrigger>
              <TabsTrigger value="builder" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                Prompt Builder
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                Code Preview
              </TabsTrigger>
            </TabsList>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConsole(!showConsole)}
              className="text-white/70 hover:text-white"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Console
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0 flex flex-col">
            <MessageList 
              messages={messages} 
              isLoading={isLoading} 
            />
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="px-4 pb-2">
                <TypingIndicator 
                  isVisible={isLoading}
                  typingText={`AI is generating response... (${streamingStats.tokensReceived} tokens)`}
                  variant="pulse"
                />
              </div>
            )}
            
            <MessageInput 
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              placeholder="Describe what you want to build..."
            />
          </TabsContent>

          <TabsContent value="builder" className="h-full m-0">
            <PromptBuilder />
          </TabsContent>

          <TabsContent value="preview" className="h-full m-0">
            <CodePreview 
              codeBlocks={codeBlocks}
              onRunCode={handleRunCode}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Real-time Console Logger */}
      {showConsole && (
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-slate-900 border-t border-white/20 rounded-b-2xl overflow-hidden">
          <ConsoleLogger 
            logs={logs}
            onClear={clearLogs}
            onExport={exportLogs}
          />
        </div>
      )}
    </div>
  );
};
