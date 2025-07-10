
import { useState } from 'react';
import { useRealTimeValidator } from './useRealTimeValidator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

interface StreamingStats {
  tokensReceived: number;
  startTime: number;
  responseTime: number;
  status: 'idle' | 'connecting' | 'streaming' | 'complete' | 'error';
}

export const useDeepSeekAPI = () => {
  const [apiKey, setApiKey] = useState('');
  const [streamingStats, setStreamingStats] = useState<StreamingStats>({
    tokensReceived: 0,
    startTime: 0,
    responseTime: 0,
    status: 'idle'
  });
  
  const { logValidation, validateStreamToken, validateApiResponse } = useRealTimeValidator();

  const streamChatResponse = async (
    messages: Message[], 
    onToken: (token: string) => void,
    onProgress?: (stats: StreamingStats) => void
  ) => {
    if (!apiKey) {
      const error = 'Please enter your DeepSeek API key';
      logValidation('error', error);
      throw new Error(error);
    }

    logValidation('info', 'Starting DeepSeek API request with real-time streaming');
    
    const startTime = Date.now();
    setStreamingStats({
      tokensReceived: 0,
      startTime,
      responseTime: 0,
      status: 'connecting'
    });

    try {
      logValidation('info', 'Sending streaming request to DeepSeek API', {
        messageCount: messages.length,
        endpoint: 'https://api.deepseek.com/chat/completions'
      });

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorMsg = `HTTP error! status: ${response.status}`;
        logValidation('error', errorMsg);
        setStreamingStats(prev => ({ ...prev, status: 'error' }));
        throw new Error(errorMsg);
      }

      logValidation('success', 'Successfully connected to DeepSeek streaming API');

      if (!response.body) {
        const error = "No response stream available";
        logValidation('error', error);
        setStreamingStats(prev => ({ ...prev, status: 'error' }));
        throw new Error(error);
      }

      setStreamingStats(prev => ({ ...prev, status: 'streaming' }));

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let tokensReceived = 0;
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            const responseTime = Date.now() - startTime;
            logValidation('success', `Real-time stream completed. Total tokens: ${tokensReceived}, Time: ${responseTime}ms`);
            
            setStreamingStats({
              tokensReceived,
              startTime,
              responseTime,
              status: 'complete'
            });

            onProgress?.({
              tokensReceived,
              startTime,
              responseTime,
              status: 'complete'
            });
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ""; // Keep the last incomplete line in buffer
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6).trim();
              if (data === '[DONE]') {
                logValidation('info', 'Received [DONE] signal from real-time stream');
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                
                if (!validateApiResponse(parsed, { choices: true })) {
                  continue;
                }

                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                  if (validateStreamToken(token)) {
                    tokensReceived++;
                    onToken(token);
                    
                    const currentStats = {
                      tokensReceived,
                      startTime,
                      responseTime: Date.now() - startTime,
                      status: 'streaming' as const
                    };
                    
                    setStreamingStats(currentStats);
                    onProgress?.(currentStats);
                    
                    logValidation('info', `Real-time token received: ${tokensReceived}`, { token });
                  }
                }
              } catch (e) {
                logValidation('warning', 'Failed to parse JSON chunk in real-time stream', { chunk: data, error: e });
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        logValidation('info', 'Released real-time stream reader');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      logValidation('error', `DeepSeek real-time streaming error: ${errorMsg}`, error);
      
      setStreamingStats(prev => ({
        ...prev,
        status: 'error',
        responseTime: Date.now() - startTime
      }));
      
      throw error;
    }
  };

  return {
    apiKey,
    setApiKey,
    streamChatResponse,
    streamingStats
  };
};
