
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreamingStats {
  tokensReceived: number;
  responseTime: number;
  status: 'idle' | 'streaming' | 'complete' | 'error';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useDeepSeekAPI = () => {
  const [apiKey, setApiKey] = useState<string>('');
  
  const [streamingStats, setStreamingStats] = useState<StreamingStats>({
    tokensReceived: 0,
    responseTime: 0,
    status: 'idle'
  });

  // Load API key from Supabase secrets
  const loadApiKey = useCallback(async () => {
    try {
      const { data } = await supabase.functions.invoke('get-deepseek-key');
      if (data?.key) {
        setApiKey(data.key);
        return data.key;
      }
    } catch (error) {
      console.error('Failed to load DeepSeek API key:', error);
    }
    return null;
  }, []);

  const streamChatResponse = useCallback(async (
    messages: Message[],
    onToken: (token: string) => void,
    onProgress?: (stats: StreamingStats) => void
  ) => {
    let currentApiKey = apiKey;
    
    if (!currentApiKey) {
      currentApiKey = await loadApiKey();
      if (!currentApiKey) {
        throw new Error('DeepSeek API key is required');
      }
    }

    const startTime = Date.now();
    let tokenCount = 0;

    setStreamingStats({
      tokensReceived: 0,
      responseTime: 0,
      status: 'streaming'
    });

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          stream: true,
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                tokenCount++;
                onToken(delta);
                
                const currentStats = {
                  tokensReceived: tokenCount,
                  responseTime: Date.now() - startTime,
                  status: 'streaming' as const
                };
                
                setStreamingStats(currentStats);
                onProgress?.(currentStats);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      const finalStats = {
        tokensReceived: tokenCount,
        responseTime: Date.now() - startTime,
        status: 'complete' as const
      };

      setStreamingStats(finalStats);
      onProgress?.(finalStats);

    } catch (error) {
      const errorStats = {
        tokensReceived: tokenCount,
        responseTime: Date.now() - startTime,
        status: 'error' as const
      };

      setStreamingStats(errorStats);
      onProgress?.(errorStats);
      throw error;
    }
  }, [apiKey, loadApiKey]);

  const handleApiKeyChange = useCallback((newApiKey: string) => {
    setApiKey(newApiKey);
  }, []);

  return {
    apiKey,
    setApiKey: handleApiKeyChange,
    streamChatResponse,
    streamingStats,
    loadApiKey
  };
};
