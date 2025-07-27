import { supabase } from '@/integrations/supabase/client';
import { dynamicCodeModifier } from './dynamicCodeModifier';

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

export class RealTimeAIAgent {
  private apiKey: string | null = null;
  private isStreaming = false;

  constructor() {
    this.loadApiKey();
  }

  private async loadApiKey(): Promise<void> {
    try {
      const { data } = await supabase.functions.invoke('get-deepseek-key');
      this.apiKey = data?.key;
      console.log('🔑 DeepSeek API Key loaded:', this.apiKey ? 'Found' : 'Missing');
    } catch (error) {
      console.error('❌ Failed to load DeepSeek API key:', error);
    }
  }

  async streamCodeGeneration(
    userPrompt: string,
    onToken: (token: string) => void,
    onFileOperation: (operation: { type: 'create' | 'update' | 'delete', path: string, content?: string }) => void,
    onProgress?: (stats: StreamingStats) => void
  ): Promise<void> {
    if (!this.apiKey) {
      await this.loadApiKey();
      if (!this.apiKey) {
        throw new Error('❌ DeepSeek API key not configured. Please add it to Supabase secrets.');
      }
    }

    if (this.isStreaming) {
      throw new Error('⚠️ Already streaming a response. Please wait for completion.');
    }

    this.isStreaming = true;
    let tokenCount = 0;
    const startTime = Date.now();
    let accumulatedContent = '';

    try {
      console.log('🚀 Starting real-time AI code generation...');
      
      const systemPrompt = `You are an expert full-stack developer AI that generates complete applications in real-time.

CRITICAL INSTRUCTIONS:
1. Generate production-ready, type-safe code
2. Use React, TypeScript, Tailwind CSS, and Node.js/Express
3. Create files immediately as you think about them
4. Show your work step-by-step as you build

FILE CREATION FORMAT - Use this EXACT format:
🔧 CREATE_FILE: /path/to/file.ext
[File content here]
🔧 END_FILE

🔧 UPDATE_FILE: /path/to/file.ext  
[Updated content here]
🔧 END_FILE

EXAMPLE:
🔧 CREATE_FILE: /frontend/components/Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = variant === 'primary' 
    ? 'bg-blue-500 hover:bg-blue-600 text-white'
    : 'bg-gray-200 hover:bg-gray-300 text-gray-800';
    
  return (
    <button 
      className={\`\${baseClasses} \${variantClasses}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
🔧 END_FILE

Build exactly what the user asks for. Create files as you think about them.`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 8000,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`❌ DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('❌ No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      onProgress?.({
        tokensReceived: 0,
        responseTime: 0,
        status: 'streaming'
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i].trim();
          if (part.startsWith('data: ')) {
            const jsonStr = part.slice(6).trim();
            if (jsonStr === '[DONE]') {
              console.log('✅ Streaming complete');
              onProgress?.({
                tokensReceived: tokenCount,
                responseTime: Date.now() - startTime,
                status: 'complete'
              });
              this.isStreaming = false;
              return;
            }
            
            try {
              const parsed = JSON.parse(jsonStr);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                accumulatedContent += token;
                onToken(token);
                tokenCount++;
                
                // Process file operations in real-time
                this.processFileOperations(accumulatedContent, onFileOperation);
                
                if (onProgress && tokenCount % 10 === 0) {
                  onProgress({
                    tokensReceived: tokenCount,
                    responseTime: Date.now() - startTime,
                    status: 'streaming'
                  });
                }
              }
            } catch (e) {
              console.warn('⚠️ JSON parse error:', e);
            }
          }
        }
        
        buffer = parts[parts.length - 1];
      }

    } catch (error) {
      console.error('❌ Streaming error:', error);
      this.isStreaming = false;
      onProgress?.({
        tokensReceived: tokenCount,
        responseTime: Date.now() - startTime,
        status: 'error'
      });
      throw error;
    }
  }

  private processedOperations = new Set<string>();

  private processFileOperations(
    content: string, 
    onFileOperation: (operation: { type: 'create' | 'update' | 'delete', path: string, content?: string }) => void
  ): void {
    // Match CREATE_FILE operations
    const createMatches = content.match(/🔧 CREATE_FILE: ([^\n]+)\n([\s\S]*?)🔧 END_FILE/g);
    if (createMatches) {
      createMatches.forEach(match => {
        const operationId = `create_${match}`;
        if (this.processedOperations.has(operationId)) return;
        
        const lines = match.split('\n');
        const path = lines[0].replace('🔧 CREATE_FILE: ', '').trim();
        const content = lines.slice(1, -1).join('\n');
        
        if (path && content) {
          console.log(`🔧 Creating file: ${path}`);
          this.processedOperations.add(operationId);
          
          // Create file immediately
          dynamicCodeModifier.createFile(path, content).then(() => {
            console.log(`✅ File created: ${path}`);
          });
          
          onFileOperation({ type: 'create', path, content });
        }
      });
    }

    // Match UPDATE_FILE operations
    const updateMatches = content.match(/🔧 UPDATE_FILE: ([^\n]+)\n([\s\S]*?)🔧 END_FILE/g);
    if (updateMatches) {
      updateMatches.forEach(match => {
        const operationId = `update_${match}`;
        if (this.processedOperations.has(operationId)) return;
        
        const lines = match.split('\n');
        const path = lines[0].replace('🔧 UPDATE_FILE: ', '').trim();
        const content = lines.slice(1, -1).join('\n');
        
        if (path && content) {
          console.log(`🔧 Updating file: ${path}`);
          this.processedOperations.add(operationId);
          
          // Update file immediately
          dynamicCodeModifier.updateFile(path, content).then(() => {
            console.log(`✅ File updated: ${path}`);
          });
          
          onFileOperation({ type: 'update', path, content });
        }
      });
    }
  }

  // Helper method for quick file creation without streaming
  async createFileQuick(path: string, content: string): Promise<void> {
    await dynamicCodeModifier.createFile(path, content);
    console.log(`⚡ Quick file created: ${path}`);
  }

  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }
}

export const realTimeAIAgent = new RealTimeAIAgent();