
export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'processing' | 'completed' | 'error';
  processingTime?: number;
  tokens?: number;
}

export interface RealTimeChatProps {
  onMessage?: (message: string) => void;
  isConnected?: boolean;
  aiModel?: string;
}
